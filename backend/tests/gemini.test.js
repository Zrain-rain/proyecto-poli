import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { sign } from 'hono/jwt';
import app from '../index.js';
import { llamarGemini } from '../services/GeminiService.js';

const answer = text => ({ candidates: [{ finishReason:'STOP', content: { parts: [{ text }] } }] });
test('AQ se envía por encabezado a generateContent y reúne texto sin pensamientos', async () => {
 const r=await llamarGemini(' AQ.test-only ', 'Hola', undefined, {fetchImpl:async(url,options)=>{
  assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent');
  assert.equal(options.headers['x-goog-api-key'],'AQ.test-only');
  assert.equal(url.includes('AQ.'),false);
  assert.equal(JSON.parse(options.body).contents[0].parts[0].text,'Hola');
  return Response.json({candidates:[{content:{parts:[{text:'privado',thought:true},{text:'Hola'},{text:'POLI'}]}}]});
 }});
 assert.deepEqual(r,{ok:true,text:'Hola\nPOLI'});
});

test('sin clave no llama a Google y modelo se puede configurar',async()=>{
 let calls=0;
 const fetchImpl=async url=>{ calls++; assert.ok(url.endsWith('/custom-model:generateContent')); return Response.json(answer('OK')); };
 assert.equal((await llamarGemini('', 'x', undefined, {fetchImpl})).reason,'missing_key');
 assert.equal(calls,0);
 assert.equal((await llamarGemini('test','x','models/custom-model',{fetchImpl})).ok,true);
 assert.equal((await llamarGemini('test','x','bad/model',{fetchImpl})).reason,'invalid_model');
 assert.equal(calls,1);
});

for(const status of [400,401,403,404,429,500,503]) {
 test('Gemini HTTP '+status+' activa fallback',async()=>{
  const r=await llamarGemini('test','x',undefined,{fetchImpl:async()=>new Response('error',{status})});
  assert.equal(r.ok,false); assert.equal(r.text,null);
 });
}
test('red, JSON inválido, bloqueo y salida vacía permiten fallback',async()=>{
 const responses=[()=>{throw Error('network');},()=>new Response('not JSON'),()=>Response.json({}),
  ()=>Response.json({error:{message:'error'}}),
  ()=>Response.json({promptFeedback:{blockReason:'SAFETY'}}),
  ()=>Response.json({candidates:[{finishReason:'SAFETY',content:{parts:[{text:'blocked'}]}}]})];
 for(const fetchImpl of responses) assert.equal((await llamarGemini('test','x',undefined,{fetchImpl})).ok,false);
});
test('timeout aborta también una lectura de respuesta detenida',async()=>{
 const r=await llamarGemini('test','x',undefined,{timeoutMs:10,fetchImpl:async(url,{signal})=>({
  ok:true,json:()=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('abort')),{once:true}))
 })});
 assert.equal(r.reason,'timeout');
});

test('ambos endpoints responden local ante fallo y vuelven a Gemini en la siguiente solicitud',async t=>{
 let online=false;
 t.mock.method(globalThis,'fetch',async()=>online?Response.json(answer('Respuesta de Gemini')):new Response('',{status:503}));
 const env={JWT_SECRET:'test',GEMINI_API_KEY:'AQ.test-only',DB:{prepare:()=>({all:async()=>({results:[]})})}};
 const token=await sign({id:1,role:'admin',exp:Math.floor(Date.now()/1000)+60},env.JWT_SECRET);
 async function request(path){
  const chat=path.endsWith('chat');
  return app.request('/api/v1/data/ai/'+path,{method:chat?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(chat?{body:JSON.stringify({message:'hola'})}:{})},env);
 }
 for(const path of ['chat','recomendaciones']){
  const field=path==='chat'?'respuesta':'recomendacion';
  online=false;
  let res=await request(path); let data=await res.json();
  assert.equal(res.status,200); assert.equal(data.fallback,true); assert.ok(data[field]);
  online=true;
  data=await (await request(path)).json();
  assert.equal(data.fallback,false); assert.equal(data[field],'Respuesta de Gemini');
 }
 delete env.GEMINI_API_KEY;
 for(const path of ['chat','recomendaciones']) assert.equal((await (await request(path)).json()).fallback,true);
});

