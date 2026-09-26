// URL base de la API (Worker Desplegado o Local)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8787/api/v1'
    : 'https://poli-worker.zebba-leniz.workers.dev/api/v1';

// Función genérica para hacer peticiones a la API
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('poli_jwt');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401 && endpoint !== '/auth/login') {
            localStorage.removeItem('poli_jwt');
            localStorage.removeItem('poli_role');
            localStorage.removeItem('poli_user');
            window.location.href = 'login.html';
            throw Object.assign(new Error('No autorizado'), { status: 401 });
        }

        const data = await response.json();
        if (!response.ok) {
            throw Object.assign(new Error(data.error || 'Error en la petición'), { status: response.status });
        }
        return data;
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        throw error;
    }
}

function respuestaZetabotLocal(message = "") {
    const text = String(message).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (text.includes("ruta")) return "Modo local: consulta Rutas para revisar recorridos y asignaciones. No puedo consultar información actualizada sin conexión.";
    if (/pedido|entrega|operacion/.test(text)) return "Modo local: consulta Operaciones para revisar pedidos y entregas. Para guardar cambios necesitas conexión con el servidor.";
    if (/vehiculo|camion|flota/.test(text)) return "Modo local: consulta Gestión de Camiones o Vehículos. La disponibilidad actual requiere conexión.";
    return "¡Hola! Estoy en modo local con respuestas predefinidas. Puedo orientarte sobre rutas, pedidos y vehículos. Volveré a intentar conectar con Gemini en tu próxima consulta.";
}

async function fetchZetabot(endpoint, field, message = "", options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
        const data = await fetchAPI(endpoint, { ...options, signal: controller.signal });
        if (typeof data?.[field] !== "string" || !data[field].trim()) throw new Error("Respuesta vacía");
        return data;
    } catch (error) {
        if (error.status === 401 || error.status === 403) throw error;
        return { [field]: respuestaZetabotLocal(message), fallback: true };
    } finally { clearTimeout(timer); }
}

