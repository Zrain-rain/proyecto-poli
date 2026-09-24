// js/views/operacion.js

const renderOperacion = () => {
    return `
        <div class="dashboard-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="card kpi-card">
                <div class="kpi-icon blue"><i class="ph-fill ph-cube"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value" id="kpi-op-total">...</span>
                    </div>
                    <div class="kpi-label">Entregas programadas</div>
                </div>
            </div>
            
            <div class="card kpi-card">
                <div class="kpi-icon green"><i class="ph-bold ph-check"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value" id="kpi-op-ok">...</span>
                    </div>
                    <div class="kpi-label">A tiempo</div>
                </div>
            </div>

            <div class="card kpi-card">
                <div class="kpi-icon warning"><i class="ph-fill ph-warning"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value" id="kpi-op-risk">...</span>
                    </div>
                    <div class="kpi-label">En riesgo</div>
                </div>
            </div>
        </div>

        <div class="operation-layout">
            <!-- Table -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Operaciones de entrega</h3>
                    <div class="filters-row">
                        <div class="badge-pill outline" style="border-color: var(--primary); color: var(--primary); background: #EFF6FF;">Todas</div>
                        <div class="badge-pill outline"><div class="dot green"></div> A tiempo</div>
                        <div class="badge-pill outline"><div class="dot warning"></div> En riesgo</div>
                        <div class="badge-pill outline"><div class="dot red"></div> Retrasadas</div>
                        
                        <select class="filter-select">
                            <option>Zona</option>
                        </select>
                        <select class="filter-select">
                            <option>Vehículo</option>
                        </select>
                        <select class="filter-select">
                            <option>Estado</option>
                        </select>
                    </div>
                </div>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Pedido</th>
                                <th>Destino</th>
                                <th>Ventana</th>
                                <th>Vehículo</th>
                                <th>Conductor</th>
                                <th>Estado</th>
                                <th>Avance</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="operaciones-table-body">
                            <!-- Injected via JS -->
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 16px; font-size: 13px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
                    <span id="operaciones-footer-text">Mostrando 0 operaciones</span>
                    <div style="display: flex; gap: 4px;">
                        <button class="btn" style="padding: 4px 10px; background: white; border: 1px solid var(--border-color); color: var(--text-muted);"><i class="ph ph-caret-left"></i></button>
                        <button class="btn btn-primary" style="padding: 4px 12px; border-radius: 8px;">1</button>
                        <button class="btn" style="padding: 4px 12px; background: white; border: 1px solid transparent; color: var(--text-main);">2</button>
                        <button class="btn" style="padding: 4px 12px; background: white; border: 1px solid transparent; color: var(--text-main);">3</button>
                        <button class="btn" style="padding: 4px 10px; background: white; border: 1px solid var(--border-color); color: var(--text-muted);"><i class="ph ph-caret-right"></i></button>
                    </div>
                </div>
            </div>

            <!-- Detail Panel -->
            <div class="card detail-panel">
                <div class="detail-header">
                    <div>
                        <h3 class="card-title">Detalle de operación</h3>
                    </div>
                    <i class="ph ph-x" style="font-size: 20px; color: var(--text-muted); cursor: pointer;"></i>
                </div>

                <div class="detail-id">
                    <div class="id-icon"><i class="ph-fill ph-cube"></i></div>
                    <div class="id-info">
                        <h2>#E4583</h2>
                        <p>Pedido P-78233</p>
                        <p>Ruta R3</p>
                    </div>
                    <div class="status-badge risk" style="margin-left: auto;">En riesgo</div>
                </div>

                <hr style="border: none; border-top: 1px solid var(--border-color); margin: 24px 0;">

                <div class="detail-info-grid">
                    <div class="info-item">
                        <div class="info-icon"><i class="ph-fill ph-truck"></i></div>
                        <div class="info-text">
                            <span>Vehículo</span>
                            <p>V-207</p>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-icon" style="color: var(--primary);"><i class="ph-fill ph-map-pin"></i></div>
                        <div class="info-text">
                            <span>Destino</span>
                            <p>Las Condes</p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
                        <span>Avance de ruta</span>
                        <span>68%</span>
                    </div>
                    <div class="progress-bar-bg" style="width: 100%;">
                        <div class="progress-bar-fill blue" style="width: 68%;"></div>
                    </div>
                </div>

                <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 16px;">Seguimiento de entrega</h4>
                <div class="timeline">
                    <div class="timeline-item completed">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <h4>Pedido recibido</h4>
                            <p>06 de jul, 08:15</p>
                        </div>
                    </div>
                    <div class="timeline-item completed">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <h4>Carga asignada</h4>
                            <p>06 de jul, 09:10</p>
                        </div>
                    </div>
                    <div class="timeline-item current">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <h4>En ruta</h4>
                            <p>06 de jul, 10:24</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <h4 style="color: var(--text-muted);">Entrega estimada</h4>
                            <p>06 de jul, 11:45</p>
                        </div>
                    </div>
                </div>

                <div style="background-color: #FFFBEB; border: 1px solid #FFCE20; border-radius: 12px; padding: 16px; display: flex; gap: 12px; margin-top: 24px;">
                    <i class="ph-fill ph-warning" style="color: var(--warning); font-size: 20px;"></i>
                    <div>
                        <h4 style="color: #975A16; font-size: 13px; font-weight: 700; margin-bottom: 4px;">Riesgo de atraso detectado</h4>
                        <p style="color: #975A16; font-size: 12px; line-height: 1.4;">Se estima un retraso de 18 minutos por congestión en Av. Kennedy.</p>
                    </div>
                </div>

                <button class="btn btn-primary" style="width: 100%; margin-top: 16px; background-color: #EFF6FF; color: var(--primary); box-shadow: none;">
                    <i class="ph-fill ph-sparkle"></i> Ver recomendación de IA
                </button>
            </div>
        </div>
    `;
};

