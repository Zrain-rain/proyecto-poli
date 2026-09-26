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

### Diagnóstico real posterior al despliegue
Se comprobó que las solicitudes del chat en el Worker publicado reciben HTTP 401 de Google (authentication). La llamada directa con la clave local a generateContent recibió UNAUTHENTICATED / ACCESS_TOKEN_TYPE_UNSUPPORTED. La presencia del secreto GEMINI_API_KEY en Cloudflare está confirmada, pero su valor remoto no es legible ni se supone idéntico al local.
La conexión no puede declararse funcional hasta obtener una respuesta real de Google. Actualizar código no vuelve válida una credencial rechazada. Se requiere probar una clave vigente antes de reemplazar el secreto publicado.
El indicador pasa a IA LOCAL. Las respuestas de fallback incluyen códigos diagnósticos acotados (fallbackReason, providerStatus, providerCode), sin el mensaje externo, prompts ni secretos.

### Validación con la clave reemplazada
La nueva clave local recibió HTTP 200 y texto OK en una llamada real a Google. Se actualizó únicamente GEMINI_API_KEY en el Worker mediante entrada estándar, sin guardar el secreto en código.
Una prueba posterior recibió HTTP 503 de Google, también observado en producción. Se incorporó un único reintento ante 502/503/504 dentro del timeout total de 12 segundos.
La prueba integral del endpoint local de chat con contexto vacío y Google real terminó con HTTP 200, fallback: false y respuesta no vacía. Las 20 pruebas de Gemini pasan.
El Worker se publicó como versión 622472b3-5eeb-4ae6-a83c-88f5f88ce20a. Falta la confirmación visual de una respuesta online en la sesión publicada del usuario tras esta última versión; no se equipara el éxito local con esa verificación.

## Voz de ZetaBot
El frontend incluye Dictar (SpeechRecognition/webkitSpeechRecognition, es-CL), Leer respuestas (opcional y desactivado al entrar), Escuchar última y Detener voz (SpeechSynthesis).
El dictado rellena el borrador y requiere Enviar: no manda mensajes automáticamente. Se conserva el texto previo. La captura solo se inicia por clic del usuario; al enviar, navegar o abandonar la página se cancela la captura/lectura correspondiente.
No se almacenan grabaciones en POLI ni se envía audio al Worker. El reconocimiento depende del servicio del navegador, que puede procesar audio remotamente y requerir internet. La disponibilidad del dictado y de las voces depende del navegador/dispositivo. Si falta soporte o permiso, permanece el chat escrito.
Pruebas: node --test backend/tests/gemini.test.js backend/tests/voice.test.js (26 aprobadas). Eventos de voz simulados: no se ha validado acústicamente un micrófono ni la reproducción real en el equipo del usuario.

### Conversación natural
El chat envía los últimos turnos al backend y el prompt de Zetabot exige respuestas de 1 a 4 frases, tono cercano, sin listas ni IDs internos salvo que el usuario los solicite. El contexto de operaciones se presenta como referencia interna y no como reporte.
La prueba real con Gemini respondió de forma natural y devolvió fallback: false.
La lectura actual usa SpeechSynthesis del navegador. El canal Gemini Live es una WebSocket bidireccional con audio nativo y requiere una sesión efímera; la clave actual pudo crear un token temporal, pero esa integración de audio queda separada para no alterar el chat estable sin probar captura PCM, reproducción y reconexión en el navegador.
