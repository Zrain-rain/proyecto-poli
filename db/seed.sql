-- Limpiar tablas si existen datos (para pruebas)
DELETE FROM orders;
DELETE FROM routes;
DELETE FROM drivers;
DELETE FROM vehicles;
DELETE FROM users;
DELETE FROM roles;
DELETE FROM kpis;

-- Roles (admin, user, visualizer, despachador)
INSERT INTO roles (id, role_name) VALUES (1, 'admin');
INSERT INTO roles (id, role_name) VALUES (2, 'user');
INSERT INTO roles (id, role_name) VALUES (3, 'visualizer');
INSERT INTO roles (id, role_name) VALUES (4, 'despachador');

-- Usuarios
INSERT INTO users (username, password_hash, role_id) VALUES ('admin', 'admin123', 1);
INSERT INTO users (username, password_hash, role_id) VALUES ('operador', 'operador123', 2);
INSERT INTO users (username, password_hash, role_id) VALUES ('cliente', 'cliente123', 3);
INSERT INTO users (username, password_hash, role_id) VALUES ('conductor1', 'camion123', 4);

-- Vehículos (Mezcla de Camiones y Vehículos)
INSERT INTO vehicles (id, patente, estado, tipo) VALUES ('V-101', 'AB-CD-12', 'Activo', 'Camión');
INSERT INTO vehicles (id, patente, estado, tipo) VALUES ('V-118', 'EF-GH-34', 'Activo', 'Camión');
INSERT INTO vehicles (id, patente, estado, tipo) VALUES ('V-207', 'IJ-KL-56', 'Activo', 'Vehículo');
INSERT INTO vehicles (id, patente, estado, tipo) VALUES ('V-176', 'MN-OP-78', 'Inactivo', 'Camión');
INSERT INTO vehicles (id, patente, estado, tipo) VALUES ('V-093', 'QR-ST-90', 'Activo', 'Vehículo');

-- Conductores
INSERT INTO drivers (id, nombre, estado) VALUES ('D-1', 'F. Contreras', 'Activo');
INSERT INTO drivers (id, nombre, estado) VALUES ('D-2', 'A. Morales', 'Activo');
INSERT INTO drivers (id, nombre, estado) VALUES ('D-3', 'M. Silva', 'Activo');

-- Rutas
INSERT INTO routes (id, nombre, zona, estado, vehicle_id, driver_id, paradas, distancia, tiempo_estimado, avance) VALUES
('R1', 'Ruta Providencia', 'Oriente', 'Activa', 'V-101', 'D-1', 1, 20, '1 h 10 min', 100),
('R2', 'Ruta Maipú', 'Poniente', 'Activa', 'V-118', 'D-2', 1, 35, '1 h 55 min', 50),
('R3', 'Ruta Quilicura', 'Norte', 'Activa', 'V-207', 'D-3', 1, 15, '1 h 25 min', 10);

-- Pedidos (Operaciones) - 3 de hoy, 1 de ayer
-- HOY
INSERT INTO orders (id, pedido, destino, ventana_horaria, route_id, estado, avance, fecha) VALUES
('#E4581', 'P-78231', 'Av. Providencia 1200, Providencia, Chile', '08:00 - 10:00', 'R1', 'Entregada', 100, date('now', 'localtime')),
('#E4582', 'P-78232', 'Av. Pajaritos 3000, Maipú, Chile', '09:00 - 11:00', 'R2', 'A tiempo', 50, date('now', 'localtime')),
('#E4583', 'P-78233', 'Av. Manuel Antonio Matta 500, Quilicura, Chile', '11:00 - 12:00', 'R3', 'Con retraso', 10, date('now', 'localtime'));

-- AYER (Para cálculos vs día anterior)
INSERT INTO orders (id, pedido, destino, ventana_horaria, route_id, estado, avance, fecha) VALUES
('#E4580', 'P-78230', 'Plaza de Armas, Santiago, Chile', '10:00 - 12:00', 'R1', 'Entregada', 100, date('now', '-1 day', 'localtime'));
