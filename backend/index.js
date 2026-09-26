import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sign, verify } from 'hono/jwt'
import { PoliServices } from './services/PoliServices.js'

const app = new Hono()

// CORS Middleware
app.use('/*', cors())

// ==========================================
// RUTAS PUBLICAS (Auth)
// ==========================================
app.post('/api/v1/auth/login', async (c) => {
  const body = await c.req.json()
  const { username, password } = body

  // Mock de conductores dinámicos solicitados (camion1-6, vehiculo1-3)
  const isCamion = /^camion[1-6]$/.test(username)
  const isVehiculo = /^vehiculo[1-3]$/.test(username)
  
  if (isCamion || isVehiculo) {
    if (password !== 'driver123') { // Contraseña base para todos
      return c.json({ error: 'Credenciales inválidas' }, 401)
    }
    const payload = {
      id: username, // Usar el username como ID temporal
      username: username,
      role: 'conductor',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
    }
    const token = await sign(payload, c.env.JWT_SECRET || 'fallback-secret')
    return c.json({ token, role: 'conductor', username: username })
  }

  // Flujo normal de DB
  const query = `
    SELECT u.id_usuario as id, u.username, u.password_hash, r.nombre as role_name 
    FROM Usuario u 
    JOIN Rol r ON u.id_rol = r.id_rol 
    WHERE u.username = ?
  `
  const result = await c.env.DB.prepare(query).bind(username).first()

  if (!result || result.password_hash !== password) {
    return c.json({ error: 'Credenciales inválidas' }, 401)
  }

  const payload = {
    id: result.id,
    username: result.username,
    role: result.role_name,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
  }
  
  const token = await sign(payload, c.env.JWT_SECRET || 'fallback-secret')
  return c.json({ token, role: result.role_name, username: result.username })
})

// ==========================================
// MIDDLEWARE DE AUTENTICACION
// ==========================================
const authenticate = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No autorizado' }, 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const decodedPayload = await verify(token, c.env.JWT_SECRET || 'fallback-secret', 'HS256')
    c.set('user', decodedPayload)
  } catch (e) {
    return c.json({ error: 'Token inválido o expirado' }, 401)
  }
  await next()
}

app.use('/api/v1/data/*', authenticate)
app.use('/api/v1/auth/usuarios', authenticate)

const requireRole = (allowedRoles) => {
  return async (c, next) => {
    const user = c.get('user')
    if (!user || !allowedRoles.some(role => role.toLowerCase() === String(user.role).toLowerCase())) {
      return c.json({ error: 'Permisos insuficientes' }, 403)
    }
    await next()
  }
}

// ==========================================
// RUTAS PROTEGIDAS (REPORTES Y CONSULTAS)
// ==========================================

app.post('/api/v1/auth/usuarios', requireRole(['ADMIN']), async (c) => {
  const body = await c.req.json()
  const { username, password, role_id, nombre, apellido } = body

  if (!username || !password || !role_id || !nombre) {
    return c.json({ error: 'Faltan campos obligatorios' }, 400)
  }

  try {
    const query = `
      INSERT INTO Usuario (id_rol, username, password_hash, nombre, apellido)
      VALUES (?, ?, ?, ?, ?)
    `
    await c.env.DB.prepare(query).bind(role_id, username, password, nombre, apellido || '').run()
    return c.json({ message: 'Usuario creado exitosamente' }, 201)
  } catch (err) {
    return c.json({ error: 'Error al crear usuario. Posible nombre de usuario duplicado.' }, 500)
  }
})

