// js/views/reportes.js

const renderReportes = () => {
    return `
        <div class="dashboard-grid">
            <div class="card" style="grid-column: span 2;">
                <div class="card-header">
                    <h3 class="card-title">Resumen de Rendimiento General</h3>
                </div>
                <div class="ai-recommendation-card" style="border-color: var(--primary); background: #F8FAFC;">
                    <div class="ai-icon blue"><i class="ph-fill ph-chart-pie-slice"></i></div>
                    <div class="ai-content" id="reporte-analitico-content">
                        <h4>Generando análisis...</h4>
                        <p>Evaluando OTIF, entregas y desempeño de la flota.</p>
                    </div>
                </div>
                <div class="ai-recommendation-card" style="border-color: var(--danger); background: #FEF2F2;" id="reporte-alertas-container">
                    <div class="ai-icon red"><i class="ph-fill ph-warning"></i></div>
                    <div class="ai-content" id="reporte-alertas-content">
                        <h4>Impacto Operativo</h4>
                        <p>Calculando impacto de las alertas.</p>
                    </div>
                </div>
            </div>
            
            <div class="card" style="grid-column: span 2;">
                <div class="card-header">
                    <h3 class="card-title">Distribución de Estados</h3>
                </div>
                <div class="chart-container" style="min-height: 250px; display: flex; justify-content: center; align-items: center;">
                    <canvas id="estadoPieChart"></canvas>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: var(--content-padding);">
            <div class="card-header">
                <h3 class="card-title">Desempeño por Ventana Horaria (Hoy)</h3>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Ventana Horaria</th>
                            <th>Total Pedidos</th>
                            <th>Entregados / A tiempo</th>
                            <th>Retrasados / Riesgo</th>
                            <th>Cumplimiento</th>
                        </tr>
                    </thead>
                    <tbody id="reportes-table-body">
                        <tr><td colspan="5" style="text-align:center; padding: 20px;">Cargando...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

const initReportes = async () => {
    try {
        const operaciones = await window.API.getOperaciones();
        const kpis = await window.API.getKPIs();
        
        // 1. Análisis de Estados
        let aTiempo = 0;
        let conRetraso = 0;
        let enRiesgo = 0;

        // Filtrar operaciones de hoy (asumiendo que las traídas son las vigentes)
        operaciones.forEach(op => {
            if (op.estado === 'A tiempo' || op.estado === 'Entregada') aTiempo++;
            else if (op.estado === 'Con retraso' || op.estado === 'Retrasada') conRetraso++;
            else if (op.estado === 'En riesgo') enRiesgo++;
        });

        // Init Chart
        const ctx = document.getElementById('estadoPieChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['A tiempo / Entregada', 'Con retraso', 'En riesgo'],
                    datasets: [{
                        data: [aTiempo, conRetraso, enRiesgo],
                        backgroundColor: ['#01B574', '#EE5D50', '#FFCE20'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } }
                    }
                }
            });
        }

        // 2. Textos Analíticos
        const analiticoContent = document.getElementById('reporte-analitico-content');
        if (analiticoContent && kpis) {
            const otifVal = parseInt(kpis.otif?.valor || 0);
            let mensaje = "El desempeño general requiere atención urgente debido a múltiples retrasos.";
            if (otifVal >= 90) mensaje = "Excelente nivel de servicio. La mayoría de las entregas se están cumpliendo a tiempo.";
            else if (otifVal >= 70) mensaje = "Nivel de servicio aceptable, pero existen oportunidades de optimización en algunas rutas.";
            
            analiticoContent.innerHTML = `
                <h4>OTIF Actual: ${otifVal}%</h4>
                <p>${mensaje}</p>
            `;
        }

        const alertasContent = document.getElementById('reporte-alertas-content');
        if (alertasContent && kpis) {
            const alertasVal = parseInt(kpis.alertasActivas?.valor || 0);
            const impacto = kpis.alertasActivas?.tendencia || '0%';
            
            alertasContent.innerHTML = `
                <h4>Incidentes Activos: ${alertasVal}</h4>
                <p>Las alertas actuales representan un impacto de ${impacto} en el cumplimiento (OTIF). Las ventanas más afectadas deben ser priorizadas en la planificación de mañana.</p>
            `;
        }

        // 3. Tabla de Desempeño (Query 5 OTIF Real)
        const tbody = document.getElementById('reportes-table-body');
        if (tbody) {
            try {
                const reportesOTIF = await window.API.getReportesOTIF();
                if (reportesOTIF && reportesOTIF.length > 0) {
                    const rows = reportesOTIF.map(r => {
                        const total = r.TotalParadas || 0;
                        const ok = r.EntregasExitosas || 0;
                        const fail = r.EntregasFallidas || 0;
                        const porc = total > 0 ? Math.round((ok / total) * 100) : 0;
                        
                        let color = 'var(--success)';
                        if (porc < 80) color = 'var(--warning)';
                        if (porc < 50) color = 'var(--danger)';

                        return `
                            <tr>
                                <td style="font-weight: 600;">Ruta: ${r.Ruta}</td>
                                <td>${total} Paradas</td>
                                <td>${ok} Exitosas</td>
                                <td>${fail} Fallidas</td>
                                <td><span style="color: ${color}; font-weight: 700;">${porc}% OTIF</span></td>
                            </tr>
                        `;
                    }).join('');
                    tbody.innerHTML = rows;
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay datos para analizar</td></tr>';
                }
            } catch (err) {
                console.error("Error al cargar OTIF real", err);
            }
        }

    } catch (e) {
        console.error("Error cargando reportes", e);
    }
};
