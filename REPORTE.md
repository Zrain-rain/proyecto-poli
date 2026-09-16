# Reporte de Iteraciones y Trabas (POLI)

Este documento registra los problemas, trabas y tareas pendientes identificadas tras cada iteración del desarrollo para asegurar que no se pierdan errores y se puedan reparar o mejorar posteriormente.

## Iteración 1: Migración a Cloudflare (Actual)

### Trabas y Problemas Encontrados:
- **Refactorización Completa de Vistas Frontend:** Las vistas actuales (`inicio.js`, `operacion.js`, `rutas.js`) aún están fuertemente acopladas al objeto estático `mockData`. Hay que reescribir la lógica de renderizado de cada archivo para que espere las Promesas de `window.API` antes de inyectar el HTML.
- **Gráficos en Dashboard:** Chart.js en `inicio.js` requiere datos asíncronos. Actualmente está síncrono. Esto lanzará errores o renderizará vacío si no se adapta.
- **Manejo de CORS en Local:** Asegurar que `wrangler dev` en el puerto 8787 esté permitiendo explícitamente solicitudes del servidor estático local del frontend, o los fetch fallarán.
- **Almacenamiento de Contraseñas:** Actualmente las contraseñas están en texto plano en la base de datos (para fines de la demostración simple). Se debe considerar encriptar con `bcrypt` u otro hash nativo (Crypto Web API) en futuras iteraciones si pasa a producción real.

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
