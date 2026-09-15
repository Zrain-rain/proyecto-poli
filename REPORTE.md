# Reporte de Iteraciones y Trabas (POLI)

Este documento registra los problemas, trabas y tareas pendientes identificadas tras cada iteración del desarrollo para asegurar que no se pierdan errores y se puedan reparar o mejorar posteriormente.

## Iteración 1: Migración a Cloudflare (Actual)

### Trabas y Problemas Encontrados:
- **Refactorización Completa de Vistas Frontend:** Las vistas actuales (`inicio.js`, `operacion.js`, `rutas.js`) aún están fuertemente acopladas al objeto estático `mockData`. Hay que reescribir la lógica de renderizado de cada archivo para que espere las Promesas de `window.API` antes de inyectar el HTML.
- **Gráficos en Dashboard:** Chart.js en `inicio.js` requiere datos asíncronos. Actualmente está síncrono. Esto lanzará errores o renderizará vacío si no se adapta.
- **Manejo de CORS en Local:** Asegurar que `wrangler dev` en el puerto 8787 esté permitiendo explícitamente solicitudes del servidor estático local del frontend, o los fetch fallarán.
- **Almacenamiento de Contraseñas:** Actualmente las contraseñas están en texto plano en la base de datos (para fines de la demostración simple). Se debe considerar encriptar con `bcrypt` u otro hash nativo (Crypto Web API) en futuras iteraciones si pasa a producción real.

### Mejoras Pendientes
- Conectar los botones de la UI (ej. "Nueva operación") a los endpoints de creación (POST).
- Implementar validación estricta de variables de entorno en el Worker para `JWT_SECRET` en lugar de un string en duro en el código.
