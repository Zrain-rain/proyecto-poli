import { parseArgs } from 'util';

const API_URL = 'http://localhost:8787/api/v1';

async function fetchAPI(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });
    
    const data = await res.json();
    return { status: res.status, data };
}

async function runTests() {
    console.log("==========================================");
    console.log(" EJECUCIÓN DE PRUEBAS FUNCIONALES (QUERY 8)");
    console.log("==========================================\n");

    let passed = 0;
    let failed = 0;

    const assert = (condition, msg) => {
        if (condition) {
            console.log(`✅ PASS: ${msg}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${msg}`);
            failed++;
        }
    };

    try {
        // 1. Auth como Admin
        const { status: s1, data: d1 } = await fetchAPI('/auth/login', 'POST', { username: 'admin', password: 'admin123' });
        assert(s1 === 200 && d1.token, "Login exitoso como Admin");
        const tokenAdmin = d1.token;

        // 2. Creación de Pedido
        const { status: s2, data: d2 } = await fetchAPI('/data/operaciones', 'POST', {
            id_cliente: 1, id_ubicacion: 1, codigo_pedido: `TEST-${Date.now()}`,
            fecha_requerida: new Date().toISOString(), ventana_horaria: "08:00 - 10:00",
            peso_total: 15.5, volumen_total: 2.0
        }, tokenAdmin);
        assert(s2 === 201 && d2.id_pedido, "Creación de Pedido con peso válido (Restricción CHECK JS)");
        const id_pedido = d2.id_pedido;

        // 3. Fallo intencional por peso negativo
        const { status: s3 } = await fetchAPI('/data/operaciones', 'POST', {
            id_cliente: 1, id_ubicacion: 1, codigo_pedido: `TEST-ERR-${Date.now()}`,
            fecha_requerida: new Date().toISOString(), ventana_horaria: "08:00 - 10:00",
            peso_total: -5, volumen_total: 2.0
        }, tokenAdmin);
        assert(s3 === 400, "Rechazo de creación de pedido con peso negativo");

        // 4. Creación de Ruta
        const { status: s4, data: d4 } = await fetchAPI('/data/rutas', 'POST', {
            id_centro: 1, id_zona: 1, nombre: "Ruta de Prueba API", fecha_planificada: new Date().toISOString()
        }, tokenAdmin);
        assert(s4 === 201 && d4.id_ruta, "Creación de Ruta PLANIFICADA");
        const id_ruta = d4.id_ruta;

        // 5. Agregar Parada
        const { status: s5 } = await fetchAPI(`/data/rutas/${id_ruta}/paradas`, 'POST', {
            id_pedido: id_pedido, secuencia: 1
        }, tokenAdmin);
        assert(s5 === 200, "Pedido agregado como Parada exitosamente");

        // 6. Asignar Ruta
        const { status: s6 } = await fetchAPI(`/data/rutas/${id_ruta}/asignacion`, 'POST', {
            id_vehiculo: 1, id_conductor: 1
        }, tokenAdmin);
        assert(s6 === 200, "Ruta ASIGNADA a Vehículo y Conductor");

        // 7. Iniciar Ruta
        const { status: s7 } = await fetchAPI(`/data/rutas/${id_ruta}/inicio`, 'PUT', null, tokenAdmin);
        assert(s7 === 200, "Ruta cambiada a estado EN_CURSO");

        // 8. Entrega Fallida (Registrando Incidencia)
        const { status: s8 } = await fetchAPI('/data/entregas', 'POST', {
            id_pedido: id_pedido, nuevo_estado: 'FALLIDO', motivo_fallo: 'Cliente no responde'
        }, tokenAdmin);
        assert(s8 === 200, "Registro de Entrega FALLIDA (con ID_PEDIDO Fallback temporal)");

        // 9. Reintento Exitoso
        const { status: s9 } = await fetchAPI('/data/entregas', 'POST', {
            id_pedido: id_pedido, nuevo_estado: 'ENTREGADO'
        }, tokenAdmin);
        assert(s9 === 200, "Reintento de Entrega: ENTREGADO");

        // 10. Cerrar Ruta
        const { status: s10 } = await fetchAPI(`/data/rutas/${id_ruta}/cierre`, 'PUT', null, tokenAdmin);
        assert(s10 === 200, "Ruta CERRADA y recursos liberados exitosamente");

        // 11. Cambiar Disponibilidad
        const { status: s11 } = await fetchAPI(`/data/recursos/vehiculo/1/disponibilidad`, 'PUT', { nuevo_estado: 'MANTENIMIENTO' }, tokenAdmin);
        assert(s11 === 200, "Cambio de disponibilidad de Vehículo a MANTENIMIENTO");

        // 12. Generación de Reportes (Query 5)
        const { status: s12, data: d12 } = await fetchAPI('/data/reportes/otif', 'GET', null, tokenAdmin);
        assert(s12 === 200 && Array.isArray(d12), "Generación de Reporte OTIF (Query 5 adaptada)");

    } catch (e) {
        console.error("Error catastrófico en la ejecución de pruebas:", e);
    }

    console.log("\n==========================================");
    console.log(` RESULTADOS: ${passed} Exitosos | ${failed} Fallidos`);
    console.log("==========================================");
}

runTests();