const initOperacion = async () => {
    try {
        const operaciones = await window.API.getOperaciones();
        
        // Calculate KPIs
        if (operaciones) {
            const total = operaciones.length;
            const aTiempo = operaciones.filter(op => op.estado === 'A tiempo' || op.estado === 'Entregado' || op.estado === 'ENTREGADO').length;
            const enRiesgo = operaciones.filter(op => op.estado === 'En riesgo' || op.estado === 'Con retraso').length;
            
            const elTotal = document.getElementById('kpi-op-total');
            const elOk = document.getElementById('kpi-op-ok');
            const elRisk = document.getElementById('kpi-op-risk');
            const elFooter = document.getElementById('operaciones-footer-text');
            
            if (elTotal) elTotal.textContent = total;
            if (elOk) elOk.textContent = aTiempo;
            if (elRisk) elRisk.textContent = enRiesgo;
            if (elFooter) elFooter.textContent = `Mostrando ${total} operaciones`;
        }

        // Setup modal logic for assigning vehicles globally
        window.asignarVehiculoModal = async (idPedido) => {
            try {
                const flotaRaw = await window.API.getFlota();
                const disponibles = flotaRaw.filter(v => v.estado === 'DISPONIBLE' || v.estado === 'Activo');
                
                if (disponibles.length === 0) {
                    window.showToast("No hay vehículos disponibles actualmente.", "warning");
                    return;
                }

                const options = disponibles.map(v => ({
                    value: v.id + '|' + v.conductor,
                    text: `${v.patente} - ${v.conductor || 'Sin conductor'} (${v.tipo || 'Vehículo'})`
                }));

                window.showModal('Asignar Vehículo a Pedido #' + idPedido, [
                    { 
                        id: 'vehiculo_data', 
                        label: 'Seleccionar Vehículo Disponible', 
                        type: 'select',
                        options: options
                    }
                ], async (values) => {
                    if (values.vehiculo_data) {
                        try {
                            const [idVehiculo, nombreConductor] = values.vehiculo_data.split('|');
                            // We need id_conductor, but getFlota only gives name. For demo, we use a mock id=1 if not available.
                            const idConductor = 1; 
                            
                            // 1. Create Route
                            const resRuta = await window.API.crearRuta({
                                id_centro: 1,
                                id_zona: 1,
                                nombre: 'Ruta UI ' + Date.now().toString().slice(-4),
                                fecha_planificada: new Date().toISOString().split('T')[0]
                            });
                            const idRuta = resRuta.id_ruta;

                            // 2. Add Stop
                            await window.API.agregarParada(idRuta, { id_pedido: idPedido, secuencia: 1 });

                            // 3. Assign Route
                            await window.API.asignarRuta(idRuta, { id_vehiculo: idVehiculo, id_conductor: idConductor });

                            // 4. Start Route
                            await window.API.iniciarRuta(idRuta);

                            window.showToast("Vehículo asignado exitosamente y ruta iniciada.", 'success');
                            window.navigate('operacion'); // Refresh
                        } catch(err) {
                            window.showToast("Error al asignar: " + err.message, 'error');
                        }
                    }
                });
            } catch (err) {
                window.showToast("Error cargando flota: " + err.message, 'error');
            }
        };

        const tbody = document.getElementById('operaciones-table-body');
        if (tbody && operaciones) {
            tbody.innerHTML = operaciones.map(op => {
                let statusClass = 'ontime';
                let barColor = 'green';
                let isPendiente = op.estado === 'PENDIENTE';
                if(op.estado === 'En riesgo' || op.estado === 'EN_RIESGO') { statusClass = 'risk'; barColor = 'blue'; }
                if(op.estado === 'Con retraso' || op.estado === 'ATRASADO') { statusClass = 'delayed'; barColor = 'blue'; }
                if(op.estado === 'Entregado' || op.estado === 'ENTREGADO') { barColor = 'green'; statusClass = 'ontime'; }
                if(isPendiente) { statusClass = 'delayed'; barColor = 'blue'; }

                let accionesHtml = isPendiente 
                    ? `<button class="btn btn-primary" style="padding: 4px 10px; font-size: 11px; border-radius: 6px;" onclick="window.asignarVehiculoModal(${op.id})">Asignar Vehículo</button>`
                    : `<i class="ph-bold ph-dots-three" style="cursor: pointer; color: var(--text-muted);"></i>`;

                return `
                    <tr>
                        <td style="color: var(--primary); font-weight: 600;">${op.id}</td>
                        <td>${op.pedido}</td>
                        <td>${op.destino}</td>
                        <td>${op.ventana}</td>
                        <td>${op.vehiculo || '<span style="color:var(--text-muted);">Sin asignar</span>'}</td>
                        <td>${op.conductor || '<span style="color:var(--text-muted);">Sin conductor</span>'}</td>
                        <td><span class="status-badge ${statusClass}">${op.estado}</span></td>
                        <td>
                            <div class="progress-cell">
                                <span style="width: 35px; font-size: 12px; font-weight: 600;">0%</span>
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill ${barColor}" style="width: 0%;"></div>
                                </div>
                            </div>
                        </td>
                        <td style="text-align: center;">${accionesHtml}</td>
                    </tr>
                `;
            }).join('');
        }

        // Action binding for "Crear pedido"
        const headerActionBtn = document.getElementById('header-action-btn');
        if (headerActionBtn) {
            headerActionBtn.onclick = () => {
                window.showModal('Crear nuevo pedido', [
                    { 
                        id: 'comuna', 
                        label: 'Comuna', 
                        type: 'select',
                        options: [
                            { value: 'Las Condes', text: 'Las Condes' },
                            { value: 'Providencia', text: 'Providencia' },
                            { value: 'Santiago', text: 'Santiago' },
                            { value: 'Ñuñoa', text: 'Ñuñoa' },
                            { value: 'Vitacura', text: 'Vitacura' }
                        ]
                    },
                    { id: 'direccion', label: 'Dirección (Calle y Número)', placeholder: 'Ej: Av. Apoquindo 1234' },
                    { id: 'peso', label: 'Peso Total (kg)', value: '10' },
                    { id: 'volumen', label: 'Volumen Total (m3)', value: '1.5' }
                ], async (values) => {
                    if (values.direccion && values.comuna && values.peso && values.volumen) {
                        try {
                            const res = await window.API.crearPedido({
                                id_cliente: 1, // Fijo para UI por ahora
                                id_ubicacion: 1, // Fijo para UI por ahora, mapea internamente a la dir
                                codigo_pedido: 'PED-UI-' + Date.now().toString().slice(-4),
                                fecha_requerida: new Date().toISOString(),
                                ventana_horaria: "08:00 - 18:00",
                                peso_total: parseFloat(values.peso),
                                volumen_total: parseFloat(values.volumen)
                            });
                            window.showToast(res.mensaje + " ID: " + res.id_pedido, 'success');
                            window.navigate('operacion'); // Refresh
                        } catch(err) {
                            window.showToast("Error: " + err.message, 'error');
                        }
                    }
                });
            };
        }

    } catch (e) {
        console.error("Error cargando operaciones:", e);
    }
};
