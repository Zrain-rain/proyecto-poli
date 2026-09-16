// js/views/rutas.js

const renderRutas = () => {
    return `
        <div class="dashboard-grid" style="grid-template-columns: repeat(3, 1fr);" id="rutas-kpis-container">
            <!-- KPIs Injected via JS -->
            <div style="padding: 20px; color: var(--text-muted);">Cargando...</div>
        </div>

        <div class="operation-layout">
            <!-- Map and Routes List -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card" style="padding: 16px;">
                    <div class="card-header">
                        <h3 class="card-title">Mapa de rutas</h3>
                        <div class="filters-row">
                            <div class="badge-pill outline" style="border-color: var(--primary); color: var(--primary); background: #EFF6FF;">Todas</div>
                            <div class="badge-pill outline"><div class="dot green"></div> Activas</div>
                            <div class="badge-pill outline"><div class="dot blue"></div> Planificadas</div>
                            <div class="badge-pill outline"><div class="dot warning"></div> En riesgo</div>
                            <select class="filter-select"><option>Zona</option></select>
                        </div>
                    </div>
                    <div id="rutas-map" class="map-container" style="border-radius: 12px;"></div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de rutas</h3>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Zona</th>
                                    <th>Estado</th>
                                    <th>Vehículo</th>
                                    <th>Conductor</th>
                                    <th>Paradas</th>
                                    <th>Distancia</th>
                                    <th>Tiempo estimado</th>
                                    <th>Avance</th>
                                </tr>
                            </thead>
                            <tbody id="rutas-table-body">
                                <tr><td colspan="10" style="text-align:center; padding: 20px;">Cargando rutas...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Optimization Panel (Static for visual) -->
            <div class="card detail-panel">
                <div class="detail-header">
                    <h3 class="card-title">Optimización de ruta</h3>
                    <i class="ph ph-x" style="font-size: 20px; color: var(--text-muted); cursor: pointer;"></i>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="id-icon" style="width: 40px; height: 40px; font-size: 20px;"><i class="ph-fill ph-cube"></i></div>
                        <div>
                            <h4 style="font-size: 16px; font-weight: 700;">Ruta R3 <span style="font-weight: 400; color: var(--text-muted);">· Sector Oriente</span></h4>
                        </div>
                    </div>
                    <div class="status-badge ontime">Activa</div>
                </div>

                <div style="display: flex; gap: 16px; margin-bottom: 24px; font-size: 13px; color: var(--text-main); font-weight: 500;">
                    <div style="display: flex; align-items: center; gap: 6px;"><i class="ph-fill ph-truck" style="color: var(--primary);"></i> V-207</div>
                    <div style="display: flex; align-items: center; gap: 6px;"><i class="ph-fill ph-user" style="color: var(--primary);"></i> M. Silva</div>
                    <div style="display: flex; align-items: center; gap: 6px;"><i class="ph-fill ph-map-pin" style="color: var(--primary);"></i> 18</div>
                    <div style="display: flex; align-items: center; gap: 6px;"><i class="ph-fill ph-navigation-arrow" style="color: var(--primary);"></i> 64 km</div>
                </div>

                <div style="background-color: #F8FAFC; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px;">
                        <span style="color: var(--text-muted);">Ruta actual:</span>
                        <span style="font-weight: 600;">78 km · 4 h 10 min</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px;">
                        <span style="color: var(--text-muted);">Ruta optimizada:</span>
                        <span style="font-weight: 600; color: var(--success);">64 km · 3 h 25 min</span>
                    </div>
                    <hr style="border: none; border-top: 1px solid var(--border-color); margin: 12px 0;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span style="color: var(--text-muted);">Mejora:</span>
                        <span style="font-weight: 700; color: var(--success);">-14 km · -45 min</span>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 24px;">
                    <div class="badge-pill outline"><i class="ph-fill ph-gear"></i> OR-Tools</div>
                    <div class="badge-pill outline" style="color: var(--primary);"><i class="ph-fill ph-sparkle"></i> Gemini 2.1 Pro</div>
                </div>

                <div style="background-color: #FFFBEB; border: 1px solid #FFCE20; border-radius: 12px; padding: 16px; display: flex; gap: 12px; margin-bottom: 24px;">
                    <i class="ph-fill ph-warning" style="color: var(--warning); font-size: 20px;"></i>
                    <div>
                        <h4 style="color: #975A16; font-size: 13px; font-weight: 700; margin-bottom: 4px;">Evitar Av. Kennedy por congestión</h4>
                        <p style="color: #975A16; font-size: 12px; line-height: 1.4;">Reordenar las paradas 7, 8 y 9 reduce el atraso estimado.</p>
                    </div>
                </div>

                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-primary" style="flex: 1;"><i class="ph-fill ph-sparkle"></i> Aplicar optimización</button>
                    <button class="btn" style="flex: 1; border: 1px solid var(--primary); color: var(--primary); background: white;">Ver detalle</button>
                </div>
            </div>
        </div>
    `;
};

