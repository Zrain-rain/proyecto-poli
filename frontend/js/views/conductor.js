// js/views/conductor.js

const renderConductor = () => {
    return `
        <div class="dashboard-main" style="grid-template-columns: 1fr; margin-bottom: 0; min-height: calc(100vh - 100px);">
            <!-- Mapa pantalla completa -->
            <div class="card" style="padding: 0; position: relative; overflow: hidden; border-radius: var(--radius-lg);">
                <div id="conductor-map" style="width: 100%; height: 100%;"></div>
                
                <!-- Panel de superposición inferior para acciones -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: white; padding: 20px; border-top-left-radius: 24px; border-top-right-radius: 24px; box-shadow: 0 -10px 40px rgba(0,0,0,0.1); z-index: 10;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div>
                            <h3 style="margin: 0; font-size: 18px; color: var(--text-main);" id="conductor-greeting">Mi Ruta Asignada</h3>
                            <p style="margin: 0; font-size: 13px; color: var(--text-muted);" id="conductor-status">Cargando destinos...</p>
                        </div>
                        <div class="badge-pill outline" style="border-color: var(--primary); color: var(--primary); background: #EFF6FF;" id="conductor-id">
                            Vehículo
                        </div>
                    </div>
                    
                    <div id="conductor-stops" style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px;">
                        <!-- Stops will be injected here -->
                    </div>
                    
                    <button class="btn btn-primary" style="width: 100%; margin-top: 10px; height: 48px; font-size: 16px;" onclick="window.navigate('despachador')">
                        <i class="ph-bold ph-list-checks"></i> Ver todas mis entregas
                    </button>
                </div>
            </div>
        </div>
    `;
};

const initConductor = async () => {
    const userDisplay = localStorage.getItem('poli_user') || 'Conductor';
    document.getElementById('conductor-id').innerHTML = `<i class="ph-fill ph-truck"></i> ${userDisplay.toUpperCase()}`;
    
    let operaciones = [];
    try {
        const allOps = await window.API.getOperaciones();
        // Simular que ciertas operaciones pertenecen a este conductor usando un hash simple del nombre
        const hash = userDisplay.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
        const startIdx = Math.abs(hash) % Math.max(1, allOps.length - 3);
        operaciones = allOps.slice(startIdx, startIdx + 3);
        
        document.getElementById('conductor-status').textContent = `${operaciones.length} paradas pendientes`;
        
        const stopsContainer = document.getElementById('conductor-stops');
        if (stopsContainer && operaciones.length > 0) {
            stopsContainer.innerHTML = operaciones.map((op, i) => `
                <div style="min-width: 200px; padding: 12px; border: 1px solid var(--border-color); border-radius: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 12px; font-weight: 700; color: var(--text-muted);">PARADA ${i+1}</span>
                        <span class="status-badge ${op.estado === 'Entregada' ? 'ontime' : 'risk'}" style="font-size: 10px;">${op.estado}</span>
                    </div>
                    <strong style="font-size: 14px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${op.destino}</strong>
                    <button class="btn btn-primary" style="font-size: 12px; padding: 6px; width: 100%;" onclick="window.showToast('Funcionalidad de escanear/entregar próximamente', 'warning')">Reportar</button>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error("Error al cargar ruta:", e);
    }

    const mapEl = document.getElementById('conductor-map');
    if (mapEl) {
        window.API.getConfig().then(config => {
            if(!config.mapsApiKey) return;
            
            window.initDriverMap = () => {
                const baseLocation = "Camino las flores 1008, Lampa, Chile";
                const baseLatLng = { lat: -33.284, lng: -70.875 }; 
                const map = new google.maps.Map(mapEl, {
                    center: baseLatLng,
                    zoom: 12,
                    disableDefaultUI: true, 
                    zoomControl: true,
                });

                const trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);

                const bounds = new google.maps.LatLngBounds();
                
                const baseMarker = new google.maps.Marker({
                    position: baseLatLng,
                    map: map,
                    title: "Inicio - Lampa",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#0052FF',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#FFF',
                        scale: 8
                    }
                });
                bounds.extend(baseMarker.getPosition());

                if (operaciones.length > 0) {
                    const directionsService = new google.maps.DirectionsService();
                    const directionsRenderer = new google.maps.DirectionsRenderer({
                        map: map,
                        suppressMarkers: true,
                        polylineOptions: { strokeColor: '#0052FF', strokeWeight: 5, strokeOpacity: 0.8 }
                    });

                    const waypoints = operaciones.slice(0, -1).map(op => ({
                        location: op.destino,
                        stopover: true
                    }));
                    
                    const destination = operaciones[operaciones.length - 1].destino;

                    directionsService.route({
                        origin: baseLocation,
                        destination: destination,
                        waypoints: waypoints,
                        optimizeWaypoints: true,
                        travelMode: google.maps.TravelMode.DRIVING
                    }, (response, status) => {
                        if (status === 'OK') {
                            directionsRenderer.setDirections(response);
                            const route = response.routes[0];
                            
                            // Añadir marcadores personalizados a las paradas
                            route.legs.forEach((leg, i) => {
                                bounds.extend(leg.end_location);
                                new google.maps.Marker({
                                    position: leg.end_location,
                                    map: map,
                                    label: { text: (i + 1).toString(), color: 'white', fontWeight: 'bold' },
                                    icon: {
                                        path: google.maps.SymbolPath.CIRCLE,
                                        fillColor: '#EE5D50',
                                        fillOpacity: 1,
                                        strokeWeight: 2,
                                        strokeColor: '#FFF',
                                        scale: 12
                                    }
                                });
                            });
                            map.fitBounds(bounds);
                        } else {
                            console.error('Fallo al cargar ruta de conductor:', status);
                        }
                    });
                }
            };

            if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${config.mapsApiKey}&callback=initDriverMap`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            } else {
                window.initDriverMap();
            }
        }).catch(err => console.error("Config error:", err));
    }
};
