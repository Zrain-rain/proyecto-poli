// js/views/inicio.js

const renderInicio = () => {
    const kpis = mockData.kpisInicio;

    const renderTrend = (kpi) => {
        const icon = kpi.tendenciaPositiva ? 'ph-caret-up' : 'ph-caret-down';
        const colorClass = kpi.tendenciaPositiva ? 'positive' : 'negative';
        return `<span class="kpi-trend ${colorClass}"><i class="ph-bold ${icon}"></i> ${kpi.tendencia} ${kpi.textoTendencia}</span>`;
    };

    return `
        <div class="dashboard-grid">
            <!-- KPIs -->
            <div class="card kpi-card">
                <div class="kpi-icon blue"><i class="ph-fill ph-cube"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value editable-kpi" data-kpi="entregasDiarias">${kpis.entregasDiarias.valor}</span>
                        ${renderTrend(kpis.entregasDiarias)}
                    </div>
                    <div class="kpi-label">Entregas diarias</div>
                </div>
            </div>
            
            <div class="card kpi-card" style="cursor: pointer;" title="Haz clic para modificar el OTIF" onclick="const p = prompt('Ingresa el nuevo % de OTIF (ej: 85):', '${kpis.otif.porcentaje}'); if(p) { const otif = parseInt(p); mockData.kpisInicio.otif.porcentaje = otif; mockData.kpisInicio.alertasActivas.valor = Math.round((100 - otif) * 0.55); window.navigate('inicio'); }">
                <div class="circular-progress" style="background: conic-gradient(var(--success) ${kpis.otif.porcentaje}%, #E2E8F0 0);">
                    <span class="circular-value">${kpis.otif.porcentaje}%</span>
                </div>
                <div class="kpi-content" style="margin-left: 10px;">
                    <div class="kpi-value-row">
                        <span class="kpi-value">OTIF</span>
                        ${renderTrend(kpis.otif)}
                    </div>
                </div>
            </div>

            <div class="card kpi-card">
                <div class="kpi-icon blue"><i class="ph-fill ph-truck"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value editable-kpi" data-kpi="vehiculos">${kpis.vehiculos.valor}</span>
                        ${renderTrend(kpis.vehiculos)}
                    </div>
                    <div class="kpi-label">Vehículos</div>
                </div>
            </div>

            <div class="card kpi-card">
                <div class="kpi-icon red"><i class="ph-fill ph-warning"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value editable-kpi" data-kpi="alertasActivas">${kpis.alertasActivas.valor}</span>
                        ${renderTrend(kpis.alertasActivas)}
                    </div>
                    <div class="kpi-label">Alertas activas</div>
                </div>
            </div>
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
                    <!-- Injected via JS -->
                </div>
                <div class="ai-footer">
                    <i class="ph-fill ph-sparkle"></i>
                    <p>La IA analiza en tiempo real tráfico, ventanas de entrega y capacidad de la flota para maximizar el cumplimiento.</p>
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
                                <th>Hora estimada</th>
                                <th>Estado</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="inicio-table-body">
                            <!-- Injected via JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

const initInicio = () => {
    // 1. Populate AI Recommendations
    const aiContainer = document.getElementById('ai-recommendations-list');
    if (aiContainer) {
        aiContainer.innerHTML = mockData.recomendacionesIA.map(r => `
            <div class="ai-recommendation-card">
                <div class="ai-icon ${r.color}"><i class="ph ${r.icon}"></i></div>
                <div class="ai-content">
                    <h4>${r.titulo}</h4>
                    <p>${r.descripcion}</p>
                </div>
                <i class="ph ph-caret-right ai-arrow"></i>
            </div>
        `).join('');
    }

    // 2. Populate Table
    const tbody = document.getElementById('inicio-table-body');
    if (tbody) {
        tbody.innerHTML = mockData.operaciones.slice(0, 5).map(op => {
            let statusClass = 'ontime';
            if(op.estado === 'En riesgo') statusClass = 'risk';
            if(op.estado === 'Retrasada') statusClass = 'delayed';

            return `
                <tr>
                    <td style="color: var(--primary); font-weight: 600;">${op.id}</td>
                    <td>${op.destino}</td>
                    <td>${op.vehiculo}</td>
                    <td>11:20</td>
                    <td><span class="status-badge ${statusClass}">${op.estado}</span></td>
                    <td style="color: var(--text-muted); cursor: pointer;"><i class="ph-bold ph-dots-three"></i></td>
                </tr>
            `;
        }).join('');
    }

    // 3. Init Chart.js
    const ctx = document.getElementById('entregasChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: mockData.tendenciaEntregas.labels,
                datasets: [
                    {
                        label: 'Entregas',
                        data: mockData.tendenciaEntregas.entregas.slice(0,8),
                        backgroundColor: '#0052FF',
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Completadas',
                        data: mockData.tendenciaEntregas.completadas.slice(0,8),
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
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#E2E8F0', drawBorder: false },
                        ticks: { color: '#A3AED0' }
                    },
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: '#A3AED0' }
                    }
                }
            }
        });
    }

    // 4. Init Google Maps with Traffic Layer
    const mapEl = document.getElementById('inicio-map');
    if (mapEl) {
        window.API.getConfig().then(config => {
            if(!config.mapsApiKey) {
                console.error("No se encontró MAPS_API_KEY en la configuración");
                return;
            }
            
            // Function to init the map once script is loaded
            window.initGoogleMap = () => {
                const map = new google.maps.Map(mapEl, {
                    center: { lat: -33.4489, lng: -70.6693 }, // Santiago, Chile
                    zoom: 11,
                    disableDefaultUI: true,
                    zoomControl: true
                });

                // Add Traffic Layer (Trafico en vivo)
                const trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);

                // Add some dummy markers (Circles for visual similarity)
                const markers = [
                    { lat: -33.42, lng: -70.60, color: '#01B574' }, // A tiempo
                    { lat: -33.48, lng: -70.70, color: '#01B574' },
                    { lat: -33.40, lng: -70.55, color: '#FFCE20' }, // En riesgo
                    { lat: -33.50, lng: -70.58, color: '#EE5D50' }  // Retrasada
                ];

                markers.forEach(m => {
                    new google.maps.Circle({
                        strokeColor: '#FFFFFF',
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        fillColor: m.color,
                        fillOpacity: 1,
                        map,
                        center: { lat: m.lat, lng: m.lng },
                        radius: 800
                    });
                });
            };

            // Check if google maps is already loaded
            if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${config.mapsApiKey}&callback=initGoogleMap`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            } else {
                window.initGoogleMap();
            }
        }).catch(err => console.error("Error cargando configuración de mapa:", err));
    }

    // 5. Edición Didáctica de KPIs
    document.querySelectorAll('.editable-kpi').forEach(el => {
        el.title = "Haz clic para editar este valor";
        el.style.cursor = "pointer";
        el.style.borderBottom = "1px dashed var(--primary)";
        
        el.addEventListener('click', (e) => {
            const kpiKey = e.target.dataset.kpi;
            const currentVal = mockData.kpisInicio[kpiKey].valor;
            const newVal = prompt(`Ingresa el nuevo valor para ${kpiKey}:`, currentVal);
            if (newVal) {
                mockData.kpisInicio[kpiKey].valor = newVal;
                window.navigate('inicio'); // Recargar vista
            }
        });
    });
};
