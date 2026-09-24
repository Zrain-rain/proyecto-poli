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
            throw new Error('No autorizado');
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error en la petición');
        }
        return data;
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        throw error;
    }
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
    getAIRecomendaciones: async () => await fetchAPI('/data/ai/recomendaciones'),
    getReportesOTIF: async () => await fetchAPI('/data/reportes/otif'),

    // =====================================
    // POLI SERVICES FLOW
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
        return await fetchAPI(`/data/optimizaciones/${idRecomendacion}/decision`, {
            method: 'PUT',
            body: JSON.stringify({ decision })
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
