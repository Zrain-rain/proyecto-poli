import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { sign } from 'hono/jwt';
import app from '../index.js';

function fixture() {
 const sql = new DatabaseSync(':memory:');
 const migration = readFileSync(new URL('../../db/migrations/0001_poli_architecture.sql', import.meta.url), 'utf8');
 sql.exec(migration.split('-- 6. MIGRACIÓN DE DATOS')[0]);
 sql.exec("INSERT INTO Rol (id_rol,nombre) VALUES (1,'admin'),(2,'conductor'); INSERT INTO Usuario (id_usuario,id_rol,username,password_hash,nombre) VALUES (1,1,'admin','test','Admin'); INSERT INTO Cliente (id_cliente,razon_social) VALUES (1,'Test'); INSERT INTO UbicacionCliente (id_ubicacion,id_cliente,direccion) VALUES (1,1,'Test'); INSERT INTO CentroDistribucion (id_centro,nombre,direccion) VALUES (1,'CD','Test'); INSERT INTO Ruta (id_ruta,id_centro,nombre,fecha_planificada,estado,paradas) VALUES (1,1,'Ruta','2026-09-23','EN_CURSO',0); INSERT INTO Pedido (id_pedido,id_cliente,id_ubicacion,codigo_pedido,fecha_requerida,ventana_horaria,estado) VALUES (1,1,1,'P1','2026-09-23','08-18','ASIGNADO'),(2,1,1,'P2','2026-09-23','08-18','PENDIENTE'); INSERT INTO ParadaRuta (id_parada,id_ruta,id_pedido,secuencia) VALUES (1,1,1,1);");
 const DB = {
  prepare(query) {
   let args = [];
   const stmt = {
    bind(...values) { args = values; return stmt; },
    async first() { return sql.prepare(query).get(...args) ?? null; },
    async all() { return { results: sql.prepare(query).all(...args) }; },
    async run() { return sql.prepare(query).run(...args); }
   };
   return stmt;
  },
  async batch(stmts) {
   sql.exec('BEGIN');
   try { const results=[]; for (const stmt of stmts) results.push(await stmt.run()); sql.exec('COMMIT'); return results; }
   catch(e) { sql.exec('ROLLBACK'); throw e; }
  }
 };
 const env = { DB, JWT_SECRET: 'local-test-secret' };
 async function request(path, body, role='admin', method='POST') {
  const headers = { 'Content-Type':'application/json' };
  if (role) headers.Authorization = 'Bearer ' + await sign({ id:1, role, exp:Math.floor(Date.now()/1000)+60 }, env.JWT_SECRET);
  return app.request('/api/v1/'+path, { method, headers, ...(body === undefined ? {} : {body:JSON.stringify(body)}) }, env);
 }
 return {sql,request};
}

test('crear usuarios autentica y autoriza admin sin distinguir mayúsculas', async () => {
 const {sql,request}=fixture();
 try {
  const body={username:'new',password:'test',role_id:2,nombre:'Nuevo'};
  assert.equal((await request('auth/usuarios',body,null)).status,401);
  assert.equal((await request('auth/usuarios',body,'conductor')).status,403);
  assert.equal((await request('auth/usuarios',body)).status,201);
  assert.equal((await request('data/roles',undefined,'ADMIN','GET')).status,200);
  assert.equal((await request('data/roles',undefined,'admin','GET')).status,200);
 } finally {sql.close();}
});

test('pedido rechaza peso ausente, nulo, texto o no positivo; acepta números válidos', async () => {
 const {sql,request}=fixture();
 try {
  const body={id_cliente:1,id_ubicacion:1,codigo_pedido:'P3',fecha_requerida:'2026-09-23',ventana_horaria:'08-18',volumen_total:1};
  for(const peso_total of [undefined,null,'abc','10',0,-1]) assert.equal((await request('data/operaciones',{...body,peso_total})).status,400);
  assert.equal((await request('data/operaciones',{...body,peso_total:10},'ADMIN')).status,201);
 } finally {sql.close();}
});

