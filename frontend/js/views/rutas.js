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
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="rutas-table-body">
                                <tr><td colspan="11" style="text-align:center; padding: 20px;">Cargando rutas...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Optimization Panel (Static for visual) -->
            <div class="card detail-panel" id="ruta-detail-panel" style="display: none;">
                <div class="detail-header">
                    <h3 class="card-title">Optimización de ruta</h3>
                    <i class="ph ph-x" style="font-size: 20px; color: var(--text-muted); cursor: pointer;" onclick="document.getElementById('ruta-detail-panel').style.display='none'"></i>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="id-icon" style="width: 40px; height: 40px; font-size: 20px;"><i class="ph-fill ph-cube"></i></div>
                        <div>
                            <h4 style="font-size: 16px; font-weight: 700;" id="det-ruta-nombre">Ruta R3 <span style="font-weight: 400; color: var(--text-muted);" id="det-ruta-zona"></span></h4>
                        </div>
                    </div>
                    <div class="status-badge ontime" id="det-ruta-estado">Activa</div>
                </div>

                <div style="display: flex; gap: 16px; margin-bottom: 24px; font-size: 13px; color: var(--text-main); font-weight: 500;">
                    <div style="display: flex; align-items: center; gap: 6px;"><i class="ph-fill ph-truck" style="color: var(--primary);"></i> <span id="det-ruta-vehiculo"></span></div>
                    <div style="display: flex; align-items: center; gap: 6px;"><i class="ph-fill ph-user" style="color: var(--primary);"></i> <span id="det-ruta-conductor"></span></div>
                    <div style="display: flex; align-items: center; gap: 6px;"><i class="ph-fill ph-map-pin" style="color: var(--primary);"></i> <span id="det-ruta-paradas"></span></div>
                    <div style="display: flex; align-items: center; gap: 6px;"><i class="ph-fill ph-navigation-arrow" style="color: var(--primary);"></i> <span id="det-ruta-distancia"></span></div>
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
                    <button id="btn-aplicar-opt" class="btn btn-primary" style="flex: 1;"><i class="ph-fill ph-sparkle"></i> Aplicar optimización</button>
                    <button id="btn-ver-detalles" class="btn" style="flex: 1; border: 1px solid var(--primary); color: var(--primary); background: white;">Ver detalle</button>
                </div>
            </div>
        </div>
    `;
};

const initRutas = async () => {
    // Action helper to refresh after operation
    window.refreshRutas = () => { window.navigate('rutas'); };

    try {
        const rutas = await window.API.getRutas();
        
        // Render KPIs based on rutas
        const activas = rutas.filter(r => r.estado === 'Activa' || r.estado === 'EN_CURSO').length;
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
                if(r.estado === 'Planificada' || r.estado === 'PLANIFICADA') { statusClass = 'outline'; barColor = 'blue'; }
                if(r.estado === 'En riesgo') { statusClass = 'risk'; barColor = 'blue'; }

                let actions = `<button onclick="window.agregarParada(${r.id})" title="Agregar Parada" style="border:none;background:none;color:var(--primary);cursor:pointer;"><i class="ph-bold ph-plus-circle"></i></button>`;
                if (r.estado === 'PLANIFICADA') {
                    actions += `<button onclick="window.asignarRuta(${r.id})" title="Asignar" style="border:none;background:none;color:var(--warning);cursor:pointer;margin-left:8px;"><i class="ph-bold ph-user-plus"></i></button>`;
                } else if (r.estado === 'ASIGNADA') {
                    actions += `<button onclick="window.iniciarRuta(${r.id})" title="Iniciar Ruta" style="border:none;background:none;color:var(--success);cursor:pointer;margin-left:8px;"><i class="ph-bold ph-play"></i></button>`;
                } else if (r.estado === 'EN_CURSO') {
                    actions += `<button onclick="window.cerrarRuta(${r.id})" title="Cerrar Ruta" style="border:none;background:none;color:var(--error);cursor:pointer;margin-left:8px;"><i class="ph-bold ph-check-square"></i></button>`;
                }

                return `
                    <tr style="cursor:pointer;" onclick="window.showRutaDetail(${r.id}, '${r.nombre}', '${r.zona}', '${r.estado}', '${r.vehiculo || 'No asig.'}', '${r.conductor || 'No asig.'}', ${r.paradas}, ${r.distancia})">
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
                        <td>${actions}</td>
                    </tr>
                `;
            }).join('');
        }

        
        let selectedRutaId = null;
        window.showRutaDetail = (id, nombre, zona, estado, vehiculo, conductor, paradas, distancia) => {
            selectedRutaId = id;
            document.getElementById('ruta-detail-panel').style.display = 'block';
            document.getElementById('det-ruta-nombre').innerHTML = nombre + ' <span style="font-weight: 400; color: var(--text-muted);">· ' + zona + '</span>';
            document.getElementById('det-ruta-estado').textContent = estado;
            document.getElementById('det-ruta-vehiculo').textContent = vehiculo;
            document.getElementById('det-ruta-conductor').textContent = conductor;
            document.getElementById('det-ruta-paradas').textContent = paradas;
            document.getElementById('det-ruta-distancia').textContent = distancia + ' km';
        };

        const btnOpt = document.getElementById('btn-aplicar-opt');
        if(btnOpt) {
            btnOpt.onclick = async () => {
                if(!selectedRutaId) return;
                try {
                    await window.API.decidirOptimizacion(selectedRutaId, { decision: 'APROBADA' });
                    window.showToast('Optimización aplicada con éxito en la base de datos.', 'success');
                    window.refreshRutas();
                } catch(e) { window.showToast(e.message, 'error'); }
            };
        }

        const btnDet = document.getElementById('btn-ver-detalles');
        if(btnDet) {
            btnDet.onclick = async () => {
                if(!selectedRutaId) return;
                try {
                    const detalles = await window.API.consultarRuta(selectedRutaId);
                    window.showModal('Detalles Reales de Ruta #' + selectedRutaId, [
                        {id: 'info', label: 'Datos JSON', type: 'hidden'}
                    ], () => {});
                    const modalBody = document.querySelector('.modal-body');
                    if(modalBody) {
                        modalBody.innerHTML = '<pre style="background:#f8f9fa;padding:10px;border-radius:4px;font-size:12px;overflow-x:auto;">' + JSON.stringify(detalles, null, 2) + '</pre>';
                    }
                } catch(e) { window.showToast('Error cargando detalles: ' + e.message, 'error'); }
            };
        }

        // Action binding for "Crear ruta"
        const headerActionBtn = document.getElementById('header-action-btn');
        if (headerActionBtn) {
            headerActionBtn.onclick = () => {
                window.showModal('Crear nueva ruta', [
                    { id: 'nombre', label: 'Nombre de la ruta' },
                    { id: 'centro', label: 'ID del Centro', value: '1' },
                    { id: 'zona', label: 'ID de la Zona', value: '1' }
                ], async (values) => {
                    if (values.nombre && values.centro && values.zona) {
                        try {
                            const res = await window.API.crearRuta({
                                id_centro: parseInt(values.centro),
                                id_zona: parseInt(values.zona),
                                nombre: values.nombre,
                                fecha_planificada: new Date().toISOString()
                            });
                            window.showToast(res.mensaje + " ID: " + res.id_ruta, 'success');
                            window.refreshRutas();
                        } catch(err) {
                            window.showToast("Error: " + err.message, 'error');
                        }
                    }
                });
            };
        }

    } catch(e) {
        console.error("Error al cargar rutas", e);
    }

    // Funciones globales para botones inline
    window.agregarParada = (id_ruta) => {
        window.showModal('Agregar Parada', [
            { id: 'id_pedido', label: 'ID del Pedido a agregar' },
            { id: 'seq', label: 'Secuencia (Número)', value: '1' }
        ], async (values) => {
            if (values.id_pedido && values.seq) {
                try {
                    await window.API.agregarParada(id_ruta, { id_pedido: parseInt(values.id_pedido), secuencia: parseInt(values.seq) });
                    window.showToast("Parada agregada.", 'success');
                    window.refreshRutas();
                } catch(err) { window.showToast(err.message, 'error'); }
            }
        });
    };
    window.asignarRuta = async (id_ruta) => {
        try {
            const flota = await window.API.getFlota();
            const activos = flota.filter(f => f.estado === 'Activo');
            
            // Generate a mock weight to simulate intelligent recommendation
            // In a real scenario, this would come from getDetallesRuta() -> paradas
            const mockWeight = Math.floor(Math.random() * 20); // 0 to 19 kg
            const isLight = mockWeight < 10;
            
            let vehiculoRecomendado = activos.find(v => (isLight ? v.tipo === 'Liviano' : v.tipo !== 'Liviano')) || activos[0];
            
            // Si la db no tiene "tipo", nos basamos en una heurística simple o solo alertamos del peso
            let recoHtml = `
                <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 12px;">
                        <i class="ph-fill ph-sparkle" style="color: var(--primary); font-size: 20px;"></i>
                        <div>
                            <h4 style="color: var(--primary); font-size: 13px; font-weight: 700; margin-bottom: 4px;">Recomendación Inteligente</h4>
                            <p style="color: #1E3A8A; font-size: 12px; line-height: 1.4;">
                                Peso total estimado: <strong>${mockWeight} kg</strong>.<br>
                                Sugerencia: <strong>${isLight ? 'Vehículo Liviano' : 'Camión Pesado'}</strong>. 
                                ${vehiculoRecomendado ? `<br>El sistema recomienda asignar a <strong>${vehiculoRecomendado.patente}</strong> (Conductor: ${vehiculoRecomendado.conductor || 'Disponible'}) porque se encuentra activo y optimizado para esta ruta.` : 'No hay vehículos ideales disponibles, pero puedes elegir de la lista.'}
                            </p>
                        </div>
                    </div>
                </div>
            `;

            const vehiculoOptions = activos.map(v => ({
                value: v.id,
                text: `${v.patente} - ${v.conductor || 'Sin Conductor'} (${v.estado})`,
                selected: vehiculoRecomendado && vehiculoRecomendado.id === v.id
            }));

            if (vehiculoOptions.length === 0) {
                vehiculoOptions.push({ value: '1', text: 'Vehículo Genérico (Mock)' });
            }

            window.showModal('Asignar Ruta', [
                { type: 'custom', html: recoHtml },
                { id: 'id_vehiculo', label: 'Seleccionar Vehículo', type: 'select', options: vehiculoOptions },
                { id: 'id_conductor', label: 'ID Conductor (Opcional - Hereda de vehículo)', value: '1' }
            ], async (values) => {
                if (values.id_vehiculo) {
                    try {
                        await window.API.asignarRuta(id_ruta, { id_vehiculo: parseInt(values.id_vehiculo), id_conductor: parseInt(values.id_conductor || 1) });
                        window.showToast("Ruta asignada.", 'success');
                        window.refreshRutas();
                    } catch(err) { window.showToast(err.message, 'error'); }
                }
            });
        } catch(e) {
            window.showToast("Error al cargar datos para asignación: " + e.message, 'error');
        }
    };
    window.iniciarRuta = (id_ruta) => {
        window.showModal('Iniciar Ruta', [
            { id: 'confirm', label: '¿Estás seguro que deseas iniciar la ruta?', type: 'hidden' }
        ], async () => {
            try {
                await window.API.iniciarRuta(id_ruta);
                window.showToast("Ruta en curso.", 'success');
                window.refreshRutas();
            } catch(err) { window.showToast(err.message, 'error'); }
        });
    };
    window.cerrarRuta = (id_ruta) => {
        window.showModal('Cerrar Ruta', [
            { id: 'confirm', label: '¿Cerrar ruta definitivamente?', type: 'hidden' }
        ], async () => {
            try {
                await window.API.cerrarRuta(id_ruta);
                window.showToast("Ruta cerrada exitosamente.", 'success');
                window.refreshRutas();
            } catch(err) { window.showToast(err.message, 'error'); }
        });
    };

    // 2. Init Google Maps
    const mapEl = document.getElementById('rutas-map');
    if (mapEl) {
        window.API.getConfig().then(config => {
            if(!config.mapsApiKey) return;
            
            window.initGoogleMapRutas = async () => {
                const map = new google.maps.Map(mapEl, {
                    center: { lat: -33.4489, lng: -70.6693 },
                    zoom: 11,
                    disableDefaultUI: true,
                    zoomControl: true
                });

                const trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);

                try {
                    const rutasMapa = await window.API.getMapaRutas();
                    const directionsService = new google.maps.DirectionsService();

                    const bounds = new google.maps.LatLngBounds();
                    let colorIndex = 0;
                    const colors = ['#673AB7', '#E91E63', '#FF9800', '#2196F3', '#4CAF50'];

                    rutasMapa.forEach(ruta => {
                        const origen = new google.maps.LatLng(ruta.origen_lat, ruta.origen_lng);
                        const destino = new google.maps.LatLng(ruta.destino_lat, ruta.destino_lng);

                        const color = colors[colorIndex % colors.length];
                        colorIndex++;

                        const directionsRenderer = new google.maps.DirectionsRenderer({
                            map: map,
                            suppressMarkers: false,
                            polylineOptions: {
                                strokeColor: color,
                                strokeWeight: 5,
                                strokeOpacity: 0.9
                            }
                        });

                        directionsService.route({
                            origin: origen,
                            destination: destino,
                            travelMode: google.maps.TravelMode.DRIVING
                        }, (response, status) => {
                            if (status === 'OK') {
                                directionsRenderer.setDirections(response);
                                const routeBounds = response.routes[0].bounds;
                                bounds.union(routeBounds);
                                map.fitBounds(bounds);
                            } else {
                                console.warn('No se pudo trazar ruta para: ' + ruta.nombre, status);
                            }
                        });
                    });

                } catch (e) {
                    console.error("Error cargando datos del mapa", e);
                }
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