app.get('/api/v1/data/roles', requireRole(['ADMIN']), async (c) => {
  const query = `SELECT id_rol, nombre, descripcion FROM Rol WHERE estado = 'ACTIVO'`
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

app.get('/api/v1/data/config', async (c) => {
  return c.json({ mapsApiKey: c.env.MAPS_API_KEY })
})

app.get('/api/v1/data/kpis', async (c) => {
  // KPIs base
  const { results: pedidosHoy } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM Pedido WHERE fecha_requerida = date('now', 'localtime')").all()
  const { results: pedidosAyer } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM Pedido WHERE fecha_requerida = date('now', '-1 day', 'localtime')").all()
  
  const entregasHoyCount = pedidosHoy[0].count
  const entregasAyerCount = pedidosAyer[0].count
  let tendenciaEntregas = entregasAyerCount > 0 ? Math.round(((entregasHoyCount - entregasAyerCount) / entregasAyerCount) * 100) : 100
  if(entregasAyerCount === 0 && entregasHoyCount === 0) tendenciaEntregas = 0;

  const { results: otifHoy } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM Pedido WHERE fecha_requerida = date('now', 'localtime') AND estado IN ('A tiempo', 'ENTREGADO')").all()
  const otifValor = entregasHoyCount > 0 ? Math.round((otifHoy[0].count / entregasHoyCount) * 100) : 0
  
  const { results: vehiculosCount } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM Vehiculo WHERE estado = 'DISPONIBLE'").all()
  
  const { results: alertasCount } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM Pedido WHERE estado IN ('Con retraso', 'En riesgo', 'Retrasada', 'FALLIDO')").all()
  const alertasValor = alertasCount[0].count
  const impactoOtif = entregasHoyCount > 0 ? Math.round((alertasValor / entregasHoyCount) * 100) : 0

  return c.json({
    entregasDiarias: { valor: entregasHoyCount.toString(), tendencia: tendenciaEntregas >= 0 ? `+${tendenciaEntregas}%` : `${tendenciaEntregas}%`, tendenciaPositiva: tendenciaEntregas >= 0, textoTendencia: 'vs. ayer' },
    otif: { valor: otifValor.toString(), tendencia: otifValor >= 90 ? '+2 pp' : '-5 pp', tendenciaPositiva: otifValor >= 90, textoTendencia: 'vs. semana anterior' },
    vehiculos: { valor: vehiculosCount[0].count.toString(), tendencia: '+10%', tendenciaPositiva: true, textoTendencia: 'activos hoy' },
    alertasActivas: { valor: alertasValor.toString(), tendencia: impactoOtif > 0 ? `-${impactoOtif}%` : '0%', tendenciaPositiva: impactoOtif === 0, textoTendencia: 'caída en OTIF' }
  })
})

app.get('/api/v1/data/alertas', async (c) => {
  const query = `
    SELECT p.id_pedido as id, p.codigo_pedido as pedido, u.direccion as destino, p.estado, p.fecha_requerida as fecha
    FROM Pedido p
    JOIN UbicacionCliente u ON p.id_ubicacion = u.id_ubicacion
    WHERE p.estado IN ('Con retraso', 'En riesgo', 'Retrasada', 'FALLIDO')
    ORDER BY p.fecha_requerida DESC
  `
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

app.get('/api/v1/data/operaciones', async (c) => {
  const query = `
    SELECT 
      p.id_pedido as id, 
      p.codigo_pedido as pedido, 
      u.direccion as destino, 
      p.ventana_horaria as ventana, 
      p.estado,
      v.patente as vehiculo,
      co.nombre as conductor
    FROM Pedido p
    JOIN UbicacionCliente u ON p.id_ubicacion = u.id_ubicacion
    LEFT JOIN ParadaRuta pr ON p.id_pedido = pr.id_pedido
    LEFT JOIN Ruta r ON pr.id_ruta = r.id_ruta
    LEFT JOIN AsignacionRuta ar ON r.id_ruta = ar.id_ruta
    LEFT JOIN Vehiculo v ON ar.id_vehiculo = v.id_vehiculo
    LEFT JOIN Conductor co ON ar.id_conductor = co.id_conductor
    ORDER BY p.id_pedido DESC
  `
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

app.get('/api/v1/data/flota', async (c) => {
  const query = `
    SELECT v.id_vehiculo as id, v.patente, c.nombre as conductor, v.estado, v.tipo
    FROM Vehiculo v
    LEFT JOIN (
      SELECT id_vehiculo, id_conductor 
      FROM AsignacionRuta ar
      JOIN Ruta r ON ar.id_ruta = r.id_ruta
      WHERE r.estado IN ('EN_CURSO', 'PLANIFICADA')
    ) asignaciones_actuales ON v.id_vehiculo = asignaciones_actuales.id_vehiculo
    LEFT JOIN Conductor c ON asignaciones_actuales.id_conductor = c.id_conductor
  `
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

app.get('/api/v1/data/rutas', async (c) => {
  const query = `
    SELECT r.id_ruta as id, r.nombre, z.nombre as zona, r.estado, r.paradas, r.distancia_km as distancia, r.tiempo_estimado as tiempoEstimado, r.avance
    FROM Ruta r
    LEFT JOIN ZonaOperativa z ON r.id_zona = z.id_zona
  `
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

// Crear Operación (Solo User, Admin)
app.post('/api/v1/data/operaciones', requireRole(['admin', 'user']), async (c) => {
  try {
    const body = await c.req.json()
    const { id, pedido, destino, ventana, vehiculo, conductor, estado, avance } = body

    if (!id || !pedido || !destino || !ventana) {
      return c.json({ error: 'Faltan campos obligatorios: id, pedido, destino, ventana' }, 400)
    }

    // Buscar route_id asociado al vehiculo indicado (si existe)
    let routeId = null
    if (vehiculo) {
      const routeResult = await c.env.DB.prepare(
        `SELECT r.id FROM routes r WHERE r.vehicle_id = ? LIMIT 1`
      ).bind(vehiculo).first()
      if (routeResult) routeId = routeResult.id
    }

    // Insertar en la tabla orders
    await c.env.DB.prepare(
      `INSERT INTO orders (id, pedido, destino, ventana_horaria, route_id, estado, avance, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, date('now', 'localtime'))`
    ).bind(
      id,
      pedido,
      destino,
      ventana,
      routeId,
      estado || 'A tiempo',
      avance ?? 0
    ).run()

    return c.json({ message: 'Operación creada exitosamente', id }, 201)
  } catch (err) {
    console.error('Error creando operación:', err)
    return c.json({ error: 'Error interno al crear la operación', detail: err.message }, 500)
  }
})

// Crear Ruta (Solo User, Admin)
app.post('/api/v1/data/rutas', requireRole(['admin', 'user']), async (c) => {
  try {
    const body = await c.req.json()
    const { id, nombre, zona, estado, vehiculo, conductor, paradas, distancia, tiempoEstimado, avance } = body

    if (!id || !nombre) {
      return c.json({ error: 'Faltan campos obligatorios: id, nombre' }, 400)
    }

    // Buscar driver_id a partir del nombre del conductor
    let driverId = null
    if (conductor) {
      const driverResult = await c.env.DB.prepare(
        `SELECT id FROM drivers WHERE nombre = ? LIMIT 1`
      ).bind(conductor).first()
      if (driverResult) driverId = driverResult.id
    }

    await c.env.DB.prepare(
      `INSERT INTO routes (id, nombre, zona, estado, vehicle_id, driver_id, paradas, distancia, tiempo_estimado, avance)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      nombre,
      zona || 'Centro',
      estado || 'Planificada',
      vehiculo || null,
      driverId,
      paradas ?? 1,
      distancia ?? 0,
      tiempoEstimado || 'N/A',
      avance ?? 0
    ).run()

    return c.json({ message: 'Ruta creada exitosamente', id }, 201)
  } catch (err) {
    console.error('Error creando ruta:', err)
    return c.json({ error: 'Error interno al crear la ruta', detail: err.message }, 500)
  }
})

// ==========================================
// NUEVOS ENDPOINTS: FLOTA Y DESPACHADOR
// ==========================================

app.get('/api/v1/data/rutas/mapa', async (c) => {
  const query = `
    SELECT 
      r.id_ruta as id, 
      r.nombre, 
      r.estado,
      cd.direccion as origen,
      cd.latitud as origen_lat,
      cd.longitud as origen_lng,
      u.direccion as destino,
      u.latitud as destino_lat,
      u.longitud as destino_lng
    FROM Ruta r
    JOIN CentroDistribucion cd ON r.id_centro = cd.id_centro
    JOIN ParadaRuta pr ON r.id_ruta = pr.id_ruta
    JOIN Pedido p ON pr.id_pedido = p.id_pedido
    JOIN UbicacionCliente u ON p.id_ubicacion = u.id_ubicacion
    WHERE r.estado IN ('PLANIFICADA', 'EN_CURSO', 'EN_RIESGO')
  `
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

// ==========================================
// RUTAS TRANSACCIONALES (POLI SERVICES)
// ==========================================

// 1. usp_POLI_CrearPedido
app.post('/api/v1/data/operaciones', requireRole(['admin', 'user', 'operador']), async (c) => {
  try { return c.json(await PoliServices.crearPedido(c.env, c.req, c.get('user')), 201); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 2. usp_POLI_CrearRuta
app.post('/api/v1/data/rutas', requireRole(['admin', 'despachador']), async (c) => {
    try { return c.json(await PoliServices.crearRuta(c.env, c.req, c.get('user')), 201); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 3. usp_POLI_AgregarParada
app.post('/api/v1/data/rutas/:id/paradas', requireRole(['admin', 'despachador']), async (c) => {
    try { return c.json(await PoliServices.agregarParada(c.env, c.req, c.get('user'), c.req.param('id')), 200); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 4. usp_POLI_AsignarRuta
app.post('/api/v1/data/rutas/:id/asignacion', requireRole(['admin', 'despachador']), async (c) => {
    try { return c.json(await PoliServices.asignarRuta(c.env, c.req, c.get('user'), c.req.param('id')), 200); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 5. usp_POLI_IniciarRuta
app.put('/api/v1/data/rutas/:id/inicio', requireRole(['admin', 'despachador', 'conductor']), async (c) => {
    try { return c.json(await PoliServices.iniciarRuta(c.env, c.req, c.get('user'), c.req.param('id')), 200); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 6. usp_POLI_RegistrarEntrega
// FIXME: Actualmente el frontend envía id_pedido mediante api.updateOperacionEstado(id).
// Esta API maneja un "fallback" comprobando id_pedido si no hay id_parada.
// Esto debe corregirse en el frontend para enviar id_parada cuando esté soportado.
app.post('/api/v1/data/entregas', requireRole(['admin', 'despachador', 'conductor']), async (c) => {
    try { return c.json(await PoliServices.registrarEntrega(c.env, c.req, c.get('user')), 200); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 7. usp_POLI_CerrarRuta
app.put('/api/v1/data/rutas/:id/cierre', requireRole(['admin', 'despachador']), async (c) => {
    try { return c.json(await PoliServices.cerrarRuta(c.env, c.req, c.get('user'), c.req.param('id')), 200); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 8. usp_POLI_CambiarTarifa
app.post('/api/v1/data/tarifas', requireRole(['admin']), async (c) => {
    try { return c.json(await PoliServices.cambiarTarifa(c.env, c.req, c.get('user')), 200); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 9. usp_POLI_CambiarDisponibilidad
app.put('/api/v1/data/recursos/:tipo/:id/disponibilidad', requireRole(['admin', 'despachador']), async (c) => {
    try { return c.json(await PoliServices.cambiarDisponibilidad(c.env, c.req, c.get('user'), c.req.param('tipo'), c.req.param('id')), 200); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 10. usp_POLI_RegistrarIncidencia
app.post('/api/v1/data/incidencias', requireRole(['admin', 'despachador', 'conductor']), async (c) => {
    try { return c.json(await PoliServices.registrarIncidencia(c.env, c.req, c.get('user')), 200); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 11. usp_POLI_ResolverIncidencia
app.put('/api/v1/data/incidencias/:id/resolucion', requireRole(['admin', 'despachador']), async (c) => {
    try { return c.json(await PoliServices.resolverIncidencia(c.env, c.req, c.get('user'), c.req.param('id')), 200); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 12. usp_POLI_DecidirOptimizacion
app.put('/api/v1/data/optimizaciones/:id/decision', requireRole(['admin', 'despachador']), async (c) => {
    try { return c.json(await PoliServices.decidirOptimizacion(c.env, c.req, c.get('user'), c.req.param('id')), 200); } catch(e) { return c.json({ error: e.message }, 400); }
})

// 13. usp_POLI_ConsultarRuta
app.get('/api/v1/data/rutas/:id/detalles', requireRole(['admin', 'despachador', 'conductor']), async (c) => {
    try { return c.json(await PoliServices.consultarRuta(c.env, c.req.param('id')), 200); } catch(e) { return c.json({ error: e.message }, 400); }
})

// ==========================================
// REPORTES (Equivalente a Query 5)
// ==========================================
app.get('/api/v1/data/reportes/otif', requireRole(['admin', 'visualizer', 'despachador']), async (c) => {
    const q = `
        SELECT r.nombre as Ruta, COUNT(p.id_parada) as TotalParadas,
        SUM(CASE WHEN p.estado = 'ENTREGADO' THEN 1 ELSE 0 END) as EntregasExitosas,
        SUM(CASE WHEN p.estado = 'FALLIDO' THEN 1 ELSE 0 END) as EntregasFallidas
        FROM Ruta r LEFT JOIN ParadaRuta p ON r.id_ruta = p.id_ruta
        GROUP BY r.id_ruta
    `;
    const { results } = await c.env.DB.prepare(q).all();
    return c.json(results);
})

app.get('/api/v1/data/reportes/costos', requireRole(['admin']), async (c) => {
    const q = `
        SELECT ar.id_ruta, t.razon_social as Transportista, tr.monto_clp as TarifaAplicada
        FROM AsignacionRuta ar
        JOIN Vehiculo v ON ar.id_vehiculo = v.id_vehiculo
        JOIN Transportista t ON v.id_transportista = t.id_transportista
        JOIN TarifaTransporte tr ON t.id_transportista = tr.id_transportista AND tr.estado = 'ACTIVO'
    `;
    const { results } = await c.env.DB.prepare(q).all();
    return c.json(results);
})

// ==========================================
// NUEVOS ENDPOINTS: IA (Gemini)
// ==========================================
app.get('/api/v1/data/ai/recomendaciones', async (c) => {
  try {
    const query = `
      SELECT p.id_pedido as id, u.direccion as destino, p.estado, p.ventana_horaria
      FROM Pedido p
      JOIN UbicacionCliente u ON p.id_ubicacion = u.id_ubicacion
      WHERE p.fecha_requerida = date('now', 'localtime')
    `
    const { results } = await c.env.DB.prepare(query).all()

    const apiKey = c.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ 
        recomendacion: '**Zetabot:** Hola! Para poder ayudarte y analizar tus rutas, por favor configura la variable de entorno `GEMINI_API_KEY` en tu proyecto de Cloudflare (o en .dev.vars si estás en local).'
      });
    }

    let promptText = "";
    if (results.length === 0) {
      promptText = "Eres Zetabot, el asistente logístico de IA oficial de POLI. Actualmente no hay pedidos registrados para hoy. Por favor, da una cálida y amistosa bienvenida al usuario (sin importar su rol) y ofrécele tu ayuda para empezar a gestionar operaciones, crear su primer pedido o planificar rutas de forma eficiente.";
    } else {
      const operacionesTexto = results.map(r => `[Pedido ${r.id}] Destino: ${r.destino}, Estado: ${r.estado}, Horario: ${r.ventana_horaria}`).join(' | ');
      promptText = `Eres Zetabot, el asistente logístico de IA experto de POLI. Analiza las siguientes operaciones en curso: ${operacionesTexto}.
      Instrucciones estrictas:
      1. Recomienda de forma breve a qué chofer/vehículo convendría enviar cada ruta basándote en la zona o eficiencia y da un porqué breve para que el operador pueda gestionarlo.
      2. Revisa si alguna ruta va atrasada o "En riesgo" y di qué se puede hacer para mejorar el tiempo y cumplir con el cliente.
      3. Sé completamente honesto: si no hay una ruta mejor para llegar a un lugar, dilo sin mentir.
      4. Indica que guardarás esta información para futuras referencias y sugerir ir más temprano la próxima vez si aplica.
      Mantén un tono profesional pero cercano, respondiendo en formato Markdown breve.`;
    }
    
    // Llamada real a Gemini API (usar header en vez de query param para keys AQ.)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    })

    const data = await response.json()
    if (data.error) {
      console.error("Gemini Error:", data.error);
      // Fallback inteligente: no mostrar error técnico al usuario
      return c.json({ recomendacion: generarRespuestaLocal(results), fallback: true });
    }
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || generarRespuestaLocal(results);
    return c.json({ recomendacion: aiText })
  } catch (err) {
    console.error("AI Endpoint Error:", err);
    return c.json({ recomendacion: generarRespuestaLocal([]), fallback: true });
  }
})

// Función de respuestas locales inteligentes cuando Gemini no está disponible
function generarRespuestaLocal(operaciones) {
  if (!operaciones || operaciones.length === 0) {
    const saludos = [
      "**Zetabot:** ¡Hola! Bienvenido al sistema POLI. Actualmente no tengo conexión activa con el motor de análisis avanzado, pero puedo ayudarte igualmente. No hay pedidos registrados para hoy — cuando crees tu primera operación, estaré listo para analizarla.",
      "**Zetabot:** ¡Buenos días! Estoy operando en modo local por el momento. No detecto pedidos programados para hoy. Te sugiero comenzar creando un nuevo pedido desde la sección de Operaciones para que pueda empezar a darte recomendaciones.",
    ];
    return saludos[Math.floor(Math.random() * saludos.length)];
  }

  let respuesta = "**Zetabot:** Estoy operando con análisis local en este momento (sin conexión al motor IA avanzado), pero revisé tus operaciones:\n\n";
  
  const pendientes = operaciones.filter(o => o.estado === 'PENDIENTE');
  const enRiesgo = operaciones.filter(o => o.estado === 'EN_RIESGO' || o.estado === 'En riesgo');
  const atrasados = operaciones.filter(o => o.estado === 'ATRASADO' || o.estado === 'Con retraso');

  if (pendientes.length > 0) {
    respuesta += `- Tienes **${pendientes.length} pedido(s) pendientes** de asignación. Te recomiendo asignarles transporte cuanto antes.\n`;
  }
  if (enRiesgo.length > 0) {
    respuesta += `- Hay **${enRiesgo.length} operación(es) en riesgo**. Revisa si puedes reasignar vehículos o recoordinar ventanas horarias.\n`;
  }
  if (atrasados.length > 0) {
    respuesta += `- **${atrasados.length} entrega(s) con retraso** detectadas. Considera contactar al cliente para informar.\n`;
  }
  if (pendientes.length === 0 && enRiesgo.length === 0 && atrasados.length === 0) {
    respuesta += `- Todas las operaciones (${operaciones.length}) están fluyendo con normalidad. ¡Buen trabajo!\n`;
  }

  respuesta += "\nSi necesitas una consulta específica, no dudes en preguntar. Intentaré reconectarme con el análisis avanzado en la próxima carga.";
  return respuesta;
}

export default app