// Exportamos las funciones específicas de negocio
window.API = {
    // Auth
    login: async (username, password) => {
        return await fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    // Queries base
    getConfig: async () => await fetchAPI('/data/config'),
    getKPIs: async () => await fetchAPI('/data/kpis'),
    getOperaciones: async () => await fetchAPI('/data/operaciones'),
    getRutas: async () => await fetchAPI('/data/rutas'),
    getAlertas: async () => await fetchAPI('/data/alertas'),
    getAIRecomendaciones: async () => await fetchZetabot('/data/ai/recomendaciones', 'recomendacion'),
    enviarMensajeZetabot: async (message, history = []) => {
        return await fetchZetabot('/data/ai/chat', 'respuesta', message, {
            method: 'POST',
            body: JSON.stringify({ message, history })
        });
    },
    getReportesOTIF: async () => await fetchAPI('/data/reportes/otif'),
    // =====================================

    // 1. Crear Pedido
    crearPedido: async (pedidoData) => {
        return await fetchAPI('/data/operaciones', {
            method: 'POST',
            body: JSON.stringify(pedidoData)
        });
    },

    // 2. Crear Ruta
    crearRuta: async (rutaData) => {
        return await fetchAPI('/data/rutas', {
            method: 'POST',
            body: JSON.stringify(rutaData)
        });
    },

    // 3. Agregar Parada
    agregarParada: async (idRuta, paradaData) => {
        return await fetchAPI(`/data/rutas/${idRuta}/paradas`, {
            method: 'POST',
            body: JSON.stringify(paradaData)
        });
    },

    // 4. Asignar Ruta
    asignarRuta: async (idRuta, asignacionData) => {
        return await fetchAPI(`/data/rutas/${idRuta}/asignacion`, {
            method: 'POST',
            body: JSON.stringify(asignacionData)
        });
    },

    // 5. Iniciar Ruta
    iniciarRuta: async (idRuta) => {
        return await fetchAPI(`/data/rutas/${idRuta}/inicio`, {
            method: 'PUT'
        });
    },

    // 6. Registrar Entrega (Actualizar estado de operación/parada)
    updateOperacionEstado: async (idPedidoOParada, estado, motivo = 'Actualizado desde UI') => {
        // Mantenemos compatibilidad enviando id_pedido
        return await fetchAPI(`/data/entregas`, {
            method: 'POST',
            body: JSON.stringify({ id_pedido: idPedidoOParada, nuevo_estado: estado, motivo_fallo: motivo })
        });
    },

    // 7. Cerrar Ruta
    cerrarRuta: async (id_ruta) => {
        return fetchAPI(`/data/rutas/${id_ruta}/cierre`, { method: 'PUT' });
    },

    // Alias para compatibilidad con código de remote (GitHub)
    
    // Pedidos / Operaciones endpoints
    updatePedidoEstado: async (idPedido, nuevoEstado) => {
        return await fetchAPI(`/data/pedidos/${idPedido}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ nuevo_estado: nuevoEstado })
        });
    },
    recoordinarPedido: async (idPedido, fecha_requerida, ventana_horaria) => {
        return await fetchAPI(`/data/pedidos/${idPedido}/recoordinar`, {
            method: 'PUT',
            body: JSON.stringify({ fecha_requerida, ventana_horaria })
        });
    },
createOperacion: async (operacionData) => {
        return await fetchAPI('/data/operaciones', {
            method: 'POST',
            body: JSON.stringify(operacionData)
        });
    },
    createRuta: async (rutaData) => {
        return await fetchAPI('/data/rutas', {
            method: 'POST',
            body: JSON.stringify(rutaData)
        });
    },

    crearUsuario: async (data) => {
        return fetchAPI('/auth/usuarios', { method: 'POST', body: JSON.stringify(data) });
    },
    getRoles: async () => {
        return fetchAPI('/data/roles');
    },
    getMapaRutas: async () => {
        return fetchAPI('/data/rutas/mapa');
    },

    // 8. Tarifas
    cambiarTarifa: async (tarifaData) => {
        return await fetchAPI(`/data/tarifas`, {
            method: 'POST',
            body: JSON.stringify(tarifaData)
        });
    },

    // 9. Disponibilidad Recursos
    getFlota: async () => {
        // Retornamos mock de flota o consultamos un endpoint si existe.
        // El endpoint de flota en backend no lo modificamos hoy, pero lo requeriría.
        return await fetchAPI('/data/flota').catch(() => []); // Fallback silencioso si no existe /flota real
    },
    updateFlotaEstado: async (id, estado) => {
        return await fetchAPI(`/data/recursos/vehiculo/${id}/disponibilidad`, {
            method: 'PUT',
            body: JSON.stringify({ nuevo_estado: estado })
        });
    },

    // 10 & 11. Incidencias
    registrarIncidencia: async (incidenciaData) => {
        return await fetchAPI('/data/incidencias', {
            method: 'POST',
            body: JSON.stringify(incidenciaData)
        });
    },
    resolverIncidencia: async (idIncidencia) => {
        return await fetchAPI(`/data/incidencias/${idIncidencia}/resolucion`, {
            method: 'PUT'
        });
    },

    // 12. Optimización
    decidirOptimizacion: async (idRecomendacion, decision) => {
        // If decision is an object (like {decision: 'APROBADA'}), extract the string.
        const decisionStr = typeof decision === 'object' ? decision.decision : decision;
        return await fetchAPI(`/data/optimizaciones/${idRecomendacion}/decision`, {
            method: 'PUT',
            body: JSON.stringify({ decision: decisionStr })
        });
    },

    // 13. Consultar Ruta
    getDetallesRuta: async (idRuta) => {
        return await fetchAPI(`/data/rutas/${idRuta}/detalles`);
    },

    // Reportes Query 5
    getReportesOTIF: async () => await fetchAPI('/data/reportes/otif'),
    getReportesCostos: async () => await fetchAPI('/data/reportes/costos')
};
