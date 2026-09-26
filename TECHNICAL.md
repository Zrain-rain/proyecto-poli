# Documentación Técnica (POLI)

Este documento detalla estrictamente la arquitectura técnica y dependencias del sistema.

## Estructura del Repositorio
La arquitectura se ha dividido de forma estricta para desacoplar responsabilidades:
- `/frontend`: SPA construida con Vanilla JS, HTML5 y CSS3. Consumo de API vía `Fetch`.
- `/backend`: Lógica central de la API construida con Hono.js. Contiene los controladores, middleware (JWT) y rutas.
- `/workers`: Punto de entrada y configuraciones de Cloudflare Workers (`wrangler.toml`, archivo `index.js` principal del Edge).
- `/db`: Scripts de definición de esquemas D1 (`schema.sql`) y poblamiento de datos iniciales (`seed.sql`).

## Stack Tecnológico
- **Cloudflare Workers:** Entorno de ejecución Serverless (V8 Isolate).
- **Cloudflare D1:** Motor de base de datos SQLite distribuido en el Edge.
- **Hono.js:** Web framework ultraligero y rápido para entornos Edge.
- **Seguridad:** JSON Web Tokens (hono/jwt) para autorización basada en roles (RBAC).

## Flujo de Datos y Middlewares
1. El frontend envía un `POST` a `/api/v1/auth/login`.
2. El Worker valida credenciales contra D1.
3. Se firma un JWT conteniendo el `username` y `role_name`.
4. El frontend adjunta el JWT en el Header `Authorization: Bearer <token>` para peticiones subsecuentes.
5. El middleware global en `backend/` intercepta, verifica la firma del JWT y extrae el rol.
6. Guardias de ruta (`requireRole(['admin'])`) bloquean o permiten la ejecución del controlador.

## Arquitectura de UI y Despliegue
- **Invalidación de caché:** Los scripts del Frontend en `index.html` utilizan query parameters de versión (e.g. `?v=5`) para forzar refrescos inmediatos en los navegadores de los clientes tras cada despliegue.
- **Capa de Abstracción API:** El archivo `frontend/js/api.js` abstrae las llamadas al backend, proveyendo alias de compatibilidad (`createOperacion`, `createRuta`) para mantener la interoperabilidad de componentes antiguos de la UI con las nuevas rutas robustas del servicio logístico (`PoliServices`).

## ZetaBot: Gemini y respuestas predefinidas (2026-09-26)

La conexión usa generateContent con gemini-flash-latest por defecto y envía la clave en x-goog-api-key. No discrimina prefijos AQ. o de otros formatos. GEMINI_MODEL permite elegir otro modelo disponible; si no está definida se usa el predeterminado.

Configuración al publicar:
- Configurar GEMINI_API_KEY como secreto del Worker en Cloudflare. Para desarrollo local usar workers/.dev.vars (ignorado por Git). Nunca agregar la clave al frontend, al repositorio ni a wrangler.toml.
- GEMINI_MODEL es opcional. Revisar valores anteriores para evitar seguir utilizando un modelo retirado.
- Publicar backend y frontend juntos para disponer también del fallback del navegador.
- Validar en el sitio autenticado que el indicador cambia a Gemini conectado y que /data/ai/chat devuelve fallback: false. No se realizó una llamada con credenciales reales ni se desplegó en esta revisión.

Comportamiento:
- Google tiene un límite de espera de 12 segundos, incluida la lectura del cuerpo de respuesta.
- Si falta la clave, hay error HTTP, red, respuesta vacía/bloqueada o timeout, el Worker devuelve respuestas predefinidas con fallback: true.
- El navegador espera hasta 15 segundos al Worker; ante fallo de conexión/servidor también ofrece orientación predefinida. Cada consulta nueva intenta conectar otra vez.
- Los errores de autenticación de POLI (401/403) mantienen sus controles normales; no se ocultan como un éxito del chat.
- El chat se inicializa antes de esperar KPIs y operaciones. El indicador distingue respuestas locales de Gemini.
- El modo sin conexión requiere que la página ya esté cargada. No permite consultar datos actuales ni guardar cambios offline y no instala una aplicación offline.

Pruebas:
- node --test backend/tests/gemini.test.js: pruebas aisladas sin API real.
- npm --prefix backend test: ejecuta además la suite previa.
- Se detectó una prueba previa fallida de creación de pedidos (400 frente a 201 esperado). Se reprodujo también contra backend/index.js de HEAD, sin el parche Gemini. Esa regresión preexistente queda fuera de este cambio.
