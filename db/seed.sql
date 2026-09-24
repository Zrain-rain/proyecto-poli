-- ==========================================
-- SEED DATA - POLI ARCHITECTURE (HISTORICAL DATA)
-- ==========================================
PRAGMA foreign_keys = ON;

-- Limpieza Segura (En orden inverso a las dependencias)
DELETE FROM Auditoria;
DELETE FROM RecomendacionIA;
DELETE FROM Incidencia;
DELETE FROM ParadaRuta;
DELETE FROM AsignacionRuta;
DELETE FROM Ruta;
DELETE FROM Pedido;
DELETE FROM TarifaTransporte;
DELETE FROM Conductor;
DELETE FROM Vehiculo;
DELETE FROM Transportista;
DELETE FROM CentroDistribucion;
DELETE FROM UbicacionCliente;
DELETE FROM ZonaOperativa;
DELETE FROM Cliente;
DELETE FROM RubroCliente;
DELETE FROM Usuario;
DELETE FROM Rol;

-- ==========================================
-- 1. ROLES Y USUARIOS
-- ==========================================
INSERT INTO Rol (id_rol, nombre, descripcion) VALUES 
(1, 'ADMIN', 'Administrador Total'),
(2, 'VISUALIZADOR', 'Acceso de solo lectura a dashboards'),
(3, 'CHOFER', 'Acceso móvil para despachos');

-- Contraseñas en plano temporalmente (o usar un hash por defecto si el worker asume bcrypt)
-- El worker actual de poli no hace hash sofisticado o el login usa username=admin password=admin?
-- En el backend/index.js se valida la BD. Usaremos contraseñas claras por ahora si la BD guarda texto plano, o 'admin123'
INSERT INTO Usuario (id_usuario, id_rol, username, password_hash, nombre, apellido) VALUES
(1, 1, 'admin', 'admin123', 'Administrador', 'Poli'),
(2, 2, 'visualizador', 'vis123', 'Observador', 'Global');

-- ==========================================
-- 2. INFRAESTRUCTURA Y CLIENTES
-- ==========================================
INSERT INTO CentroDistribucion (id_centro, nombre, direccion, latitud, longitud) VALUES 
(1, 'CD Lampa (Principal)', 'Camino las flores 1008, Lampa, Chile', -33.2847, -70.8717),
(2, 'CD Quilicura (Secundario)', 'Av. Américo Vespucio 1501, Quilicura, Chile', -33.3644, -70.7107);

INSERT INTO ZonaOperativa (id_zona, nombre) VALUES 
(1, 'Zona Norte'), (2, 'Zona Sur'), (3, 'Zona Oriente'), (4, 'Zona Poniente');

INSERT INTO Cliente (id_cliente, razon_social) VALUES 
(1, 'Retail Las Condes S.A.'),
(2, 'Supermercados Maipú Limitada'),
(3, 'Tienda Providencia');

INSERT INTO UbicacionCliente (id_ubicacion, id_cliente, id_zona, direccion) VALUES 
(1, 1, 3, 'Av. Apoquindo 4501, Las Condes, Chile'),
(2, 2, 4, 'Av. Pajaritos 3000, Maipú, Chile'),
(3, 3, 3, 'Av. Providencia 1200, Providencia, Chile'),
(4, 1, 1, 'Av. Manuel Antonio Matta 500, Quilicura, Chile');

-- ==========================================
-- 3. VEHÍCULOS Y CONDUCTORES
-- ==========================================
INSERT INTO Transportista (id_transportista, rut, razon_social) VALUES 
(1, '76.123.456-7', 'Transportes Andes S.A.');

INSERT INTO Vehiculo (id_vehiculo, id_transportista, patente, tipo, estado) VALUES 
(1, 1, 'AB-CD-12', 'Camión', 'DISPONIBLE'),
(2, 1, 'EF-GH-34', 'Camión', 'DISPONIBLE'),
(3, 1, 'IJ-KL-56', 'Liviano', 'EN_RUTA'),
(4, 1, 'MN-OP-78', 'Liviano', 'MANTENCION');

INSERT INTO Conductor (id_conductor, id_transportista, rut, nombre, apellido, estado) VALUES 
(1, 1, '12.345.678-9', 'Felipe', 'Contreras', 'DISPONIBLE'),
(2, 1, '15.678.901-2', 'Andrés', 'Morales', 'DISPONIBLE'),
(3, 1, '18.901.234-5', 'Mario', 'Silva', 'EN_RUTA');

