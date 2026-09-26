import os
import re

# 1. Update backend/index.js
file_path_idx = 'backend/index.js'
with open(file_path_idx, 'r', encoding='utf-8') as f:
    text_idx = f.read()

# Delete the fake POST /api/v1/data/operaciones block
old_route_pattern = r'// Crear Operación \(Solo User, Admin\)\napp\.post\(\'/api/v1/data/operaciones\', requireRole\(\[\'admin\', \'user\'\]\), async \(c\) => \{.*?\}\)\n'
text_idx = re.sub(old_route_pattern, '', text_idx, flags=re.DOTALL)

with open(file_path_idx, 'w', encoding='utf-8') as f:
    f.write(text_idx)

# 2. Update backend/services/PoliServices.js
file_path_serv = 'backend/services/PoliServices.js'
with open(file_path_serv, 'r', encoding='utf-8') as f:
    text_serv = f.read()

# Replace crearPedido
old_crear = r'static async crearPedido\(env, req, user\) \{.*?(?=\s+// ===============================================\n\s+// 2. usp_POLI_CrearRuta)'
new_crear = '''static async crearPedido(env, req, user) {
        const payload = await req.json();
        const { id_cliente, direccion, latitud, longitud, codigo_pedido, fecha_requerida, ventana_horaria, peso_total, volumen_total } = payload;
        
        if (![peso_total, volumen_total].every(value => typeof value === "number" && Number.isFinite(value) && value > 0)) {
            throw new Error("El peso y el volumen deben ser números mayores a 0.");
        }

        const ip = req.header('CF-Connecting-IP') || 'unknown';

        // 1. Crear UbicacionCliente o verificar existente (simplificado a crear nueva siempre para este endpoint)
        const qUbicacion = `INSERT INTO UbicacionCliente (id_cliente, direccion, latitud, longitud) 
                            VALUES (?, ?, ?, ?) RETURNING id_ubicacion`;
        const resultUbicacion = await env.DB.prepare(qUbicacion).bind(id_cliente || 1, direccion, latitud, longitud).first();
        if (!resultUbicacion) throw new Error("No se pudo crear la ubicación del cliente.");
        const id_ubicacion = resultUbicacion.id_ubicacion;

        // 2. Crear Pedido
        const qInsert = `INSERT INTO Pedido (id_cliente, id_ubicacion, codigo_pedido, fecha_requerida, ventana_horaria, peso_total, volumen_total, estado) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDIENTE') RETURNING id_pedido`;
        
        const resultInsert = await env.DB.prepare(qInsert).bind(id_cliente || 1, id_ubicacion, codigo_pedido, fecha_requerida, ventana_horaria, peso_total, volumen_total).first();
        if (!resultInsert) throw new Error("No se pudo crear el pedido.");
        
        const id_pedido = resultInsert.id_pedido;
        const stmtAudit = AuditService.generateLogStmt(env.DB, user.id || 1, 'Pedido', id_pedido, 'INSERT', null, { id_cliente, codigo_pedido, estado: 'PENDIENTE' }, ip);
        await env.DB.batch([stmtAudit]);
        return { id_pedido, mensaje: "Pedido creado exitosamente." };
    }'''

text_serv = re.sub(old_crear, new_crear, text_serv, flags=re.DOTALL)

with open(file_path_serv, 'w', encoding='utf-8') as f:
    f.write(text_serv)

print("Backend actualizado")
