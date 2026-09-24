-- ==========================================
-- MIGRACIÓN 0001: ARQUITECTURA POLI
-- ==========================================
-- PRAGMAS
PRAGMA foreign_keys = ON;

-- ==========================================
-- 1. SEGURIDAD
-- ==========================================
CREATE TABLE IF NOT EXISTS Rol (
    id_rol INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    estado TEXT DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'INACTIVO'))
);

CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    id_rol INTEGER NOT NULL,
    id_conductor INTEGER, -- FK opcional si es conductor
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT,
    estado TEXT DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'INACTIVO')),
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
);

-- ==========================================
-- 2. CLIENTES Y UBICACIONES
-- ==========================================
CREATE TABLE IF NOT EXISTS RubroCliente (
    id_rubro INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Cliente (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    id_rubro INTEGER,
    rut TEXT UNIQUE,
    razon_social TEXT NOT NULL,
    estado TEXT DEFAULT 'ACTIVO',
    FOREIGN KEY (id_rubro) REFERENCES RubroCliente(id_rubro)
);

CREATE TABLE IF NOT EXISTS ZonaOperativa (
    id_zona INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS UbicacionCliente (
    id_ubicacion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_zona INTEGER,
    direccion TEXT NOT NULL,
    latitud REAL,
    longitud REAL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_zona) REFERENCES ZonaOperativa(id_zona)
);

CREATE TABLE IF NOT EXISTS CentroDistribucion (
    id_centro INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    direccion TEXT NOT NULL,
    latitud REAL,
    longitud REAL
);

-- ==========================================
-- 3. RECURSOS
-- ==========================================
CREATE TABLE IF NOT EXISTS Transportista (
    id_transportista INTEGER PRIMARY KEY AUTOINCREMENT,
    rut TEXT UNIQUE,
    razon_social TEXT NOT NULL,
    estado TEXT DEFAULT 'ACTIVO'
);

CREATE TABLE IF NOT EXISTS Vehiculo (
    id_vehiculo INTEGER PRIMARY KEY AUTOINCREMENT,
    id_transportista INTEGER,
    id_legacy TEXT,
    patente TEXT NOT NULL UNIQUE,
    tipo TEXT DEFAULT 'Camión',
    capacidad_peso REAL,
    capacidad_volumen REAL,
    propiedad TEXT DEFAULT 'PROPIO' CHECK(propiedad IN ('PROPIO', 'TERCERO')),
    estado TEXT DEFAULT 'DISPONIBLE',
    FOREIGN KEY (id_transportista) REFERENCES Transportista(id_transportista)
);

CREATE TABLE IF NOT EXISTS Conductor (
    id_conductor INTEGER PRIMARY KEY AUTOINCREMENT,
    id_transportista INTEGER,
    id_legacy TEXT,
    rut TEXT UNIQUE,
    nombre TEXT NOT NULL,
    apellido TEXT,
    telefono TEXT,
    estado TEXT DEFAULT 'DISPONIBLE',
    FOREIGN KEY (id_transportista) REFERENCES Transportista(id_transportista)
);

CREATE TABLE IF NOT EXISTS TarifaTransporte (
    id_tarifa INTEGER PRIMARY KEY AUTOINCREMENT,
    id_transportista INTEGER,
    id_vehiculo INTEGER,
    id_zona INTEGER,
    monto_clp INTEGER NOT NULL,
    fecha_vigencia_desde TEXT NOT NULL,
    fecha_vigencia_hasta TEXT,
    estado TEXT DEFAULT 'ACTIVO',
    FOREIGN KEY (id_transportista) REFERENCES Transportista(id_transportista),
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo),
    FOREIGN KEY (id_zona) REFERENCES ZonaOperativa(id_zona)
);

-- ==========================================
-- 4. PLANIFICACIÓN Y OPERACIÓN
-- ==========================================
CREATE TABLE IF NOT EXISTS Pedido (
    id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_ubicacion INTEGER NOT NULL,
    id_legacy TEXT,
    codigo_pedido TEXT NOT NULL UNIQUE,
    fecha_requerida TEXT NOT NULL,
    ventana_horaria TEXT NOT NULL,
    peso_total REAL,
    volumen_total REAL,
    estado TEXT DEFAULT 'PENDIENTE',
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_ubicacion) REFERENCES UbicacionCliente(id_ubicacion)
);

CREATE TABLE IF NOT EXISTS Ruta (
    id_ruta INTEGER PRIMARY KEY AUTOINCREMENT,
    id_centro INTEGER NOT NULL,
    id_zona INTEGER,
    id_legacy TEXT,
    nombre TEXT NOT NULL,
    fecha_planificada TEXT NOT NULL,
    estado TEXT DEFAULT 'PLANIFICADA',
    paradas INTEGER DEFAULT 0,
    distancia_km REAL DEFAULT 0,
    tiempo_estimado TEXT,
    avance INTEGER DEFAULT 0,
    FOREIGN KEY (id_centro) REFERENCES CentroDistribucion(id_centro),
    FOREIGN KEY (id_zona) REFERENCES ZonaOperativa(id_zona)
);

CREATE TABLE IF NOT EXISTS AsignacionRuta (
    id_asignacion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_ruta INTEGER NOT NULL,
    id_vehiculo INTEGER NOT NULL,
    id_conductor INTEGER NOT NULL,
    fecha_asignacion TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ruta) REFERENCES Ruta(id_ruta),
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo),
    FOREIGN KEY (id_conductor) REFERENCES Conductor(id_conductor)
);