test('entrega rechaza identificadores ausentes, inexistentes o contradictorios sin mutar datos', async () => {
 const {sql,request}=fixture();
 try {
  for(const ids of [{},{id_pedido:2},{id_parada:99,id_pedido:1},{id_parada:1,id_pedido:2}]) {
   assert.equal((await request('data/entregas',{...ids,nuevo_estado:'ENTREGADO'})).status,400);
  }
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM Auditoria').get().n,0);
  assert.equal(sql.prepare('SELECT estado FROM Pedido WHERE id_pedido=1').get().estado,'ASIGNADO');
 } finally {sql.close();}
});

test('entrega solo permite rutas en curso', async () => {
 const {sql,request}=fixture();
 try {
  for(const estado of ['PLANIFICADA','ASIGNADA','CERRADA']) {
   sql.prepare('UPDATE Ruta SET estado=?').run(estado);
   assert.equal((await request('data/entregas',{id_pedido:1,nuevo_estado:'ENTREGADO'})).status,400);
  }
 } finally {sql.close();}
});

test('entrega recalcula avance real y reintentos no duplican incidencias ni auditoría', async () => {
 const {sql,request}=fixture();
 try {
  const body={id_pedido:1,nuevo_estado:'FALLIDO'};
  assert.equal((await request('data/entregas',body)).status,200);
  assert.equal((await request('data/entregas',body)).status,200);
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM Incidencia').get().n,1);
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM Auditoria').get().n,2);
  assert.equal((await request('data/entregas',{...body,nuevo_estado:'ENTREGADO'})).status,200);
  assert.equal(sql.prepare('SELECT avance FROM Ruta').get().avance,100);
  assert.equal((await request('data/entregas',body)).status,200);
  assert.equal(sql.prepare('SELECT avance FROM Ruta').get().avance,0);
  const last=sql.prepare("SELECT valor_anterior FROM Auditoria WHERE tabla_afectada='Pedido' ORDER BY id_auditoria DESC LIMIT 1").get();
  assert.equal(JSON.parse(last.valor_anterior).estado,'ENTREGADO');
 } finally {sql.close();}
});

test('pedido con varias paradas exige selección explícita', async () => {
 const {sql,request}=fixture();
 try {
  sql.exec("INSERT INTO ParadaRuta (id_ruta,id_pedido,secuencia) VALUES (1,1,2)");
  assert.equal((await request('data/entregas',{id_pedido:1,nuevo_estado:'ENTREGADO'})).status,400);
  assert.equal((await request('data/entregas',{id_parada:1,nuevo_estado:'ENTREGADO'})).status,200);
  assert.equal(sql.prepare('SELECT avance FROM Ruta').get().avance,50);
 } finally {sql.close();}
});

test('fallo de auditoría revierte entrega completa', async () => {
 const {sql,request}=fixture();
 try {
  sql.exec("CREATE TRIGGER reject_audit BEFORE INSERT ON Auditoria BEGIN SELECT RAISE(ABORT,'test rollback'); END;");
  assert.equal((await request('data/entregas',{id_pedido:1,nuevo_estado:'FALLIDO'})).status,400);
  assert.equal(sql.prepare('SELECT estado FROM ParadaRuta').get().estado,'PENDIENTE');
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM Incidencia').get().n,0);
 } finally {sql.close();}
});

for (const [status, endpoint, cleared] of [[403,'/data/roles',false],[401,'/data/roles',true],[401,'/auth/login',false]]) {
 test('frontend HTTP '+status+' en '+endpoint+' conserva o limpia sesión correctamente',async()=>{
  const removed=[];
  const context=vm.createContext({
   window:{location:{hostname:'localhost',href:'index.html'}},
   localStorage:{getItem:()=> 'token',removeItem:key=>removed.push(key)},
   fetch:async()=>({status,ok:false,json:async()=>({error:'Rechazado'})}),
   console:{error(){}}
  });
  vm.runInContext(readFileSync(new URL('../../frontend/js/api.js',import.meta.url),'utf8'),context);
  await assert.rejects(vm.runInContext('fetchAPI('+JSON.stringify(endpoint)+')',context));
  assert.equal(removed.length,cleared?3:0);
  assert.equal(context.window.location.href,cleared?'login.html':'index.html');
 });
}
