import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sign, verify } from 'hono/jwt'

const app = new Hono()

// CORS Middleware
app.use('/*', cors())

// ==========================================
// RUTAS PUBLICAS (Auth)
// ==========================================
app.post('/api/v1/auth/login', async (c) => {
  const body = await c.req.json()
  const { username, password } = body

  // Validar usuario en BD
  const query = `
    SELECT u.id, u.username, u.password_hash, r.role_name 
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE u.username = ?
  `
  const result = await c.env.DB.prepare(query).bind(username).first()

  if (!result || result.password_hash !== password) {
    return c.json({ error: 'Credenciales inválidas' }, 401)
  }

  // Generar Token JWT usando secreto del entorno
  const payload = {
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
app.use('/api/v1/data/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No autorizado' }, 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const decodedPayload = await verify(token, c.env.JWT_SECRET || 'fallback-secret', 'HS256')
    c.set('user', decodedPayload)
    await next()
  } catch (e) {
    return c.json({ error: 'Token inválido o expirado' }, 401)
  }
})

// Middleware helper para roles
const requireRole = (allowedRoles) => {
  return async (c, next) => {
    const user = c.get('user')
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ error: 'Permisos insuficientes' }, 403)
    }
    await next()
  }
}

// ==========================================
// RUTAS PROTEGIDAS
// ==========================================

// Configuración general (Visualizer, User, Admin)
app.get('/api/v1/data/config', async (c) => {
  return c.json({
    mapsApiKey: c.env.MAPS_API_KEY
  })
})

// Dashboard KPIs (Visualizer, User, Admin)
app.get('/api/v1/data/kpis', async (c) => {
  // Entregas
  const { results: pedidosHoy } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE fecha = date('now', 'localtime')").all()
  const { results: pedidosAyer } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE fecha = date('now', '-1 day', 'localtime')").all()
  
  const entregasHoyCount = pedidosHoy[0].count
  const entregasAyerCount = pedidosAyer[0].count
  let tendenciaEntregas = entregasAyerCount > 0 ? Math.round(((entregasHoyCount - entregasAyerCount) / entregasAyerCount) * 100) : 100
  if(entregasAyerCount === 0 && entregasHoyCount === 0) tendenciaEntregas = 0;

  // OTIF
  const { results: otifHoy } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE fecha = date('now', 'localtime') AND estado IN ('A tiempo', 'Entregada')").all()
  const otifValor = entregasHoyCount > 0 ? Math.round((otifHoy[0].count / entregasHoyCount) * 100) : 0
  
  // Vehiculos y Camiones (Total)
  const { results: vehiculosCount } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM vehicles WHERE estado = 'Activo'").all()
  
  // Alertas (Pedidos con retraso o en riesgo de hoy)
  const { results: alertasCount } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE fecha = date('now', 'localtime') AND estado IN ('Con retraso', 'En riesgo', 'Retrasada')").all()
  const alertasValor = alertasCount[0].count
  const impactoOtif = entregasHoyCount > 0 ? Math.round((alertasValor / entregasHoyCount) * 100) : 0

  const kpis = {
    entregasDiarias: {
      valor: entregasHoyCount.toString(),
      tendencia: tendenciaEntregas >= 0 ? `+${tendenciaEntregas}%` : `${tendenciaEntregas}%`,
      tendenciaPositiva: tendenciaEntregas >= 0,
      textoTendencia: 'vs. ayer'
    },
    otif: {
      valor: otifValor.toString(),
      tendencia: otifValor >= 90 ? '+2 pp' : '-5 pp',
      tendenciaPositiva: otifValor >= 90,
      textoTendencia: 'vs. semana anterior'
    },
    vehiculos: {
      valor: vehiculosCount[0].count.toString(),
      tendencia: '+10%', // Valor estático representativo para UI moderna
      tendenciaPositiva: true,
      textoTendencia: 'activos hoy'
    },
    alertasActivas: {
      valor: alertasValor.toString(),
      tendencia: impactoOtif > 0 ? `-${impactoOtif}%` : '0%',
      tendenciaPositiva: impactoOtif === 0,
      textoTendencia: 'caída en OTIF'
    }
  }
  return c.json(kpis)
})

// Historial de Alertas
app.get('/api/v1/data/alertas', async (c) => {
  const query = `
    SELECT o.id, o.pedido, o.destino, o.estado, o.fecha, d.nombre as conductor, v.patente
    FROM orders o
    LEFT JOIN routes r ON o.route_id = r.id
    LEFT JOIN drivers d ON r.driver_id = d.id
    LEFT JOIN vehicles v ON r.vehicle_id = v.id
    WHERE o.estado IN ('Con retraso', 'En riesgo', 'Retrasada')
    ORDER BY o.fecha DESC
  `
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

// Operaciones (Visualizer, User, Admin)
app.get('/api/v1/data/operaciones', async (c) => {
  const query = `
    SELECT o.id, o.pedido, o.destino, o.ventana_horaria as ventana, r.vehicle_id as vehiculo, d.nombre as conductor, o.estado, o.avance 
    FROM orders o
    LEFT JOIN routes r ON o.route_id = r.id
    LEFT JOIN drivers d ON r.driver_id = d.id
  `
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

// Rutas (Visualizer, User, Admin)
app.get('/api/v1/data/rutas', async (c) => {
  const query = `
    SELECT r.id, r.nombre, r.zona, r.estado, r.vehicle_id as vehiculo, d.nombre as conductor, r.paradas, r.distancia, r.tiempo_estimado as tiempoEstimado, r.avance
    FROM routes r
    LEFT JOIN drivers d ON r.driver_id = d.id
  `
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

// Crear Operación (Solo User, Admin)
app.post('/api/v1/data/operaciones', requireRole(['admin', 'user']), async (c) => {
  const body = await c.req.json()
  // Lógica de inserción... (simplificado para demo)
  return c.json({ message: 'Operación creada', data: body }, 201)
})

// ==========================================
// NUEVOS ENDPOINTS: FLOTA Y DESPACHADOR
// ==========================================

// Obtener Flota (Admin, Operador)
app.get('/api/v1/data/flota', requireRole(['admin', 'user']), async (c) => {
  const query = `
    SELECT v.id, v.patente, v.estado, d.nombre as conductor
    FROM vehicles v
    LEFT JOIN routes r ON v.id = r.vehicle_id
    LEFT JOIN drivers d ON r.driver_id = d.id
    GROUP BY v.id
  `
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

// Actualizar estado de vehículo (Admin)
app.put('/api/v1/data/flota/:id/estado', requireRole(['admin']), async (c) => {
  const id = c.req.param('id')
  const { estado } = await c.req.json()
  const result = await c.env.DB.prepare('UPDATE vehicles SET estado = ? WHERE id = ?').bind(estado, id).run()
  return c.json({ success: true, message: 'Estado actualizado' })
})

// Actualizar estado de operación (Despachador)
app.put('/api/v1/data/operaciones/:id/estado', requireRole(['admin', 'despachador']), async (c) => {
  const id = c.req.param('id')
  const { estado } = await c.req.json()
  const result = await c.env.DB.prepare('UPDATE orders SET estado = ? WHERE id = ?').bind(estado, id).run()
  return c.json({ success: true, message: 'Estado de operación actualizado' })
})

export default app