const initRutas = async () => {
    try {
        const rutas = await window.API.getRutas();
        
        // Render KPIs based on rutas
        const activas = rutas.filter(r => r.estado === 'Activa').length;
        const enRiesgo = rutas.filter(r => r.estado === 'En riesgo').length;
        const kmTotal = rutas.reduce((acc, r) => acc + (r.distancia || 0), 0);

        const kpiContainer = document.getElementById('rutas-kpis-container');
        if (kpiContainer) {
            kpiContainer.innerHTML = `
                <div class="card kpi-card">
                    <div class="kpi-icon blue"><i class="ph-fill ph-map-pin-line"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row"><span class="kpi-value">${activas}</span></div>
                        <div class="kpi-label">Rutas activas</div>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="kpi-icon warning"><i class="ph-fill ph-warning"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row"><span class="kpi-value">${enRiesgo}</span></div>
                        <div class="kpi-label">Rutas en riesgo</div>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="kpi-icon" style="background: #EEF2FF; color: #4338CA;"><i class="ph-fill ph-road-horizon"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row"><span class="kpi-value">${kmTotal}</span></div>
                        <div class="kpi-label">km planificados</div>
                    </div>
                </div>
            `;
        }

        // Init Table
        const tbody = document.getElementById('rutas-table-body');
        if (tbody && rutas) {
            tbody.innerHTML = rutas.map(r => {
                let statusClass = 'ontime';
                let barColor = 'green';
                if(r.estado === 'Planificada') { statusClass = 'outline'; barColor = 'blue'; }
                if(r.estado === 'En riesgo') { statusClass = 'risk'; barColor = 'blue'; }

                return `
                    <tr>
                        <td style="font-weight: 600;">${r.id}</td>
                        <td>${r.nombre}</td>
                        <td>${r.zona}</td>
                        <td><span class="status-badge ${statusClass}">${r.estado}</span></td>
                        <td>${r.vehiculo || 'No asig.'}</td>
                        <td>${r.conductor || 'No asig.'}</td>
                        <td>${r.paradas}</td>
                        <td>${r.distancia} km</td>
                        <td>${r.tiempoEstimado}</td>
                        <td>
                            <div class="progress-cell">
                                <span style="width: 35px; font-size: 12px; font-weight: 600;">${r.avance}%</span>
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill ${barColor}" style="width: ${r.avance}%;"></div>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

    } catch(e) {
        console.error("Error al cargar rutas", e);
    }

    // 2. Init Google Maps
    const mapEl = document.getElementById('rutas-map');
    if (mapEl) {
        window.API.getConfig().then(config => {
            if(!config.mapsApiKey) return;
            
            window.initGoogleMapRutas = () => {
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
                script.src = `https://maps.googleapis.com/maps/api/js?key=${config.mapsApiKey}&callback=initGoogleMapRutas`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            } else {
                window.initGoogleMapRutas();
            }
        }).catch(err => console.error(err));
    }
};
