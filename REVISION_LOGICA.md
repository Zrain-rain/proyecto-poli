# Revisión de lógica de POLI — 23 de septiembre de 2026

## Actualización de Producción y Merge — 24 de septiembre de 2026
- Se descargaron los cambios del repositorio remoto y se resolvieron conflictos en 10 archivos.
- Se mantuvo la funcionalidad avanzada de la UI local (Rutas en mapa con Google Maps, asignaciones interactuables de conductores, y flujos de PoliServices).
- Se integraron los nuevos endpoints del remote (`/api/v1/data/operaciones` y `/api/v1/data/rutas`) y la invalidación de caché (`?v=5`) para los scripts en producción.
- Se auditaron las interfaces eliminando sugerencias y contraseñas expuestas en el login para ajustarse a los requerimientos de producción.
- Se comprobó la integridad de `styles.css` (las llaves coinciden perfectamente) y la ausencia de marcadores de conflicto de Git en todo el código fuente.
- Las vistas locales de frontend prevalecieron para conservar las integraciones operativas avanzadas frente a los placeholders remotos, previniendo errores de eliminación de secciones o desalineación de botones.

## Alcance
Revisión del repositorio local, README, TECHNICAL, REPORTE, backend, flujos principales del frontend y migración SQL. No se identificó la conversación previa de Poli entre las conversaciones accesibles. No se consultó ni modificó producción, no se ejecutaron migraciones y no se desplegó.

El repositorio estaba sin cambios al comenzar. El parche no modifica tablas ni dependencias de producción. No garantiza ausencia de errores ni constituye una auditoría completa de seguridad.

## Correcciones locales
- backend/index.js: autentica POST /auth/usuarios; antes requireRole siempre recibía un usuario ausente. Las guardias de rutas comparan roles sin distinguir mayúsculas.
- frontend/js/api.js: un 403 informa el rechazo y conserva la sesión; un 401 de una operación protegida elimina token, rol y usuario. El login fallido muestra su error sin redireccionarse a sí mismo.
- backend/services/PoliServices.js: peso y volumen deben ser números finitos positivos; rechaza campos ausentes, null y texto.
- Entregas: exige parada existente, coherencia pedido/parada y ruta EN_CURSO. Mantiene id_pedido cuando tiene una sola parada; si hay varias, exige id_parada.
- Entregas: recalcula avance desde las paradas reales tanto al entregar como al registrar fallo. Evita dividir por Ruta.paradas, que puede estar desactualizado.
- Una repetición secuencial del mismo resultado ya persistido no reinserta incidencia/auditoría. No garantiza idempotencia de solicitudes simultáneas.
- Auditoría de pedido registra el estado anterior consultado en lugar de asumir ASIGNADO.

## Pruebas
Ejecutar npm test desde backend. Requiere Node con node:sqlite (verificado con Node 25.9.0). Diez pruebas pasan con Hono y SQLite real en memoria, usando las tablas de la migración y un adaptador de API D1. Cubren permisos, entradas inválidas, rechazo sin mutaciones, avance, repetición secuencial, selección de parada y rollback por fallo de auditoría. El cliente se prueba en un contexto JavaScript aislado.
Pendiente antes de publicar: prueba integral en ensayo con esquema y estados equivalentes a producción. No se verificaron bindings, credenciales ni datos reales de Cloudflare.

## Hallazgos pendientes

### P1 — El pedido pierde la dirección ingresada
frontend/js/views/operacion.js exige dirección/comuna pero no las envía. Envía id_ubicacion: 1 e id_cliente: 1; backend utiliza esa ubicación. El destino guardado puede diferir del digitado.
Siguiente corrección: seleccionar cliente y ubicación reales o crear ubicación y pedido atómicamente. No modificar ubicaciones compartidas.

