// js/views/operacion.js

let allOperaciones = [];
let selectedOperacionId = null;
let currentFilterEstado = 'todas';
let currentFilterVehiculo = 'todos';

const renderOperacion = () => {
    return `
        <!-- Dynamic KPIs -->
        <div class="dashboard-grid" style="grid-template-columns: repeat(3, 1fr);" id="operacion-kpis-container">
            <div class="card kpi-card">
                <div class="kpi-icon blue"><i class="ph-fill ph-cube"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row"><span class="kpi-value">--</span></div>
                    <div class="kpi-label">Entregas programadas</div>
                </div>
            </div>
            <div class="card kpi-card">
                <div class="kpi-icon green"><i class="ph-bold ph-check"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row"><span class="kpi-value">--</span></div>
                    <div class="kpi-label">A tiempo</div>
                </div>
            </div>
            <div class="card kpi-card">
                <div class="kpi-icon warning"><i class="ph-fill ph-warning"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row"><span class="kpi-value">--</span></div>
                    <div class="kpi-label">En riesgo o retrasadas</div>
                </div>
            </div>
        </div>

        <div class="operation-layout" id="operacion-layout-container">
            <!-- Table Container -->
            <div class="card" id="operaciones-table-card" style="flex: 1; min-width: 0;">
                <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
                    <h3 class="card-title">Operaciones de entrega</h3>
                    <div class="filters-row" style="flex-wrap: wrap; gap: 8px;">
                        <div class="badge-pill outline filter-pill active" data-filter="todas" style="cursor: pointer; border-color: var(--primary); color: var(--primary); background: #EFF6FF;">Todas</div>
                        <div class="badge-pill outline filter-pill" data-filter="A tiempo" style="cursor: pointer;"><div class="dot green"></div> A tiempo</div>
                        <div class="badge-pill outline filter-pill" data-filter="En riesgo" style="cursor: pointer;"><div class="dot warning"></div> En riesgo</div>
                        <div class="badge-pill outline filter-pill" data-filter="Con retraso" style="cursor: pointer;"><div class="dot red"></div> Retrasadas</div>
                        
                        <select class="filter-select" id="filtro-vehiculo" style="padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: white; font-size: 13px; color: var(--text-main); cursor: pointer;">
                            <option value="todos">Todos los vehículos</option>
                        </select>
                        <select class="filter-select" id="filtro-estado-select" style="padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: white; font-size: 13px; color: var(--text-main); cursor: pointer;">
                            <option value="todos">Todos los estados</option>
                            <option value="A tiempo">A tiempo</option>
                            <option value="En riesgo">En riesgo</option>
                            <option value="Con retraso">Con retraso</option>
                            <option value="Entregada">Entregada</option>
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
                                <th style="text-align: center;">Detalle</th>
                            </tr>
                        </thead>
                        <tbody id="operaciones-table-body">
                            <tr><td colspan="9" style="text-align:center; padding: 24px;">Cargando operaciones...</td></tr>
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 16px; font-size: 13px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;" id="operacion-pagination-container">
                    <span id="operaciones-counter-text">Cargando total...</span>
                </div>
            </div>

            <!-- Detail Panel -->
            <div class="card detail-panel" id="operacion-detail-panel" style="min-width: 320px; max-width: 380px;">
                <div class="detail-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 class="card-title" style="margin: 0;">Detalle de operación</h3>
                    <i class="ph ph-x" id="close-detail-panel-btn" style="font-size: 20px; color: var(--text-muted); cursor: pointer; padding: 4px;" title="Cerrar panel"></i>
                </div>

                <div id="detail-panel-content">
                    <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
                        <i class="ph ph-cursor-click" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
                        Haz clic en una fila de la tabla para ver el detalle de la operación.
                    </div>
                </div>
            </div>
        </div>
    `;
};

const renderOperacionKPIs = (ops) => {
    const total = ops.length;
    const aTiempo = ops.filter(o => o.estado === 'A tiempo' || o.estado === 'Entregada' || o.estado === 'Entregado').length;
    const enRiesgo = ops.filter(o => o.estado === 'En riesgo' || o.estado === 'Con retraso' || o.estado === 'Retrasada').length;

    const kpiContainer = document.getElementById('operacion-kpis-container');
    if (kpiContainer) {
        kpiContainer.innerHTML = `
            <div class="card kpi-card">
                <div class="kpi-icon blue"><i class="ph-fill ph-cube"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value">${total}</span>
                    </div>
                    <div class="kpi-label">Entregas registradas</div>
                </div>
            </div>
            
            <div class="card kpi-card">
                <div class="kpi-icon green"><i class="ph-bold ph-check"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value">${aTiempo}</span>
                    </div>
                    <div class="kpi-label">A tiempo / Entregadas</div>
                </div>
            </div>

            <div class="card kpi-card">
                <div class="kpi-icon warning"><i class="ph-fill ph-warning"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value">${enRiesgo}</span>
                    </div>
                    <div class="kpi-label">En riesgo o retrasadas</div>
                </div>
            </div>
        `;
    }
};

