import { AuditService } from './AuditService.js';

export class PoliServices {
    
    // ===============================================
    // 1. usp_POLI_CrearPedido -> Crear Pedido
    // ===============================================
    static async crearPedido(env, req, user) {
        const { id_cliente, id_ubicacion, codigo_pedido, fecha_requerida, ventana_horaria, peso_total, volumen_total } = await req.json();
        if (![peso_total, volumen_total].every(value => typeof value === "number" && Number.isFinite(value) && value > 0)) throw new Error("El peso y el volumen deben ser números mayores a 0.");

        const ip = req.header('CF-Connecting-IP') || 'unknown';
        const qInsert = `INSERT INTO Pedido (id_cliente, id_ubicacion, codigo_pedido, fecha_requerida, ventana_horaria, peso_total, volumen_total, estado) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDIENTE') RETURNING id_pedido`;
        
        const resultInsert = await env.DB.prepare(qInsert).bind(id_cliente, id_ubicacion, codigo_pedido, fecha_requerida, ventana_horaria, peso_total, volumen_total).first();
        if (!resultInsert) throw new Error("No se pudo crear el pedido.");
        
        const id_pedido = resultInsert.id_pedido;
        const stmtAudit = AuditService.generateLogStmt(env.DB, user.id || 1, 'Pedido', id_pedido, 'INSERT', null, { id_cliente, codigo_pedido, estado: 'PENDIENTE' }, ip);
        await env.DB.batch([stmtAudit]);
        return { id_pedido, mensaje: "Pedido creado exitosamente." };
    }

    // ===============================================
    // 2. usp_POLI_CrearRuta -> Crear Ruta
    // ===============================================
    static async crearRuta(env, req, user) {
        const { id_centro, id_zona, nombre, fecha_planificada } = await req.json();
        const ip = req.header('CF-Connecting-IP') || 'unknown';

        const qInsert = `INSERT INTO Ruta (id_centro, id_zona, nombre, fecha_planificada, estado, paradas, distancia_km) 
                         VALUES (?, ?, ?, ?, 'PLANIFICADA', 0, 0) RETURNING id_ruta`;
        
        const resultInsert = await env.DB.prepare(qInsert).bind(id_centro, id_zona, nombre, fecha_planificada).first();
        const id_ruta = resultInsert.id_ruta;

        const stmtAudit = AuditService.generateLogStmt(env.DB, user.id || 1, 'Ruta', id_ruta, 'INSERT', null, { nombre, estado: 'PLANIFICADA' }, ip);
        await env.DB.batch([stmtAudit]);
        return { id_ruta, mensaje: "Ruta creada exitosamente." };
    }

