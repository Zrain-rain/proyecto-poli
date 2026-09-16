// URL base de la API (Worker Desplegado)
const API_BASE_URL = 'https://poli-worker.zebba-leniz.workers.dev/api/v1';

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

        if (response.status === 401 || response.status === 403) {
            // Token inválido o expirado, redirigir al login
            localStorage.removeItem('poli_jwt');
            window.location.href = '/login.html';
            throw new Error('No autorizado');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        throw error;
    }
}

// Exportamos las funciones específicas de negocio
window.API = {
    login: async (username, password) => {
        const data = await fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        return data; // { token, role, username }
    },
    getConfig: async () => {
        return await fetchAPI('/data/config');
    },
    getKPIs: async () => {
        return await fetchAPI('/data/kpis');
    },
    getOperaciones: async () => {
        return await fetchAPI('/data/operaciones');
    },
    updateOperacionEstado: async (id, estado) => {
        return await fetchAPI(`/data/operaciones/${id}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado })
        });
    },
    getRutas: async () => {
        return await fetchAPI('/data/rutas');
    },
    getFlota: async () => {
        return await fetchAPI('/data/flota');
    },
    updateFlotaEstado: async (id, estado) => {
        return await fetchAPI(`/data/flota/${id}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado })
        });
    }
};