-- Agregar Choferes como Usuarios
INSERT INTO Usuario (id_rol, id_conductor, username, password_hash, nombre, apellido) VALUES
(3, 1, 'fcontreras', 'chofer123', 'Felipe', 'Contreras'),
(3, 2, 'amorales', 'chofer123', 'Andrés', 'Morales'),
(3, 3, 'msilva', 'chofer123', 'Mario', 'Silva');

-- ==========================================
-- 4. HISTORIAL DE OPERACIONES (PARA KPI DE ATRASOS)
-- ==========================================
-- Rutas del pasado
INSERT INTO Ruta (id_ruta, id_centro, id_zona, nombre, fecha_planificada, estado, paradas, distancia_km, tiempo_estimado, avance) VALUES
(1, 1, 3, 'Ruta Providencia Ayer', date('now', '-1 day', 'localtime'), 'CERRADA', 1, 20.5, '1 h 10 min', 100),
(2, 2, 4, 'Ruta Maipú Ayer', date('now', '-1 day', 'localtime'), 'CERRADA', 1, 35.0, '1 h 55 min', 100),
(3, 1, 1, 'Ruta Quilicura Anteayer', date('now', '-2 days', 'localtime'), 'CERRADA', 1, 15.0, '1 h 05 min', 100);

-- Asignaciones pasadas
INSERT INTO AsignacionRuta (id_ruta, id_vehiculo, id_conductor) VALUES
(1, 1, 1), (2, 2, 2), (3, 3, 3);

-- Pedidos pasados
INSERT INTO Pedido (id_pedido, id_cliente, id_ubicacion, codigo_pedido, fecha_requerida, ventana_horaria, estado) VALUES
(1, 3, 3, 'P-78230', date('now', '-1 day', 'localtime'), '08:00 - 10:00', 'ENTREGADO'),
(2, 2, 2, 'P-78231', date('now', '-1 day', 'localtime'), '09:00 - 11:00', 'ENTREGADO'),
(3, 1, 4, 'P-78232', date('now', '-2 days', 'localtime'), '11:00 - 12:00', 'ENTREGADO');

-- Paradas pasadas (La de Maipú llegó ATRASADA)
INSERT INTO ParadaRuta (id_parada, id_ruta, id_pedido, secuencia, estado, hora_llegada_real) VALUES
(1, 1, 1, 1, 'COMPLETADA', date('now', '-1 day', 'localtime') || ' 09:30:00'), -- A tiempo
(2, 2, 2, 1, 'COMPLETADA', date('now', '-1 day', 'localtime') || ' 11:45:00'), -- ATRASADA (debía ser antes de las 11:00)
(3, 3, 3, 1, 'COMPLETADA', date('now', '-2 days', 'localtime') || ' 11:15:00'); -- A tiempo

-- ==========================================
-- 5. OPERACIONES ACTIVAS DE HOY (PARA EL MAPA)
-- ==========================================
-- Rutas de Hoy
INSERT INTO Ruta (id_ruta, id_centro, id_zona, nombre, fecha_planificada, estado, paradas, distancia_km, tiempo_estimado, avance) VALUES
(4, 1, 3, 'Ruta Las Condes Hoy', date('now', 'localtime'), 'EN_CURSO', 1, 28.5, '1 h 40 min', 50),
(5, 2, 4, 'Ruta Maipú Express', date('now', 'localtime'), 'PLANIFICADA', 1, 12.0, '0 h 45 min', 0),
(6, 1, 1, 'Ruta Quilicura Urgente', date('now', 'localtime'), 'EN_RIESGO', 1, 18.0, '1 h 20 min', 10);

-- Asignaciones de Hoy
INSERT INTO AsignacionRuta (id_ruta, id_vehiculo, id_conductor) VALUES
(4, 1, 1), (5, 2, 2), (6, 3, 3);

-- Pedidos de Hoy
INSERT INTO Pedido (id_pedido, id_cliente, id_ubicacion, codigo_pedido, fecha_requerida, ventana_horaria, estado) VALUES
(4, 1, 1, 'P-78233', date('now', 'localtime'), '14:00 - 16:00', 'EN_TRANSITO'),
(5, 2, 2, 'P-78234', date('now', 'localtime'), '16:00 - 18:00', 'PENDIENTE'),
(6, 1, 4, 'P-78235', date('now', 'localtime'), '10:00 - 12:00', 'ATRASADO');

-- Paradas de Hoy
INSERT INTO ParadaRuta (id_parada, id_ruta, id_pedido, secuencia, estado) VALUES
(4, 4, 4, 1, 'EN_CAMINO'),
(5, 5, 5, 1, 'PENDIENTE'),
(6, 6, 6, 1, 'ATRASADA');
