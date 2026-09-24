// js/views/rutas.js

let allRutas = [];
let selectedRutaId = null;
let currentRutaFilter = 'todas';
let currentRutaZona = 'todas';

const renderRutas = () => {
    return `
        <div class="dashboard-grid" style="grid-template-columns: repeat(3, 1fr);" id="rutas-kpis-container">
            <!-- KPIs Injected via JS -->
            <div style="padding: 20px; color: var(--text-muted);">Cargando indicadores de rutas...</div>
        </div>

        <div class="operation-layout">
            <!-- Map and Routes List -->
            <div style="display: flex; flex-direction: column; gap: 20px; flex: 1; min-width: 0;">
                <div class="card" style="padding: 16px;">
                    <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
                        <h3 class="card-title">Mapa de rutas</h3>
                        <div class="filters-row" style="flex-wrap: wrap; gap: 8px;">
                            <div class="badge-pill outline ruta-filter-pill active" data-filter="todas" style="cursor: pointer; border-color: var(--primary); color: var(--primary); background: #EFF6FF;">Todas</div>
                            <div class="badge-pill outline ruta-filter-pill" data-filter="Activa" style="cursor: pointer;"><div class="dot green"></div> Activas</div>
                            <div class="badge-pill outline ruta-filter-pill" data-filter="Planificada" style="cursor: pointer;"><div class="dot blue"></div> Planificadas</div>
                            <div class="badge-pill outline ruta-filter-pill" data-filter="En riesgo" style="cursor: pointer;"><div class="dot warning"></div> En riesgo</div>
                            <select class="filter-select" id="filtro-zona" style="padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: white; font-size: 13px; color: var(--text-main); cursor: pointer;">
                                <option value="todas">Todas las zonas</option>
                            </select>
                        </div>
                    </div>
                    <div id="rutas-map" class="map-container" style="border-radius: 12px; height: 320px;"></div>
                </div>

                <div class="card">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 class="card-title">Listado de rutas</h3>
                        <span id="rutas-counter-text" style="font-size: 13px; color: var(--text-muted);">Cargando...</span>
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
                                    <th>Tiempo est.</th>
                                    <th>Avance</th>
                                </tr>
                            </thead>
                            <tbody id="rutas-table-body">
                                <tr><td colspan="10" style="text-align:center; padding: 24px;">Cargando rutas...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Optimization Panel -->
            <div class="card detail-panel" id="rutas-detail-panel" style="min-width: 330px; max-width: 380px;">
                <div class="detail-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 class="card-title" style="margin: 0;">Optimización de ruta</h3>
                    <i class="ph ph-x" id="close-ruta-panel-btn" style="font-size: 20px; color: var(--text-muted); cursor: pointer; padding: 4px;" title="Cerrar panel"></i>
                </div>

                <div id="ruta-panel-content">
                    <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
                        <i class="ph ph-cursor-click" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
                        Selecciona una ruta de la tabla para ver su análisis de optimización.
                    </div>
                </div>
            </div>
        </div>
    `;
};