let currentSearchQuery = '';

const filterAndRenderOperaciones = () => {
    let filtered = [...allOperaciones];

    // Filtro por Búsqueda Global
    if (currentSearchQuery) {
        filtered = filtered.filter(op => {
            const id = (op.id || '').toLowerCase();
            const pedido = (op.pedido || '').toLowerCase();
            const destino = (op.destino || '').toLowerCase();
            const vehiculo = (op.vehiculo || '').toLowerCase();
            const conductor = (op.conductor || '').toLowerCase();
            return id.includes(currentSearchQuery) || 
                   pedido.includes(currentSearchQuery) || 
                   destino.includes(currentSearchQuery) || 
                   vehiculo.includes(currentSearchQuery) || 
                   conductor.includes(currentSearchQuery);
        });
    }

    // Filtro por Estado
    if (currentFilterEstado !== 'todas' && currentFilterEstado !== 'todos') {
        filtered = filtered.filter(op => {
            const st = (op.estado || '').toLowerCase();
            const filterSt = currentFilterEstado.toLowerCase();
            if (filterSt === 'con retraso' || filterSt === 'retrasadas') {
                return st.includes('retras') || st.includes('demor');
            }
            return st.includes(filterSt);
        });
    }

    // Filtro por Vehículo
    if (currentFilterVehiculo !== 'todos') {
        filtered = filtered.filter(op => String(op.vehiculo) === String(currentFilterVehiculo));
    }

    // Render Table
    const tbody = document.getElementById('operaciones-table-body');
    const counterText = document.getElementById('operaciones-counter-text');

    if (counterText) {
        counterText.textContent = `Mostrando ${filtered.length} de ${allOperaciones.length} operaciones`;
    }

    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 30px; color: var(--text-muted);">No se encontraron operaciones con los filtros seleccionados.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(op => {
        let statusClass = 'ontime';
        let barColor = 'green';
        if (op.estado === 'En riesgo') { statusClass = 'risk'; barColor = 'blue'; }
        if (op.estado === 'Con retraso' || op.estado === 'Retrasada') { statusClass = 'delayed'; barColor = 'blue'; }
        if (op.estado === 'Entregada' || op.estado === 'Entregado') { barColor = 'green'; statusClass = 'ontime'; }

        const isSelected = String(op.id) === String(selectedOperacionId);
        const rowBg = isSelected ? 'background-color: #F0F7FF;' : '';

        return `
            <tr style="cursor: pointer; ${rowBg}" onclick="window.selectOperacion('${op.id}')">
                <td style="color: var(--primary); font-weight: 700;">${op.id}</td>
                <td><strong>${op.pedido}</strong></td>
                <td>${op.destino}</td>
                <td>${op.ventana || 'No asignada'}</td>
                <td><span class="badge-pill outline"><i class="ph ph-truck"></i> ${op.vehiculo || 'No asignado'}</span></td>
                <td>${op.conductor || '<span style="color:var(--text-muted);">Sin conductor</span>'}</td>
                <td><span class="status-badge ${statusClass}">${op.estado}</span></td>
                <td>
                    <div class="progress-cell">
                        <span style="width: 35px; font-size: 12px; font-weight: 600;">${op.avance || 0}%</span>
                        <div class="progress-bar-bg" style="width: 70px;">
                            <div class="progress-bar-fill ${barColor}" style="width: ${op.avance || 0}%;"></div>
                        </div>
                    </div>
                </td>
                <td style="text-align: center; color: var(--primary);">
                    <i class="ph-bold ph-eye" style="font-size: 18px;"></i>
                </td>
            </tr>
        `;
    }).join('');
};

