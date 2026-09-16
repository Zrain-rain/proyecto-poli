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

-- Usuarios (Contraseñas estáticas "123456" hasheadas si usáramos bcrypt real, aquí por simplicidad se validará como string en JWT demo, o se pondrá un hash real en JS)
-- Aquí por seguridad usaremos un texto plano en db para el ejemplo simple o un hash si es necesario.
INSERT INTO users (username, password_hash, role_id) VALUES ('admin', 'admin123', 1);
INSERT INTO users (username, password_hash, role_id) VALUES ('operador', 'operador123', 2);
INSERT INTO users (username, password_hash, role_id) VALUES ('cliente', 'cliente123', 3);
INSERT INTO users (username, password_hash, role_id) VALUES ('conductor1', 'camion123', 4);

-- Vehículos
INSERT INTO vehicles (id, patente, estado) VALUES ('V-101', 'AB-CD-12', 'Activo');
INSERT INTO vehicles (id, patente, estado) VALUES ('V-118', 'EF-GH-34', 'Activo');
INSERT INTO vehicles (id, patente, estado) VALUES ('V-207', 'IJ-KL-56', 'Activo');
INSERT INTO vehicles (id, patente, estado) VALUES ('V-176', 'MN-OP-78', 'Activo');
INSERT INTO vehicles (id, patente, estado) VALUES ('V-093', 'QR-ST-90', 'Activo');
INSERT INTO vehicles (id, patente, estado) VALUES ('V-220', 'UV-WX-12', 'Activo');

-- Conductores
INSERT INTO drivers (id, nombre, estado) VALUES ('D-1', 'F. Contreras', 'Activo');
INSERT INTO drivers (id, nombre, estado) VALUES ('D-2', 'A. Morales', 'Activo');
INSERT INTO drivers (id, nombre, estado) VALUES ('D-3', 'M. Silva', 'Activo');
INSERT INTO drivers (id, nombre, estado) VALUES ('D-4', 'D. Torres', 'Activo');
INSERT INTO drivers (id, nombre, estado) VALUES ('D-5', 'C. Ramírez', 'Activo');
INSERT INTO drivers (id, nombre, estado) VALUES ('D-6', 'S. Vega', 'Activo');

-- Rutas
INSERT INTO routes (id, nombre, zona, estado, vehicle_id, driver_id, paradas, distancia, tiempo_estimado, avance) VALUES
('R1', 'Centro', 'Centro', 'Activa', 'V-101', 'D-1', 16, 58, '3 h 10 min', 100),
('R2', 'Norte', 'Norte', 'Planificada', 'V-118', 'D-2', 14, 72, '3 h 55 min', 0),
('R3', 'Oriente', 'Oriente', 'Activa', 'V-207', 'D-3', 18, 64, '3 h 25 min', 68),
('R4', 'Poniente', 'Poniente', 'En riesgo', 'V-176', 'D-4', 15, 83, '4 h 20 min', 30);

-- Pedidos (Operaciones)
INSERT INTO orders (id, pedido, destino, ventana_horaria, route_id, estado, avance) VALUES
('#E4581', 'P-78231', 'Providencia', '08:00 - 10:00', 'R1', 'A tiempo', 100),
('#E4582', 'P-78232', 'Maipú', '09:00 - 11:00', 'R2', 'Entregada', 100),
('#E4583', 'P-78233', 'Las Condes', '11:00 - 12:00', 'R3', 'En riesgo', 68),
('#E4584', 'P-78234', 'Ñuñoa', '12:00 - 14:00', 'R1', 'A tiempo', 45),
('#E4585', 'P-78235', 'Quilicura', '13:00 - 15:00', 'R4', 'Retrasada', 20),
('#E4586', 'P-78236', 'Pudahuel', '14:00 - 16:00', 'R2', 'A tiempo', 30);

-- KPIs
INSERT INTO kpis (key, valor, tendencia, tendencia_positiva, texto_tendencia) VALUES
('entregasDiarias', '3.800', '+12%', 1, 'vs. ayer'),
('otif', '78', '+5 pp', 1, 'vs. semana anterior'),
('vehiculos', '210', '+8%', 1, 'vs. mes anterior'),
('alertasActivas', '12', '+3', 0, 'vs. ayer');
