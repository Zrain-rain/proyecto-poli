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

    let operacionesDelDia = [];

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
                        <div class="kpi-label">Entregas de hoy</div>
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
                            ${renderTrend(kpis.vehiculos?.tendencia || '0', kpis.vehiculos?.tendenciaPositiva, kpis.vehiculos?.textoTendencia || '')}
                        </div>
                        <div class="kpi-label">Vehículos y Camiones</div>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="kpi-icon red"><i class="ph-fill ph-warning"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row">
                            <span class="kpi-value">${kpis.alertasActivas?.valor || 0}</span>
                            ${renderTrend(kpis.alertasActivas?.tendencia || '0', kpis.alertasActivas?.tendenciaPositiva, kpis.alertasActivas?.textoTendencia || '')}
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
        operacionesDelDia = operaciones; // Guardamos para el mapa
        const tbody = document.getElementById('inicio-table-body');
        if (tbody && operaciones) {
            tbody.innerHTML = operaciones.slice(0, 5).map(op => {
                let statusClass = 'ontime';
                if(op.estado === 'En riesgo') statusClass = 'risk';
                if(op.estado === 'Con retraso' || op.estado === 'Retrasada') statusClass = 'delayed';

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

    // 3. Init Chart.js (Dinámico basado en operaciones)
    const ctx = document.getElementById('entregasChart');
    if (ctx && operacionesDelDia.length > 0) {
        // Agrupar por ventana horaria
        const ventanasSet = new Set(operacionesDelDia.map(op => op.ventana || op.ventana_horaria).filter(Boolean));
        const labels = Array.from(ventanasSet).sort();
        
        const dataProgramadas = labels.map(v => operacionesDelDia.filter(op => (op.ventana === v || op.ventana_horaria === v)).length);
        const dataCompletadas = labels.map(v => operacionesDelDia.filter(op => (op.ventana === v || op.ventana_horaria === v) && (op.estado === 'Entregada' || op.estado === 'A tiempo')).length);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Entregas',
                        data: dataProgramadas,
                        backgroundColor: '#0052FF',
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Completadas',
                        data: dataCompletadas,
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
                    y: { beginAtZero: true, grid: { color: '#E2E8F0', drawBorder: false }, ticks: { stepSize: 1 } },
                    x: { grid: { display: false, drawBorder: false } }
                }
            }
        });
    }

    // 4. Init Google Maps con Rutas
    const mapEl = document.getElementById('inicio-map');
    if (mapEl) {
        window.API.getConfig().then(config => {
            if(!config.mapsApiKey) return;
            
            window.initGoogleMap = () => {
                const baseLocation = "Camino las flores 1008, Lampa, Chile";
                const baseLatLng = { lat: -33.284, lng: -70.875 }; // Lampa aprox
                const map = new google.maps.Map(mapEl, {
                    center: baseLatLng,
                    zoom: 10,
                    disableDefaultUI: false, // Mostrar UI para zoom
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false
                });

                const trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);

                const bounds = new google.maps.LatLngBounds();
                
                // Marcador permanente de la Base
                const baseMarker = new google.maps.Marker({
                    position: baseLatLng,
                    map: map,
                    title: "Centro de Distribución - Lampa",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#0052FF',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#FFF',
                        scale: 10
                    }
                });
                bounds.extend(baseMarker.getPosition());

                const directionsService = new google.maps.DirectionsService();
                
                // Extraer destinos únicos de hoy para trazar rutas
                const destinos = operacionesDelDia.slice(0, 3).map(op => op.destino);
                
                destinos.forEach((destino, index) => {
                    const directionsRenderer = new google.maps.DirectionsRenderer({
                        map: map,
                        suppressMarkers: false,
                        polylineOptions: {
                            strokeColor: index === 0 ? '#0052FF' : (index === 1 ? '#01B574' : '#00B5D8'),
                            strokeWeight: 4,
                            strokeOpacity: 0.8
                        }
                    });

                    directionsService.route({
                        origin: baseLocation,
                        destination: destino,
                        travelMode: google.maps.TravelMode.DRIVING
                    }, (response, status) => {
                        if (status === 'OK') {
                            directionsRenderer.setDirections(response);
                            
                            // Ajustar los límites (zoom) del mapa incluyendo esta nueva ruta
                            const route = response.routes[0];
                            if (route && route.legs && route.legs[0]) {
                                bounds.extend(route.legs[0].end_location);
                                map.fitBounds(bounds);
                            }
                        } else {
                            console.error('Fallo al cargar ruta hacia ' + destino + ':', status);
                        }
                    });
                });
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