### P1 — Conductor fijo y pedidos simulados
frontend/js/views/operacion.js asigna siempre id_conductor = 1. frontend/js/views/conductor.js selecciona pedidos mediante un hash del nombre de usuario, sin usar asignaciones reales.
Siguiente corrección: vincular Usuario.id_conductor, seleccionar conductores válidos y filtrar/autorizar operaciones en backend por esa identidad. Requiere verificar los vínculos existentes de cuentas.

### P1 — Credenciales y autorización
backend/index.js admite conductores simulados con contraseña compartida, compara contraseñas directamente y tiene un secreto JWT de respaldo fijo. Los usuarios simulados tienen ID de texto incompatible con la FK numérica de Auditoria. No comprueba que el conductor que registra una entrega esté asignado a su ruta; las consultas exponen operaciones globales a usuarios autenticados.
Siguiente corrección: transición controlada a cuentas reales, contraseñas con hash, JWT_SECRET obligatorio y autorización por asignación. Coordinar con el vínculo usuario/conductor para evitar bloquear usuarios actuales.

### P1 — Asignaciones y recursos
asignarRuta no verifica disponibilidad/capacidad de vehículo ni disponibilidad de conductor. iniciarRuta/cerrarRuta no actualizan recursos pese al mensaje de liberación. El frontend puede ofrecer vehículos ocupados.
Crear ruta, agregar parada, asignar e iniciar son cuatro peticiones: un fallo parcial deja los cambios anteriores persistidos. agregarParada no valida estado de ruta. Las comprobaciones previas a batch no impiden carreras concurrentes.
Siguiente corrección: despacho transaccional, condiciones de escritura y reserva de recursos. Analizar duplicados antes de agregar restricciones únicas.

### P2 — Consultas de flota y operaciones
GET /data/flota omite ASIGNADA; varias asignaciones pueden duplicar vehículos. GET /data/operaciones multiplica filas con varias paradas/asignaciones históricas. El mapa también omite ASIGNADA.
Siguiente corrección: definir asignación vigente explícita sin ocultar arbitrariamente conflictos históricos.

### P2 — Indicadores y fechas
El frontend envía fecha_requerida como ISO completo; KPIs e IA comparan texto con date(...), pudiendo excluir pedidos creados desde la interfaz. localtime del servidor no establece America/Santiago. OTIF cuenta ENTREGADO sin comparar ventana/fecha real; algunas tendencias son constantes.
Siguiente corrección: definir fecha operativa chilena, normalizar entradas/consultas y calcular métricas reales.

### P2 — Tarifas y costos
cambiarTarifa desactiva tarifas del transportista/zona sin distinguir vehículo y usa hora actual aunque la vigencia sea futura. El reporte cruza tarifas por transportista/estado sin filtrar vehículo, zona ni vigencia, pudiendo multiplicar costos.
Requiere precisar tarifa general/específica y fecha aplicable.

### P2 — ZetaBot y alertas
El backend genera respuestas simuladas para ciertas claves y afirma guardar patrones sin persistirlos. No se verificó disponibilidad del modelo externo configurado. Alertas consulta Pedido, pero registrar/resolver incidencias modifica Incidencia: resolver una incidencia no necesariamente retira la alerta.
Siguiente corrección: distinguir recomendaciones reales de mensajes estáticos, eliminar afirmaciones de almacenamiento inexistente y unificar ciclo de vida de alertas.

### P2 — Creación y auditoría separadas
crearPedido/crearRuta insertan primero y auditan en otro batch. Si falla auditoría, la API informa error aunque exista el registro.
Siguiente corrección: creación y auditoría atómicas conservando IDs devueltos.

## Orden de continuación
1. Ubicaciones reales y vínculo usuario/conductor.
2. Despacho atómico, disponibilidad y autorización por ruta.
3. Consultas, fechas, indicadores y alertas.
4. Tarifas e integración real de IA.

Antes de desplegar este parche, verificar en ensayo que las rutas operativas utilizan EN_CURSO y que las entregas por id_pedido tienen una sola parada. El rechazo de entradas ambiguas es deliberado; el parche no repara datos históricos.