CREATE TABLE IF NOT EXISTS ParadaRuta (
    id_parada INTEGER PRIMARY KEY AUTOINCREMENT,
    id_ruta INTEGER NOT NULL,
    id_pedido INTEGER NOT NULL,
    secuencia INTEGER NOT NULL,
    estado TEXT DEFAULT 'PENDIENTE',
    hora_llegada_estimada TEXT,
    hora_llegada_real TEXT,
    hora_salida_real TEXT,
    FOREIGN KEY (id_ruta) REFERENCES Ruta(id_ruta),
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido)
);

CREATE TABLE IF NOT EXISTS Incidencia (
    id_incidencia INTEGER PRIMARY KEY AUTOINCREMENT,
    id_ruta INTEGER,
    id_parada INTEGER,
    tipo TEXT NOT NULL,
    descripcion TEXT,
    fecha_reporte TEXT DEFAULT CURRENT_TIMESTAMP,
    estado TEXT DEFAULT 'ABIERTA',
    FOREIGN KEY (id_ruta) REFERENCES Ruta(id_ruta),
    FOREIGN KEY (id_parada) REFERENCES ParadaRuta(id_parada)
);

-- ==========================================
-- 5. TELEMETRÍA, IA Y AUDITORÍA
-- ==========================================
CREATE TABLE IF NOT EXISTS RecomendacionIA (
    id_recomendacion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_ruta INTEGER,
    tipo TEXT,
    prompt_usado TEXT,
    respuesta_ia TEXT,
    fecha_generacion TEXT DEFAULT CURRENT_TIMESTAMP,
    estado_decision TEXT DEFAULT 'PENDIENTE',
    FOREIGN KEY (id_ruta) REFERENCES Ruta(id_ruta)
);

CREATE TABLE IF NOT EXISTS Auditoria (
    id_auditoria INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    tabla_afectada TEXT NOT NULL,
    registro_id TEXT NOT NULL,
    accion TEXT NOT NULL CHECK(accion IN ('INSERT', 'UPDATE', 'DELETE')),
    valor_anterior TEXT,
    valor_nuevo TEXT,
    fecha_hora TEXT DEFAULT CURRENT_TIMESTAMP,
    ip_origen TEXT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- ==========================================
-- 6. MIGRACIÓN DE DATOS (Conservación)
-- ==========================================

-- 6.1. Roles
INSERT INTO Rol (id_rol, nombre, descripcion)
SELECT id, role_name, 'Migrado de roles v1' FROM roles;

-- 6.2. Usuarios
INSERT INTO Usuario (id_usuario, id_rol, username, password_hash, nombre, apellido)
SELECT id, role_id, username, password_hash, username, 'Migrado' FROM users;

-- 6.3. Clientes y CD Por Defecto
INSERT INTO Cliente (id_cliente, razon_social) VALUES (1, 'Cliente General Migrado');
INSERT INTO CentroDistribucion (id_centro, nombre, direccion) VALUES (1, 'CD Principal (Lampa)', 'Lampa, RM');
INSERT INTO ZonaOperativa (id_zona, nombre) VALUES (1, 'Zona General');

-- 6.4. Vehiculos
INSERT INTO Vehiculo (id_legacy, patente, estado, tipo)
SELECT id, patente, estado, tipo FROM vehicles;

-- 6.5. Conductores
INSERT INTO Conductor (id_legacy, nombre, estado)
SELECT id, nombre, estado FROM drivers;

-- 6.6. Rutas
INSERT INTO Ruta (id_legacy, id_centro, id_zona, nombre, fecha_planificada, estado, paradas, distancia_km, tiempo_estimado, avance)
SELECT id, 1, 1, nombre, date('now'), estado, paradas, distancia, tiempo_estimado, avance FROM routes;

-- 6.7. Asignacion (reconstruyendo a partir de routes v1)
INSERT INTO AsignacionRuta (id_ruta, id_vehiculo, id_conductor)
SELECT 
    r_new.id_ruta, 
    v_new.id_vehiculo, 
    c_new.id_conductor
FROM routes r_old
JOIN Ruta r_new ON r_old.id = r_new.id_legacy
JOIN Vehiculo v_new ON r_old.vehicle_id = v_new.id_legacy
JOIN Conductor c_new ON r_old.driver_id = c_new.id_legacy;

-- 6.8. Pedidos
INSERT INTO UbicacionCliente (id_ubicacion, id_cliente, id_zona, direccion)
SELECT ROW_NUMBER() OVER (ORDER BY id), 1, 1, destino FROM orders;

INSERT INTO Pedido (id_legacy, id_cliente, id_ubicacion, codigo_pedido, fecha_requerida, ventana_horaria, estado)
SELECT o.id, 1, u.id_ubicacion, o.pedido, o.fecha, o.ventana_horaria, o.estado 
FROM orders o
JOIN UbicacionCliente u ON o.destino = u.direccion;

-- 6.9 Paradas (reconstruyendo desde orders v1)
INSERT INTO ParadaRuta (id_ruta, id_pedido, secuencia, estado)
SELECT 
    r_new.id_ruta,
    p_new.id_pedido,
    1,
    p_new.estado
FROM orders o_old
JOIN Ruta r_new ON o_old.route_id = r_new.id_legacy
JOIN Pedido p_new ON o_old.id = p_new.id_legacy;

-- ==========================================
-- 7. ELIMINACIÓN DE TABLAS LEGACY
-- ==========================================
DROP TABLE orders;
DROP TABLE routes;
DROP TABLE drivers;
DROP TABLE vehicles;
DROP TABLE users;
DROP TABLE roles;
DROP TABLE kpis;