    // ===============================================
    // 3. usp_POLI_AgregarParada -> Agregar Parada a Ruta
    // ===============================================
    static async agregarParada(env, req, user, id_ruta) {
        const { id_pedido, secuencia } = await req.json();
        const ip = req.header('CF-Connecting-IP') || 'unknown';

        const pedido = await env.DB.prepare(`SELECT estado FROM Pedido WHERE id_pedido = ?`).bind(id_pedido).first();
        if (!pedido || pedido.estado !== 'PENDIENTE') throw new Error("El pedido no existe o ya está asignado.");

        const stmts = [];
        stmts.push(env.DB.prepare(`INSERT INTO ParadaRuta (id_ruta, id_pedido, secuencia, estado) VALUES (?, ?, ?, 'PENDIENTE')`).bind(id_ruta, id_pedido, secuencia));
        stmts.push(env.DB.prepare(`UPDATE Pedido SET estado = 'ASIGNADO' WHERE id_pedido = ?`).bind(id_pedido));
        stmts.push(env.DB.prepare(`UPDATE Ruta SET paradas = paradas + 1 WHERE id_ruta = ?`).bind(id_ruta));
        stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'ParadaRuta', `${id_ruta}-${id_pedido}`, 'INSERT', null, { secuencia }, ip));
        stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'Pedido', id_pedido, 'UPDATE', {estado: 'PENDIENTE'}, {estado: 'ASIGNADO'}, ip));

        await env.DB.batch(stmts);
        return { mensaje: "Parada agregada exitosamente." };
    }

    // ===============================================
    // 4. usp_POLI_AsignarRuta -> Asignar Vehiculo y Conductor
    // ===============================================
    static async asignarRuta(env, req, user, id_ruta) {
        const { id_vehiculo, id_conductor } = await req.json();
        const ip = req.header('CF-Connecting-IP') || 'unknown';

        const ruta = await env.DB.prepare(`SELECT estado FROM Ruta WHERE id_ruta = ?`).bind(id_ruta).first();
        if (!ruta || ruta.estado !== 'PLANIFICADA') throw new Error("Solo se pueden asignar rutas en estado PLANIFICADA.");

        const stmts = [];
        stmts.push(env.DB.prepare(`INSERT INTO AsignacionRuta (id_ruta, id_vehiculo, id_conductor) VALUES (?, ?, ?)`).bind(id_ruta, id_vehiculo, id_conductor));
        stmts.push(env.DB.prepare(`UPDATE Ruta SET estado = 'ASIGNADA' WHERE id_ruta = ?`).bind(id_ruta));
        stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'AsignacionRuta', `${id_ruta}`, 'INSERT', null, { id_vehiculo, id_conductor }, ip));
        stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'Ruta', id_ruta, 'UPDATE', {estado: 'PLANIFICADA'}, {estado: 'ASIGNADA'}, ip));

        await env.DB.batch(stmts);
        return { mensaje: "Ruta asignada exitosamente." };
    }

    // ===============================================
    // 5. usp_POLI_IniciarRuta -> Iniciar Ruta
    // ===============================================
    static async iniciarRuta(env, req, user, id_ruta) {
        const ip = req.header('CF-Connecting-IP') || 'unknown';
        const ruta = await env.DB.prepare(`SELECT estado FROM Ruta WHERE id_ruta = ?`).bind(id_ruta).first();
        if (!ruta || ruta.estado !== 'ASIGNADA') throw new Error("Solo se pueden iniciar rutas en estado ASIGNADA.");

        const stmts = [];
        stmts.push(env.DB.prepare(`UPDATE Ruta SET estado = 'EN_CURSO' WHERE id_ruta = ?`).bind(id_ruta));
        stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'Ruta', id_ruta, 'UPDATE', {estado: 'ASIGNADA'}, {estado: 'EN_CURSO'}, ip));
        
        await env.DB.batch(stmts);
        return { mensaje: "Ruta iniciada." };
    }

    // ===============================================
    // 6. usp_POLI_RegistrarEntrega -> Entregada o Fallida
    // ===============================================
    static async registrarEntrega(env, req, user) {
        const { id_parada, id_pedido, nuevo_estado, motivo_fallo } = await req.json();
        const ip = req.header('CF-Connecting-IP') || 'unknown';

        if (!['ENTREGADO', 'FALLIDO'].includes(nuevo_estado)) throw new Error("Estado inválido. Debe ser ENTREGADO o FALLIDO.");

        let parada = null;
        let id_pedido_real = id_pedido;

        if (id_parada) {
            parada = await env.DB.prepare(`SELECT id_parada, id_pedido, id_ruta, estado FROM ParadaRuta WHERE id_parada = ?`).bind(id_parada).first();
            if (parada) id_pedido_real = parada.id_pedido;
        } else if (id_pedido) {
            const { results } = await env.DB.prepare(`SELECT id_parada, id_pedido, id_ruta, estado FROM ParadaRuta WHERE id_pedido = ?`).bind(id_pedido).all();
            if (results.length > 1) throw new Error("El pedido tiene varias paradas. Debe indicar id_parada.");
            parada = results[0];
        }

        if (!parada) throw new Error("No se encontró una parada válida para registrar la entrega.");
        if (id_pedido && String(id_pedido) !== String(parada.id_pedido)) throw new Error("La parada no corresponde al pedido indicado.");
        id_pedido_real = parada.id_pedido;
        const ruta = await env.DB.prepare(`SELECT estado FROM Ruta WHERE id_ruta = ?`).bind(parada.id_ruta).first();
        if (!ruta || ruta.estado !== "EN_CURSO") throw new Error("Solo se pueden registrar entregas en rutas EN_CURSO.");
        const pedido = await env.DB.prepare(`SELECT estado FROM Pedido WHERE id_pedido = ?`).bind(id_pedido_real).first();
        if (!pedido) throw new Error("Pedido no encontrado.");
        if (parada.estado === nuevo_estado && pedido.estado === nuevo_estado) return { mensaje: "Entrega registrada como " + nuevo_estado + "." };

        const stmts = [];
        const timestamp = new Date().toISOString();

        if (parada) {
            stmts.push(env.DB.prepare(`UPDATE ParadaRuta SET estado = ?, hora_salida_real = ? WHERE id_parada = ?`).bind(nuevo_estado, timestamp, parada.id_parada || id_parada));
            stmts.push(env.DB.prepare(`UPDATE Ruta SET avance = COALESCE((SELECT CAST(SUM(CASE WHEN estado = 'ENTREGADO' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS INTEGER) FROM ParadaRuta WHERE id_ruta = ?), 0) WHERE id_ruta = ?`).bind(parada.id_ruta, parada.id_ruta));
            if (nuevo_estado === 'FALLIDO') {
                stmts.push(env.DB.prepare(`INSERT INTO Incidencia (id_ruta, id_parada, tipo, descripcion, estado) VALUES (?, ?, 'ENTREGA_FALLIDA', ?, 'ABIERTA')`).bind(parada.id_ruta, parada.id_parada || id_parada, motivo_fallo || 'Sin motivo reportado'));
            }
            stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'ParadaRuta', parada.id_parada || id_parada, 'UPDATE', {estado: parada.estado}, {estado: nuevo_estado}, ip));
        }

        if (id_pedido_real) {
            stmts.push(env.DB.prepare(`UPDATE Pedido SET estado = ? WHERE id_pedido = ?`).bind(nuevo_estado, id_pedido_real));
            stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'Pedido', id_pedido_real, 'UPDATE', {estado: pedido.estado}, {estado: nuevo_estado}, ip));
        }

        await env.DB.batch(stmts);
        return { mensaje: `Entrega registrada como ${nuevo_estado}.` };
    }

    // ===============================================
    // 7. usp_POLI_CerrarRuta -> Cerrar Ruta
    // ===============================================
    static async cerrarRuta(env, req, user, id_ruta) {
        const ip = req.header('CF-Connecting-IP') || 'unknown';
        const ruta = await env.DB.prepare(`SELECT estado FROM Ruta WHERE id_ruta = ?`).bind(id_ruta).first();
        if (!ruta || ruta.estado !== 'EN_CURSO') throw new Error("Solo se pueden cerrar rutas EN_CURSO.");

        const paradasPendientes = await env.DB.prepare(`SELECT COUNT(*) as count FROM ParadaRuta WHERE id_ruta = ? AND estado = 'PENDIENTE'`).bind(id_ruta).first();
        if (paradasPendientes.count > 0) throw new Error("Existen paradas pendientes. No se puede cerrar la ruta.");

        const stmts = [];
        stmts.push(env.DB.prepare(`UPDATE Ruta SET estado = 'CERRADA' WHERE id_ruta = ?`).bind(id_ruta));
        stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'Ruta', id_ruta, 'UPDATE', {estado: 'EN_CURSO'}, {estado: 'CERRADA'}, ip));
        
        await env.DB.batch(stmts);
        return { mensaje: "Ruta cerrada exitosamente. Recursos liberados." };
    }

    // ===============================================
    // 8. usp_POLI_CambiarTarifa -> Cambiar Tarifa
    // ===============================================
    static async cambiarTarifa(env, req, user) {
        const { id_transportista, id_vehiculo, id_zona, monto_clp, fecha_vigencia_desde } = await req.json();
        const ip = req.header('CF-Connecting-IP') || 'unknown';

        const stmts = [];
        // Cierra la tarifa anterior
        stmts.push(env.DB.prepare(`UPDATE TarifaTransporte SET estado = 'INACTIVO', fecha_vigencia_hasta = CURRENT_TIMESTAMP WHERE id_transportista = ? AND id_zona = ? AND estado = 'ACTIVO'`).bind(id_transportista, id_zona));
        // Crea la nueva tarifa
        stmts.push(env.DB.prepare(`INSERT INTO TarifaTransporte (id_transportista, id_vehiculo, id_zona, monto_clp, fecha_vigencia_desde, estado) VALUES (?, ?, ?, ?, ?, 'ACTIVO')`).bind(id_transportista, id_vehiculo, id_zona, monto_clp, fecha_vigencia_desde));
        // Auditoria simple para el cambio general (no capturamos id dinámico por limitación de batch, pero auditamos la acción)
        stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'TarifaTransporte', `Transportista-${id_transportista}`, 'UPDATE', null, { monto_clp, id_zona }, ip));

        await env.DB.batch(stmts);
        return { mensaje: "Tarifa actualizada." };
    }

    // ===============================================
    // 9. usp_POLI_CambiarDisponibilidad -> Cambiar Disponibilidad
    // ===============================================
    static async cambiarDisponibilidad(env, req, user, tipo, id) {
        const { nuevo_estado } = await req.json();
        const ip = req.header('CF-Connecting-IP') || 'unknown';

        const tabla = tipo === 'vehiculo' ? 'Vehiculo' : 'Conductor';
        const campoId = tipo === 'vehiculo' ? 'id_vehiculo' : 'id_conductor';

        const stmts = [];
        stmts.push(env.DB.prepare(`UPDATE ${tabla} SET estado = ? WHERE ${campoId} = ?`).bind(nuevo_estado, id));
        stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, tabla, id, 'UPDATE', null, { estado: nuevo_estado }, ip));

        await env.DB.batch(stmts);
        return { mensaje: "Disponibilidad actualizada." };
    }

    // ===============================================
    // 10. usp_POLI_RegistrarIncidencia -> Registrar Incidencia
    // ===============================================
    static async registrarIncidencia(env, req, user) {
        const { id_ruta, id_parada, tipo, descripcion } = await req.json();
        const ip = req.header('CF-Connecting-IP') || 'unknown';

        const stmts = [];
        stmts.push(env.DB.prepare(`INSERT INTO Incidencia (id_ruta, id_parada, tipo, descripcion, estado) VALUES (?, ?, ?, ?, 'ABIERTA')`).bind(id_ruta, id_parada, tipo, descripcion));
        stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'Incidencia', `Ruta-${id_ruta}`, 'INSERT', null, { tipo, descripcion }, ip));

        await env.DB.batch(stmts);
        return { mensaje: "Incidencia registrada." };
    }

    // ===============================================
    // 11. usp_POLI_ResolverIncidencia -> Resolver Incidencia
    // ===============================================
    static async resolverIncidencia(env, req, user, id_incidencia) {
        const ip = req.header('CF-Connecting-IP') || 'unknown';

        const stmts = [];
        stmts.push(env.DB.prepare(`UPDATE Incidencia SET estado = 'RESUELTA' WHERE id_incidencia = ?`).bind(id_incidencia));
        stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'Incidencia', id_incidencia, 'UPDATE', { estado: 'ABIERTA' }, { estado: 'RESUELTA' }, ip));

        await env.DB.batch(stmts);
        return { mensaje: "Incidencia resuelta." };
    }

    // ===============================================
    // 12. usp_POLI_DecidirOptimizacion -> Decidir Recomendación IA
    // ===============================================
    static async decidirOptimizacion(env, req, user, id_recomendacion) {
        const { decision } = await req.json(); // ACEPTADA, RECHAZADA
        const ip = req.header('CF-Connecting-IP') || 'unknown';

        const stmts = [];
        stmts.push(env.DB.prepare(`UPDATE RecomendacionIA SET estado_decision = ? WHERE id_recomendacion = ?`).bind(decision, id_recomendacion));
        stmts.push(AuditService.generateLogStmt(env.DB, user.id || 1, 'RecomendacionIA', id_recomendacion, 'UPDATE', null, { estado_decision: decision }, ip));

        await env.DB.batch(stmts);
        return { mensaje: `Recomendación ${decision}.` };
    }

    // ===============================================
    // 13. usp_POLI_ConsultarRuta -> Consultar Ruta y Paradas
    // ===============================================
    static async consultarRuta(env, id_ruta) {
        const cabecera = await env.DB.prepare(`SELECT * FROM Ruta WHERE id_ruta = ?`).bind(id_ruta).first();
        if (!cabecera) throw new Error("Ruta no encontrada.");

        const { results: paradas } = await env.DB.prepare(`SELECT * FROM ParadaRuta WHERE id_ruta = ? ORDER BY secuencia ASC`).bind(id_ruta).all();
        
        return { ruta: cabecera, paradas };
    }
}
