// js/data.js
// Mock data based on the POLI SQL Schema

const mockData = {
    // Valores principales de la vista de Inicio (Dashboard)
    // Puedes modificar estos números para ver los cambios reflejados en la interfaz
    kpisInicio: {
        entregasDiarias: {
            valor: "3.800",
            tendencia: "+12%",
            tendenciaPositiva: true,
            textoTendencia: "vs. ayer"
        },
        otif: {
            porcentaje: 78,
            tendencia: "+5 pp",
            tendenciaPositiva: true,
            textoTendencia: "vs. semana anterior"
        },
        vehiculos: {
            valor: "210",
            tendencia: "+8%",
            tendenciaPositiva: true,
            textoTendencia: "vs. mes anterior"
        },
        alertasActivas: {
            valor: "12",
            tendencia: "+3",
            tendenciaPositiva: false,
            textoTendencia: "vs. ayer"
        }
    },

    operaciones: [
        { id: '#E4581', pedido: 'P-78231', destino: 'Providencia', ventana: '08:00 - 10:00', vehiculo: 'V-104', conductor: 'J. Rojas', estado: 'A tiempo', avance: 100 },
        { id: '#E4582', pedido: 'P-78232', destino: 'Maipú', ventana: '09:00 - 11:00', vehiculo: 'V-118', conductor: 'L. Fernández', estado: 'Entregada', avance: 100 },
        { id: '#E4583', pedido: 'P-78233', destino: 'Las Condes', ventana: '11:00 - 12:00', vehiculo: 'V-207', conductor: 'M. Silva', estado: 'En riesgo', avance: 68 },
        { id: '#E4584', pedido: 'P-78234', destino: 'Ñuñoa', ventana: '12:00 - 14:00', vehiculo: 'V-093', conductor: 'C. Ramírez', estado: 'A tiempo', avance: 45 },
        { id: '#E4585', pedido: 'P-78235', destino: 'Quilicura', ventana: '13:00 - 15:00', vehiculo: 'V-176', conductor: 'D. Torres', estado: 'Retrasada', avance: 20 },
        { id: '#E4586', pedido: 'P-78236', destino: 'Pudahuel', ventana: '14:00 - 16:00', vehiculo: 'V-118', conductor: 'A. Morales', estado: 'A tiempo', avance: 30 },
        { id: '#E4587', pedido: 'P-78237', destino: 'San Bernardo', ventana: '15:00 - 17:00', vehiculo: 'V-205', conductor: 'R. Soto', estado: 'A tiempo', avance: 15 },
        { id: '#E4588', pedido: 'P-78238', destino: 'La Florida', ventana: '16:00 - 18:00', vehiculo: 'V-101', conductor: 'F. Contreras', estado: 'En riesgo', avance: 55 },
        { id: '#E4589', pedido: 'P-78239', destino: 'Recoleta', ventana: '17:00 - 19:00', vehiculo: 'V-220', conductor: 'S. Vega', estado: 'A tiempo', avance: 10 },
        { id: '#E4590', pedido: 'P-78240', destino: 'Las Condes', ventana: '18:00 - 20:00', vehiculo: 'V-093', conductor: 'P. Guzmán', estado: 'Retrasada', avance: 0 },
        { id: '#E4591', pedido: 'P-78241', destino: 'Providencia', ventana: '19:00 - 21:00', vehiculo: 'V-176', conductor: 'E. Díaz', estado: 'A tiempo', avance: 0 },
        { id: '#E4592', pedido: 'P-78242', destino: 'Maipú', ventana: '20:00 - 22:00', vehiculo: 'V-207', conductor: 'K. Herrera', estado: 'A tiempo', avance: 0 }
    ],
    rutas: [
        { id: 'R1', nombre: 'Centro', zona: 'Centro', estado: 'Activa', vehiculo: 'V-101', conductor: 'F. Contreras', paradas: 16, distancia: 58, tiempoEstimado: '3 h 10 min', avance: 100 },
        { id: 'R2', nombre: 'Norte', zona: 'Norte', estado: 'Planificada', vehiculo: 'V-118', conductor: 'A. Morales', paradas: 14, distancia: 72, tiempoEstimado: '3 h 55 min', avance: 0 },
        { id: 'R3', nombre: 'Oriente', zona: 'Oriente', estado: 'Activa', vehiculo: 'V-207', conductor: 'M. Silva', paradas: 18, distancia: 64, tiempoEstimado: '3 h 25 min', avance: 68 },
        { id: 'R4', nombre: 'Poniente', zona: 'Poniente', estado: 'En riesgo', vehiculo: 'V-176', conductor: 'D. Torres', paradas: 15, distancia: 83, tiempoEstimado: '4 h 20 min', avance: 30 }
    ],
    tendenciaEntregas: {
        labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        entregas: [200, 400, 600, 800, 1100, 900, 850, 600, 500, 400, 300, 200, 100, 50],
        completadas: [150, 380, 550, 750, 1000, 850, 700, 550, 400, 300, 200, 100, 50, 20]
    },
    recomendacionesIA: [
        { tipo: 'riesgo', titulo: 'Riesgo de atraso en Ruta 18', descripcion: 'Se detecta congestión superior al 70%. Considera ruta alternativa por Autopista del Sol.', accion: 'Ver alternativa', icon: 'ph-warning-circle', color: 'red' },
        { tipo: 'optimizacion', titulo: 'Reasignar vehículo disponible', descripcion: 'El vehículo V-207 puede cubrir la ruta R3 debido a la demora actual.', accion: 'Reasignar', icon: 'ph-truck', color: 'blue' },
        { tipo: 'mejora', titulo: 'Optimizar recorrido sector norte', descripcion: 'Se puede reducir 18% del tiempo de ruta reordenando las últimas 4 entregas.', accion: 'Aplicar', icon: 'ph-trend-up', color: 'green' }
    ]
};
