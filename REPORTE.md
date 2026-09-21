# Reporte de Iteraciones y Trabas (POLI)

Este documento registra los problemas, trabas y tareas pendientes identificadas tras cada iteración del desarrollo para asegurar que no se pierdan errores y se puedan reparar o mejorar posteriormente.

## Iteración 1: Migración a Cloudflare (Actual)

### Trabas y Problemas Encontrados:
- **Refactorización Completa de Vistas Frontend:** Las vistas actuales (`inicio.js`, `operacion.js`, `rutas.js`) aún están fuertemente acopladas al objeto estático `mockData`. Hay que reescribir la lógica de renderizado de cada archivo para que espere las Promesas de `window.API` antes de inyectar el HTML.
- **Gráficos en Dashboard:** Chart.js en `inicio.js` requiere datos asíncronos. Actualmente está síncrono. Esto lanzará errores o renderizará vacío si no se adapta.
- **Manejo de CORS en Local:** Asegurar que `wrangler dev` en el puerto 8787 esté permitiendo explícitamente solicitudes del servidor estático local del frontend, o los fetch fallarán.
- **Almacenamiento de Contraseñas:** Actualmente las contraseñas están en texto plano en la base de datos (para fines de la demostración simple). Se debe considerar encriptar con `bcrypt` u otro hash nativo (Crypto Web API) en futuras iteraciones si pasa a producción real.
- **Bug de Sesión Expirada (Hono JWT):** Se solucionó un problema crítico donde el sistema botaba la sesión inmediatamente después del login. Esto ocurría porque la función `verify` de `hono/jwt` en sus versiones más recientes exige especificar explícitamente el algoritmo (ej. `HS256`) como medida de seguridad. Al omitirse, el middleware lanzaba un error, rechazando todas las peticiones con 401.

### Mejoras Pendientes
- Implementar validación estricta de variables de entorno en el Worker para `JWT_SECRET` en lugar de un string en duro en el código.

## Iteración 2: Sistema en tiempo real, Flota y Despachador (Completado)

### Avances:
- **Refactorización de Assets:** Se ha creado la carpeta `frontend/img` y se han movido todas las imágenes (png, jpeg) sueltas en la raíz hacia este directorio para mayor orden. Los archivos HTML fueron actualizados.
- **Base de datos conectada:** Se eliminó por completo el archivo estático `data.js`. Todas las vistas (`inicio.js`, `operacion.js`, `rutas.js`) fueron reescritas para consumir datos reales de la base de datos a través del objeto `window.API` con promesas asíncronas.
- **Módulo de Flota (Admin):** Se añadió el módulo `flota.js` y los endpoints correspondientes en el Worker (`GET /api/v1/data/flota`, `PUT /api/v1/data/flota/:id/estado`) permitiendo que el administrador active o desactive camiones.
- **Módulo de Despachador (Mobile-First):** Se agregó el rol `despachador` a la DB. Se construyó el módulo `despachador.js` con diseño 100% responsivo y botones táctiles gigantes, permitiendo al conductor actualizar el estado de sus pedidos (Entregado, Con Retraso) mediante el nuevo endpoint `PUT /api/v1/data/operaciones/:id/estado`.
- **Rutas y UI basada en roles:** Se actualizó `app.js` para mostrar u ocultar menús dependiendo del rol actual (Admin ve Flota, Despachador ve únicamente Mis Entregas).

### Credenciales de Usuario (Semilla Actual)
Para acceder a la plataforma y probar los roles, utiliza las siguientes credenciales:
- **Admin**: Usuario: `admin` | Clave: `admin123` (Acceso completo + Flota)
- **Despachador**: Usuario: `conductor1` | Clave: `camion123` (Vista móvil exclusiva)
- **Operador**: Usuario: `operador` | Clave: `operador123`
- **Cliente**: Usuario: `cliente` | Clave: `cliente123`

## Iteración 3: Mapas Dinámicos, Analítica y Mejoras UI (Completado)

### Avances:
- **Ruteo Google Maps (fitBounds)**: Se añadió la ubicación central de Lampa de manera persistente en el mapa. Se programó el motor de mapas para ajustar automáticamente el nivel de zoom (`fitBounds`) abarcando desde la base hasta los destinos de los camiones, permitiendo al usuario además hacer zoom in/out manualmente.
- **Gráficos y KPIs Dinámicos**: El Worker ahora calcula en tiempo real los KPIs de Vehículos, OTIF (A tiempo vs Retraso) y el comparativo contra el día anterior en base a una nueva columna `fecha` agregada a la tabla `orders`. El gráfico de barras extrae la data agrupándola por ventanas horarias.
- **Diferenciación de Flota**: Se modificó la tabla `vehicles` con la columna `tipo` para distinguir "Camiones" de "Vehículos", y se habilitó la visualización de ambas opciones en el menú lateral.
- **Módulo de Reportes y Alertas**: Se crearon dos vistas nuevas, `alertas.js` (para ver el historial detallado de demoras) y `reportes.js` (para ver un pie-chart analítico y el rendimiento horario).
- **Reloj y Menú Hamburguesa**: Se mejoró la navegación implementando un menú colapsable lateral y un reloj en tiempo real para mantener la plataforma siempre al día en el entorno visual.

## Iteración 4: IA de Gemini y Fijación de Mapas (Actual)

### Avances:
- **Inteligencia Artificial Gemini**: Se creó el endpoint `/api/v1/data/ai/recomendaciones` en el Worker, el cual lee la operación actual de la base de datos y se comunica de forma segura usando la API Key de Gemini. Gemini retorna recomendaciones logísticas (como reasignación de choferes o proyecciones de rutas).
- **Fijación de Marcador (Lampa)**: Se solucionó el problema del marcador de origen que desaparecía en Google Maps al configurar `suppressMarkers: true` en el `DirectionsRenderer` y dibujando explícitamente marcadores personalizados, garantizando que el Centro de Distribución siempre sea visible.
- **Optimización de Reloj**: Se ajustó el script del reloj en `app.js` para usar la localización chilena (`es-CL`) y asegurar que se muestra inmediatamente desde el momento en que carga la plataforma.