function browser(fetchImpl, timeout=false) {
 const cleared=[];
 const context=vm.createContext({
  window:{location:{hostname:'localhost',href:'index.html'}},
  localStorage:{getItem:()=> 'test',removeItem:key=>cleared.push(key)},
  fetch:fetchImpl,AbortController,console:{error(){}},
  setTimeout:timeout?(fn)=>setTimeout(fn,10):setTimeout,clearTimeout
 });
 vm.runInContext(readFileSync(new URL('../../frontend/js/api.js',import.meta.url),'utf8'),context);
 return {context,cleared};
}
test('navegador responde sin servidor y se recupera en la siguiente consulta',async()=>{
 let online=false;
 const {context}=browser(async()=>{if(!online) throw Error('offline');return Response.json({respuesta:'Online',fallback:false});});
 let data=await context.window.API.enviarMensajeZetabot('rutas');
 assert.equal(data.fallback,true); assert.match(data.respuesta,/Rutas/);
 data=await context.window.API.getAIRecomendaciones();
 assert.equal(data.fallback,true); assert.ok(data.recomendacion);
 online=true;
 data=await context.window.API.enviarMensajeZetabot('hola');
 assert.equal(data.fallback,false); assert.equal(data.respuesta,'Online');
});
test('navegador usa respuestas locales si servidor queda esperando o responde vacío',async()=>{
 const {context}=browser((url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('abort')),{once:true})),true);
 assert.equal((await context.window.API.enviarMensajeZetabot('pedido')).fallback,true);
 const empty=browser(async()=>Response.json({}));
 assert.equal((await empty.context.window.API.getAIRecomendaciones()).fallback,true);
});
for(const status of [401,403]){
 test('fallback no oculta autenticación HTTP '+status,async()=>{
  const {context,cleared}=browser(async()=>Response.json({error:'No autorizado'},{status}));
  await assert.rejects(context.window.API.enviarMensajeZetabot('hola'), e=>e.status===status);
  assert.equal(cleared.length,status===401?3:0);
 });
}

test('chat se inicializa aunque los KPIs no respondan; muestra fallback y escapa HTML',async()=>{
 const elements=new Map();
 function element(id=''){
  return {id,value:'',disabled:false,style:{},innerHTML:'',children:[],listeners:{},
   appendChild(child){this.children.push(child); if(child.id)elements.set(child.id,child);},
   addEventListener(name,fn){this.listeners[name]=fn;},
   remove(){elements.delete(this.id);},focus(){}};
 }
 for(const id of ['ai-recommendations-list','zetabot-chat-input','zetabot-chat-btn','zetabot-badge']) elements.set(id,element(id));
 const context=vm.createContext({
  window:{API:{
   getKPIs:()=>new Promise(()=>{}),
   getAIRecomendaciones:async()=>({recomendacion:'Local',fallback:true}),
   enviarMensajeZetabot:async()=>({respuesta:'<img src=x onerror=alert(1)>',fallback:true})
  }},
  document:{getElementById:id=>elements.get(id),createElement:()=>element()},
  console:{error(){}}
 });
 vm.runInContext(readFileSync(new URL('../../frontend/js/views/inicio.js',import.meta.url),'utf8'),context);
 vm.runInContext('initInicio()',context);
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(elements.get('zetabot-badge').innerHTML,/Respuestas locales/);
 const input=elements.get('zetabot-chat-input');
 input.value='<script>bad</script>';
 await elements.get('zetabot-chat-btn').listeners.click();
 assert.equal(input.disabled,false);
 const html=elements.get('ai-recommendations-list').children.map(el=>el.innerHTML).join('');
 assert.ok(html.includes('&lt;img'));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.equal(html.includes('<img'),false);
});
