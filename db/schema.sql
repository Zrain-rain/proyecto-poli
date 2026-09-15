-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name TEXT NOT NULL UNIQUE
);

-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Vehículos
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  patente TEXT NOT NULL,
  estado TEXT DEFAULT 'Disponible'
);

-- Conductores
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  estado TEXT DEFAULT 'Disponible'
);

-- Rutas
CREATE TABLE IF NOT EXISTS routes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  zona TEXT,
  estado TEXT DEFAULT 'Planificada',
  vehicle_id TEXT,
  driver_id TEXT,
  paradas INTEGER DEFAULT 0,
  distancia INTEGER DEFAULT 0,
  tiempo_estimado TEXT,
  avance INTEGER DEFAULT 0,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Pedidos (Operaciones)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  pedido TEXT NOT NULL,
  destino TEXT NOT NULL,
  ventana_horaria TEXT NOT NULL,
  route_id TEXT,
  estado TEXT DEFAULT 'Pendiente',
  avance INTEGER DEFAULT 0,
  FOREIGN KEY (route_id) REFERENCES routes(id)
);

-- KPIs (Tabla auxiliar simple para métricas del dashboard si no se calculan on the fly)
CREATE TABLE IF NOT EXISTS kpis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  tendencia TEXT,
  tendencia_positiva BOOLEAN,
  texto_tendencia TEXT
);
