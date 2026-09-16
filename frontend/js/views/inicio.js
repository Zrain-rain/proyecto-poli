// js/views/inicio.js

const renderInicio = () => {
    return `
        <div class="dashboard-grid" id="inicio-kpis-container">
            <!-- Cargando KPIs... -->
            <div style="padding: 20px; color: var(--text-muted);">Cargando indicadores...</div>
        </div>

        <div class="dashboard-main">
            <!-- Map -->
            <div class="card" style="padding: 16px;">
                <div class="card-header">
                    <h3 class="card-title">Operación en tiempo real</h3>
                    <div class="card-actions">
                        <span class="legend-item"><div class="dot green"></div> A tiempo</span>
                        <span class="legend-item"><div class="dot warning"></div> En riesgo</span>
                        <span class="legend-item"><div class="dot red"></div> Retrasada</span>
                    </div>
                </div>
                <div id="inicio-map" class="map-container" style="border-radius: 12px;"></div>
            </div>

            <!-- AI Recommendations -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Recomendaciones de IA</h3>
                    <div class="badge-pill active"><i class="ph-fill ph-sparkle"></i> Gemini 2.1 Pro</div>
                </div>
                <div class="ai-list" id="ai-recommendations-list">
                    <div class="ai-recommendation-card">
                        <div class="ai-icon green"><i class="ph ph-check-circle"></i></div>
                        <div class="ai-content">
                            <h4>Rutas Optimizadas</h4>
                            <p>No hay alertas de tráfico severas. La operación fluye con normalidad.</p>
                        </div>
                    </div>
                </div>
                <div class="ai-footer">
                    <i class="ph-fill ph-sparkle"></i>
                    <p>La IA analiza en tiempo real tráfico, ventanas de entrega y capacidad de la flota.</p>
                </div>
            </div>
        </div>

        <div class="dashboard-bottom">
            <!-- Bar Chart -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Tendencia de entregas</h3>
                    <div class="card-actions">
                        <span class="legend-item"><div class="dot blue"></div> Entregas</span>
                        <span class="legend-item"><div class="dot" style="background: #00B5D8;"></div> Entregas completadas</span>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="entregasChart"></canvas>
                </div>
            </div>

            <!-- Deliveries Table -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Entregas en curso</h3>
                    <a href="#" style="color: var(--primary); font-size: 13px; font-weight: 600; text-decoration: none;" onclick="window.navigate('operacion')">Ver todas</a>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Destino</th>
                                <th>Vehículo</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody id="inicio-table-body">
                            <tr><td colspan="4" style="text-align:center; padding: 20px;">Cargando operaciones...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

const initInicio = async () => {
    
    // Función auxiliar para renderizar tendencia
    const renderTrend = (tendencia, tendenciaPositiva, textoTendencia) => {
        const icon = tendenciaPositiva ? 'ph-caret-up' : 'ph-caret-down';
        const colorClass = tendenciaPositiva ? 'positive' : 'negative';
        return `<span class="kpi-trend ${colorClass}"><i class="ph-bold ${icon}"></i> ${tendencia} ${textoTendencia}</span>`;
    };

    // 1. Cargar KPIs desde API
    try {
        const kpis = await window.API.getKPIs();
        const kpiContainer = document.getElementById('inicio-kpis-container');
        if (kpiContainer && kpis) {
            kpiContainer.innerHTML = `
                <div class="card kpi-card">
                    <div class="kpi-icon blue"><i class="ph-fill ph-cube"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row">
                            <span class="kpi-value">${kpis.entregasDiarias?.valor || 0}</span>
                            ${renderTrend(kpis.entregasDiarias?.tendencia || '0%', kpis.entregasDiarias?.tendenciaPositiva, kpis.entregasDiarias?.textoTendencia || '')}
                        </div>
                        <div class="kpi-label">Entregas diarias</div>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="circular-progress" style="background: conic-gradient(var(--success) ${kpis.otif?.valor || 0}%, #E2E8F0 0);">
                        <span class="circular-value">${kpis.otif?.valor || 0}%</span>
                    </div>
                    <div class="kpi-content" style="margin-left: 10px;">
                        <div class="kpi-value-row">
                            <span class="kpi-value">OTIF</span>
                            ${renderTrend(kpis.otif?.tendencia || '0%', kpis.otif?.tendenciaPositiva, '')}
                        </div>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="kpi-icon blue"><i class="ph-fill ph-truck"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row">
                            <span class="kpi-value">${kpis.vehiculos?.valor || 0}</span>
                            ${renderTrend(kpis.vehiculos?.tendencia || '0', kpis.vehiculos?.tendenciaPositiva, '')}
                        </div>
                        <div class="kpi-label">Vehículos</div>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="kpi-icon red"><i class="ph-fill ph-warning"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row">
                            <span class="kpi-value">${kpis.alertasActivas?.valor || 0}</span>
                            ${renderTrend(kpis.alertasActivas?.tendencia || '0', kpis.alertasActivas?.tendenciaPositiva, '')}
                        </div>
                        <div class="kpi-label">Alertas activas</div>
                    </div>
                </div>
            `;
        }
    } catch (e) {
        console.error("Error al cargar KPIs", e);
    }

    // 2. Cargar Operaciones
    try {
        const operaciones = await window.API.getOperaciones();
        const tbody = document.getElementById('inicio-table-body');
        if (tbody && operaciones) {
            tbody.innerHTML = operaciones.slice(0, 5).map(op => {
                let statusClass = 'ontime';
                if(op.estado === 'En riesgo') statusClass = 'risk';
                if(op.estado === 'Con retraso') statusClass = 'delayed';

                return `
                    <tr>
                        <td style="color: var(--primary); font-weight: 600;">${op.id}</td>
                        <td>${op.destino}</td>
                        <td>${op.vehiculo || 'No asignado'}</td>
                        <td><span class="status-badge ${statusClass}">${op.estado}</span></td>
                    </tr>
                `;
            }).join('');
        }
    } catch (e) {
        console.error("Error al cargar operaciones", e);
    }

    // 3. Init Chart.js (Estático por ahora, solo para visualización)
    const ctx = document.getElementById('entregasChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
                datasets: [
                    {
                        label: 'Entregas',
                        data: [12, 19, 15, 22, 30, 25, 18, 10],
                        backgroundColor: '#0052FF',
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Completadas',
                        data: [10, 15, 12, 20, 25, 20, 15, 5],
                        backgroundColor: '#00B5D8',
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#E2E8F0', drawBorder: false } },
                    x: { grid: { display: false, drawBorder: false } }
                }
            }
        });
    }

    // 4. Init Google Maps
    const mapEl = document.getElementById('inicio-map');
    if (mapEl) {
        window.API.getConfig().then(config => {
            if(!config.mapsApiKey) return;
            
            window.initGoogleMap = () => {
                const map = new google.maps.Map(mapEl, {
                    center: { lat: -33.4489, lng: -70.6693 },
                    zoom: 11,
                    disableDefaultUI: true,
                    zoomControl: true
                });

                const trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);
            };

            if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${config.mapsApiKey}&callback=initGoogleMap`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            } else {
                window.initGoogleMap();
            }
        }).catch(err => console.error(err));
    }
};
