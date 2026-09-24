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
