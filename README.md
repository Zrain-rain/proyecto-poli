# POLI - Sistema de Planificación y Optimización Logística Inteligente

**POLI (Plataforma de Optimización Logística Inteligente)** es una solución integral diseñada para la gestión de flotas y despachos de última milla, brindando a las empresas control absoluto de su operación en tiempo real.

## Estado del Proyecto (V1.0 - Entregable)

El proyecto se encuentra en una etapa estable, con el Frontend y Backend completamente conectados e integrados con Cloudflare Workers y D1. 
Se ha limpiado el repositorio de archivos huérfanos y se han estabilizado las consultas SQL y el flujo de interfaz de usuario.

**Para cualquier persona o Agente IA que tome este proyecto, por favor revisar la siguiente documentación antes de codificar:**

1. [**REPORTE.md**](REPORTE.md): Contiene el estado actual detallado, los endpoints conectados, y **muy importante: La lista de tareas pendientes (To-Do)** para la versión V2 (ZetaBot, Comunas, Alertas, etc.).
2. [**TECHNICAL.md**](TECHNICAL.md): Contiene la arquitectura estricta del sistema, las dependencias y cómo fluye la autenticación.

## Despliegue Rápido
El sistema consta de dos partes:
- **Backend (Workers):** `npx wrangler dev` (Local) o `npx wrangler deploy` (Producción).
- **Frontend:** Abrir `frontend/index.html` con Live Server o desplegar con `npx wrangler pages deploy frontend`.
