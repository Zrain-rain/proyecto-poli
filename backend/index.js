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
    const decodedPayload = await verify(token, c.env.JWT_SECRET || 'fallback-secret')
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
  const { results } = await c.env.DB.prepare('SELECT * FROM kpis').all()
  // Transform array into object for easy frontend use
  const kpis = {}
  results.forEach(row => {
    kpis[row.key] = {
      valor: row.valor,
      tendencia: row.tendencia,
      tendenciaPositiva: !!row.tendencia_positiva,
      textoTendencia: row.texto_tendencia
    }
  })
  return c.json(kpis)
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