const renderOperacionDetail = (op) => {
    const detailPanel = document.getElementById('operacion-detail-panel');
    const content = document.getElementById('detail-panel-content');
    if (!detailPanel || !content) return;

    detailPanel.style.display = 'block';

    if (!op) {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
                <i class="ph ph-cursor-click" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
                Selecciona una operación de la tabla para ver su detalle.
            </div>
        `;
        return;
    }

    let statusClass = 'ontime';
    let statusText = op.estado || 'A tiempo';
    let barColor = 'green';
    let isDelayed = op.estado === 'Con retraso' || op.estado === 'Retrasada';
    let isRisk = op.estado === 'En riesgo';

    if (isRisk) { statusClass = 'risk'; barColor = 'blue'; }
    if (isDelayed) { statusClass = 'delayed'; barColor = 'blue'; }

    // Alerta contextual
    let alertBox = `
        <div style="background-color: #F0FDF4; border: 1px solid #86EFAC; border-radius: 12px; padding: 14px; display: flex; gap: 12px; margin-top: 20px;">
            <i class="ph-fill ph-check-circle" style="color: var(--success); font-size: 20px;"></i>
            <div>
                <h4 style="color: #166534; font-size: 13px; font-weight: 700; margin: 0 0 2px 0;">Entrega en cumplimiento</h4>
                <p style="color: #166534; font-size: 12px; line-height: 1.4; margin: 0;">Tránsito fluido. No se detectan anomalías para este destino.</p>
            </div>
        </div>
    `;

    if (isDelayed) {
        alertBox = `
            <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 14px; display: flex; gap: 12px; margin-top: 20px;">
                <i class="ph-fill ph-warning-circle" style="color: var(--danger); font-size: 20px;"></i>
                <div>
                    <h4 style="color: #991B1B; font-size: 13px; font-weight: 700; margin: 0 0 2px 0;">Retraso operacional registrado</h4>
                    <p style="color: #991B1B; font-size: 12px; line-height: 1.4; margin: 0;">El pedido presenta desfase respecto a la ventana asignada (${op.ventana || 'N/A'}).</p>
                </div>
            </div>
        `;
    } else if (isRisk) {
        alertBox = `
            <div style="background-color: #FFFBEB; border: 1px solid #FFCE20; border-radius: 12px; padding: 14px; display: flex; gap: 12px; margin-top: 20px;">
                <i class="ph-fill ph-warning" style="color: var(--warning); font-size: 20px;"></i>
                <div>
                    <h4 style="color: #975A16; font-size: 13px; font-weight: 700; margin: 0 0 2px 0;">Riesgo de atraso detectado</h4>
                    <p style="color: #975A16; font-size: 12px; line-height: 1.4; margin: 0;">Estimación ajustada por congestión vehicular en la ruta hacia ${op.destino}.</p>
                </div>
            </div>
        `;
    }

    content.innerHTML = `
        <div class="detail-id" style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <div class="id-icon" style="width: 44px; height: 44px; font-size: 22px; background: #EEF2FF; color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <i class="ph-fill ph-cube"></i>
            </div>
            <div class="id-info">
                <h2 style="font-size: 18px; font-weight: 700; margin: 0; color: var(--text-main);">${op.id}</h2>
                <p style="margin: 2px 0; font-size: 13px; color: var(--text-muted); font-weight: 500;">Pedido: <strong>${op.pedido}</strong></p>
            </div>
            <div class="status-badge ${statusClass}" style="margin-left: auto;">${statusText}</div>
        </div>

        <hr style="border: none; border-top: 1px solid var(--border-color); margin: 16px 0;">

        <div class="detail-info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div class="info-item" style="background: var(--bg-app); padding: 10px 12px; border-radius: 10px;">
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Vehículo</span>
                <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: var(--text-main);">${op.vehiculo || 'No asignado'}</p>
            </div>
            <div class="info-item" style="background: var(--bg-app); padding: 10px 12px; border-radius: 10px;">
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Conductor</span>
                <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: var(--text-main);">${op.conductor || 'Sin asignar'}</p>
            </div>
            <div class="info-item" style="background: var(--bg-app); padding: 10px 12px; border-radius: 10px; grid-column: span 2;">
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Destino</span>
                <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: var(--text-main);">${op.destino}</p>
            </div>
            <div class="info-item" style="background: var(--bg-app); padding: 10px 12px; border-radius: 10px; grid-column: span 2;">
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Ventana Horaria</span>
                <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: var(--primary);"><i class="ph ph-clock"></i> ${op.ventana || '09:00 - 18:00'}</p>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
                <span>Avance de entrega</span>
                <span style="color: var(--primary);">${op.avance || 0}%</span>
            </div>
            <div class="progress-bar-bg" style="width: 100%; height: 8px; border-radius: 4px;">
                <div class="progress-bar-fill ${barColor}" style="width: ${op.avance || 0}%; height: 8px; border-radius: 4px;"></div>
            </div>
        </div>

        <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; color: var(--text-muted);">Seguimiento del Envío</h4>
        <div class="timeline" style="margin-bottom: 16px;">
            <div class="timeline-item completed">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <h4 style="font-size: 13px; margin: 0;">Pedido registrado</h4>
                    <p style="font-size: 11px; color: var(--text-muted); margin: 2px 0 0 0;">Carga ingresada a sistema</p>
                </div>
            </div>
            <div class="timeline-item ${op.avance >= 30 ? 'completed' : 'current'}">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <h4 style="font-size: 13px; margin: 0;">Asignado a conductor</h4>
                    <p style="font-size: 11px; color: var(--text-muted); margin: 2px 0 0 0;">${op.conductor || 'Pendiente'}</p>
                </div>
            </div>
            <div class="timeline-item ${op.avance >= 70 ? 'completed' : (op.avance >= 30 ? 'current' : '')}">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <h4 style="font-size: 13px; margin: 0;">En trayecto de entrega</h4>
                    <p style="font-size: 11px; color: var(--text-muted); margin: 2px 0 0 0;">Vehículo: ${op.vehiculo || 'N/A'}</p>
                </div>
            </div>
            <div class="timeline-item ${op.avance >= 100 || op.estado === 'Entregada' ? 'completed' : ''}">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <h4 style="font-size: 13px; margin: 0;">Entregado en destino</h4>
                    <p style="font-size: 11px; color: var(--text-muted); margin: 2px 0 0 0;">Firma de recepción</p>
                </div>
            </div>
        </div>

        ${alertBox}

        <button class="btn btn-primary" onclick="window.consultarIAOperacion('${op.id}')" style="width: 100%; margin-top: 16px; background-color: #EFF6FF; color: var(--primary); box-shadow: none; border: 1px solid #BFDBFE;">
            <i class="ph-fill ph-sparkle"></i> Consultar Recomendación IA
        </button>
    `;
};

window.selectOperacion = (id) => {
    selectedOperacionId = id;
    const op = allOperaciones.find(o => String(o.id) === String(id));
    renderOperacionDetail(op);
    filterAndRenderOperaciones();
};

window.consultarIAOperacion = (id) => {
    const op = allOperaciones.find(o => String(o.id) === String(id));
    if (!op) return;
    alert(`Asistente Gemini AI:\nPara el pedido ${op.pedido} (${op.destino}), el estado es "${op.estado}". Se sugiere mantener monitoreo continuo de tráfico.`);
};

const initOperacion = async () => {
    try {
        const operaciones = await window.API.getOperaciones();
        allOperaciones = operaciones || [];

        // 1. Renderizar KPIs dinámicos
        renderOperacionKPIs(allOperaciones);

        // 2. Poblar selector de vehículos
        const vehiculoSelect = document.getElementById('filtro-vehiculo');
        if (vehiculoSelect && allOperaciones.length > 0) {
            const vehiculosUnicos = Array.from(new Set(allOperaciones.map(o => o.vehiculo).filter(Boolean)));
            vehiculoSelect.innerHTML = `<option value="todos">Todos los vehículos</option>` + 
                vehiculosUnicos.map(v => `<option value="${v}">${v}</option>`).join('');

            vehiculoSelect.addEventListener('change', (e) => {
                currentFilterVehiculo = e.target.value;
                filterAndRenderOperaciones();
            });
        }

        // 3. Listener selector de estado
        const estadoSelect = document.getElementById('filtro-estado-select');
        if (estadoSelect) {
            estadoSelect.addEventListener('change', (e) => {
                currentFilterEstado = e.target.value;
                updatePillStates(currentFilterEstado);
                filterAndRenderOperaciones();
            });
        }

        // 4. Listeners botones badge (pills)
        const pills = document.querySelectorAll('.filter-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                const filterVal = pill.getAttribute('data-filter');
                currentFilterEstado = filterVal;
                if (estadoSelect) estadoSelect.value = filterVal === 'todas' ? 'todos' : filterVal;
                updatePillStates(filterVal);
                filterAndRenderOperaciones();
            });
        });

        const updatePillStates = (activeFilter) => {
            pills.forEach(p => {
                const val = p.getAttribute('data-filter');
                if (val === activeFilter || (val === 'todas' && activeFilter === 'todos')) {
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
        };

        // 5. Botón cerrar detalle panel
        const closeBtn = document.getElementById('close-detail-panel-btn');
        const detailPanel = document.getElementById('operacion-detail-panel');
        if (closeBtn && detailPanel) {
            closeBtn.addEventListener('click', () => {
                detailPanel.style.display = 'none';
            });
        }

        // 6. Seleccionar primer pedido por defecto si existe
        if (allOperaciones.length > 0) {
            selectedOperacionId = allOperaciones[0].id;
            renderOperacionDetail(allOperaciones[0]);
        }

        // 7. Renderizar tabla con datos iniciales
        filterAndRenderOperaciones();

    } catch (e) {
        console.error("Error cargando operaciones:", e);
    }
};

window.setOperacionSearchQuery = (q) => {
    currentSearchQuery = (q || '').toLowerCase();
    filterAndRenderOperaciones();
};

window.addNewOperacionLocally = (newOp) => {
    allOperaciones.unshift(newOp);
    renderOperacionKPIs(allOperaciones);
    selectedOperacionId = newOp.id;
    renderOperacionDetail(newOp);
    filterAndRenderOperaciones();
};