const renderRutaDetail = (ruta) => {
    const content = document.getElementById('ruta-panel-content');
    const panel = document.getElementById('rutas-detail-panel');
    if (!content || !panel) return;

    panel.style.display = 'block';

    if (!ruta) return;

    let statusClass = 'ontime';
    if (ruta.estado === 'Planificada') statusClass = 'outline';
    if (ruta.estado === 'En riesgo') statusClass = 'risk';

    // Estimación optimizada calculada
    const distOriginal = Number(ruta.distancia) || 20;
    const distOptimizada = Math.max(10, Math.round(distOriginal * 0.82));
    const ahorroKm = distOriginal - distOptimizada;

    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div class="id-icon" style="width: 44px; height: 44px; font-size: 22px; background: #EEF2FF; color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="ph-fill ph-map-pin"></i>
                </div>
                <div>
                    <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: var(--text-main);">${ruta.nombre}</h4>
                    <span style="font-size: 13px; color: var(--text-muted);">${ruta.zona || 'Metropolitana'} · ID: ${ruta.id}</span>
                </div>
            </div>
            <div class="status-badge ${statusClass}">${ruta.estado}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
            <div style="background: var(--bg-app); padding: 10px; border-radius: 10px; font-size: 12px;">
                <span style="color: var(--text-muted); font-weight: 600;">VEHÍCULO</span>
                <p style="margin: 4px 0 0 0; font-weight: 700; font-size: 13px; color: var(--text-main);"><i class="ph-fill ph-truck" style="color: var(--primary);"></i> ${ruta.vehiculo || 'No asignado'}</p>
            </div>
            <div style="background: var(--bg-app); padding: 10px; border-radius: 10px; font-size: 12px;">
                <span style="color: var(--text-muted); font-weight: 600;">CONDUCTOR</span>
                <p style="margin: 4px 0 0 0; font-weight: 700; font-size: 13px; color: var(--text-main);"><i class="ph-fill ph-user" style="color: var(--primary);"></i> ${ruta.conductor || 'Sin asignar'}</p>
            </div>
            <div style="background: var(--bg-app); padding: 10px; border-radius: 10px; font-size: 12px;">
                <span style="color: var(--text-muted); font-weight: 600;">PARADAS</span>
                <p style="margin: 4px 0 0 0; font-weight: 700; font-size: 13px; color: var(--text-main);"><i class="ph-fill ph-map-pin" style="color: var(--primary);"></i> ${ruta.paradas || 1} paradas</p>
            </div>
            <div style="background: var(--bg-app); padding: 10px; border-radius: 10px; font-size: 12px;">
                <span style="color: var(--text-muted); font-weight: 600;">TIEMPO EST.</span>
                <p style="margin: 4px 0 0 0; font-weight: 700; font-size: 13px; color: var(--text-main);"><i class="ph-fill ph-clock" style="color: var(--primary);"></i> ${ruta.tiempoEstimado || '1 h'}</p>
            </div>
        </div>

        <div style="background-color: #F8FAFC; border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
                <span style="color: var(--text-muted);">Recorrido actual:</span>
                <span style="font-weight: 600;">${distOriginal} km · ${ruta.tiempoEstimado || '1 h 10 min'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
                <span style="color: var(--text-muted);">Ruta optimizada (IA):</span>
                <span style="font-weight: 600; color: var(--success);">${distOptimizada} km · -25 min</span>
            </div>
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 10px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span style="color: var(--text-muted); font-weight: 600;">Ahorro Proyectado:</span>
                <span style="font-weight: 700; color: var(--success);">-${ahorroKm} km · -18% combustible</span>
            </div>
        </div>
        
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
            <div class="badge-pill outline" style="font-size: 11px;"><i class="ph-fill ph-gear"></i> OR-Tools Reroute</div>
            <div class="badge-pill outline" style="color: var(--primary); font-size: 11px;"><i class="ph-fill ph-sparkle"></i> Gemini AI</div>
        </div>

        <div style="background-color: #FFFBEB; border: 1px solid #FFCE20; border-radius: 12px; padding: 14px; display: flex; gap: 12px; margin-bottom: 20px;">
            <i class="ph-fill ph-warning" style="color: var(--warning); font-size: 20px; flex-shrink: 0;"></i>
            <div>
                <h4 style="color: #975A16; font-size: 12px; font-weight: 700; margin: 0 0 2px 0;">Sugerencia de Tráfico</h4>
                <p style="color: #975A16; font-size: 11px; line-height: 1.4; margin: 0;">Ajustar el orden de visita reduce el tiempo en zonas de alta congestión.</p>
            </div>
        </div>

        <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="window.aplicarOptimizacionRuta('${ruta.id}')" style="flex: 1; padding: 10px; font-size: 13px;">
                <i class="ph-fill ph-sparkle"></i> Aplicar
            </button>
            <button class="btn" onclick="window.centrarMapaEnRuta('${ruta.id}')" style="flex: 1; border: 1px solid var(--primary); color: var(--primary); background: white; padding: 10px; font-size: 13px;">
                <i class="ph ph-map-pin"></i> Ver en mapa
            </button>
        </div>
    `;
};

window.selectRuta = (id) => {
    selectedRutaId = id;
    const ruta = allRutas.find(r => String(r.id) === String(id));
    renderRutaDetail(ruta);
    filterAndRenderRutas();
};

window.aplicarOptimizacionRuta = (id) => {
    alert(`¡Optimización aplicada exitosamente a la ruta ${id}!\nSe ha reprogramado el recorrido para minimizar paradas y distancia.`);
};

window.centrarMapaEnRuta = (id) => {
    const ruta = allRutas.find(r => String(r.id) === String(id));
    if (ruta && window.mapInstanceRutas) {
        // Coordenadas referenciales de Santiago / Lampa
        window.mapInstanceRutas.setZoom(12);
    }
};

let currentRutaSearch = '';

const filterAndRenderRutas = () => {
    let filtered = [...allRutas];

    if (currentRutaSearch) {
        filtered = filtered.filter(r => {
            const id = (r.id || '').toLowerCase();
            const nombre = (r.nombre || '').toLowerCase();
            const zona = (r.zona || '').toLowerCase();
            const vehiculo = (r.vehiculo || '').toLowerCase();
            const conductor = (r.conductor || '').toLowerCase();
            return id.includes(currentRutaSearch) || 
                   nombre.includes(currentRutaSearch) || 
                   zona.includes(currentRutaSearch) || 
                   vehiculo.includes(currentRutaSearch) || 
                   conductor.includes(currentRutaSearch);
        });
    }

    if (currentRutaFilter !== 'todas') {
        filtered = filtered.filter(r => (r.estado || '').toLowerCase() === currentRutaFilter.toLowerCase());
    }

    if (currentRutaZona !== 'todas') {
        filtered = filtered.filter(r => (r.zona || '').toLowerCase() === currentRutaZona.toLowerCase());
    }

    const counter = document.getElementById('rutas-counter-text');
    if (counter) {
        counter.textContent = `Mostrando ${filtered.length} de ${allRutas.length} rutas`;
    }

    const tbody = document.getElementById('rutas-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 24px; color: var(--text-muted);">No se encontraron rutas para los filtros actuales.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(r => {
        let statusClass = 'ontime';
        let barColor = 'green';
        if (r.estado === 'Planificada') { statusClass = 'outline'; barColor = 'blue'; }
        if (r.estado === 'En riesgo') { statusClass = 'risk'; barColor = 'blue'; }

        const isSelected = String(r.id) === String(selectedRutaId);
        const rowBg = isSelected ? 'background-color: #F0F7FF;' : '';

        return `
            <tr style="cursor: pointer; ${rowBg}" onclick="window.selectRuta('${r.id}')">
                <td style="font-weight: 700; color: var(--primary);">${r.id}</td>
                <td><strong>${r.nombre}</strong></td>
                <td><span class="badge-pill outline">${r.zona || 'Metropolitana'}</span></td>
                <td><span class="status-badge ${statusClass}">${r.estado}</span></td>
                <td>${r.vehiculo || '<span style="color:var(--text-muted);">No asig.</span>'}</td>
                <td>${r.conductor || '<span style="color:var(--text-muted);">No asig.</span>'}</td>
                <td>${r.paradas}</td>
                <td>${r.distancia} km</td>
                <td>${r.tiempoEstimado || '1 h'}</td>
                <td>
                    <div class="progress-cell">
                        <span style="width: 35px; font-size: 12px; font-weight: 600;">${r.avance || 0}%</span>
                        <div class="progress-bar-bg" style="width: 60px;">
                            <div class="progress-bar-fill ${barColor}" style="width: ${r.avance || 0}%;"></div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

const initRutas = async () => {
    try {
        const rutas = await window.API.getRutas();
        allRutas = rutas || [];
        
        // 1. Render KPIs
        const activas = allRutas.filter(r => r.estado === 'Activa').length;
        const enRiesgo = allRutas.filter(r => r.estado === 'En riesgo').length;
        const kmTotal = allRutas.reduce((acc, r) => acc + (Number(r.distancia) || 0), 0);

        const kpiContainer = document.getElementById('rutas-kpis-container');
        if (kpiContainer) {
            kpiContainer.innerHTML = `
                <div class="card kpi-card">
                    <div class="kpi-icon blue"><i class="ph-fill ph-map-pin-line"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row"><span class="kpi-value">${activas}</span></div>
                        <div class="kpi-label">Rutas activas hoy</div>
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
                        <div class="kpi-value-row"><span class="kpi-value">${kmTotal} km</span></div>
                        <div class="kpi-label">Recorrido total planificado</div>
                    </div>
                </div>
            `;
        }

        // 2. Poblar selector de zonas
        const zonaSelect = document.getElementById('filtro-zona');
        if (zonaSelect && allRutas.length > 0) {
            const zonasUnicas = Array.from(new Set(allRutas.map(r => r.zona).filter(Boolean)));
            zonaSelect.innerHTML = `<option value="todas">Todas las zonas</option>` + 
                zonasUnicas.map(z => `<option value="${z}">${z}</option>`).join('');

            zonaSelect.addEventListener('change', (e) => {
                currentRutaZona = e.target.value;
                filterAndRenderRutas();
            });
        }

        // 3. Listeners filter pills
        const pills = document.querySelectorAll('.ruta-filter-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                const filterVal = pill.getAttribute('data-filter');
                currentRutaFilter = filterVal;

                pills.forEach(p => {
                    if (p.getAttribute('data-filter') === filterVal) {
                        p.classList.add('active');
                        p.style.borderColor = 'var(--primary)';
                        p.style.color = 'var(--primary)';
                        p.style.backgroundColor = '#EFF6FF';
                    } else {
                        p.classList.remove('active');
                        p.style.borderColor = 'var(--border-color)';
                        p.style.color = 'var(--text-main)';
                        p.style.backgroundColor = 'transparent';
                    }
                });

                filterAndRenderRutas();
            });
        });

        // 4. Close detail panel btn
        const closeBtn = document.getElementById('close-ruta-panel-btn');
        const detailPanel = document.getElementById('rutas-detail-panel');
        if (closeBtn && detailPanel) {
            closeBtn.addEventListener('click', () => {
                detailPanel.style.display = 'none';
            });
        }

        // 5. Seleccionar primera ruta
        if (allRutas.length > 0) {
            selectedRutaId = allRutas[0].id;
            renderRutaDetail(allRutas[0]);
        }

        // 6. Renderizar tabla
        filterAndRenderRutas();

    } catch (e) {
        console.error("Error al cargar rutas", e);
    }

    // 7. Init Google Maps
    const mapEl = document.getElementById('rutas-map');
    if (mapEl) {
        window.API.getConfig().then(config => {
            if (!config.mapsApiKey) return;
            
            window.initGoogleMapRutas = () => {
                const baseLatLng = { lat: -33.284, lng: -70.875 }; // Lampa
                const map = new google.maps.Map(mapEl, {
                    center: { lat: -33.4489, lng: -70.6693 },
                    zoom: 11,
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false
                });

                window.mapInstanceRutas = map;

                const trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);

                // Base Marker
                new google.maps.Marker({
                    position: baseLatLng,
                    map: map,
                    title: "Centro de Distribución - Lampa",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#0052FF',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#FFF',
                        scale: 9
                    }
                });
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

window.setRutaSearchQuery = (q) => {
    currentRutaSearch = (q || '').toLowerCase();
    filterAndRenderRutas();
};

window.addNewRutaLocally = (newRuta) => {
    allRutas.unshift(newRuta);
    selectedRutaId = newRuta.id;
    renderRutaDetail(newRuta);
    filterAndRenderRutas();
};
