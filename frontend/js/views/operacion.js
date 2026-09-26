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
                    <div class="kpi-label">Pendientes / Riesgo</div>
                </div>
            </div>
        </div>

        <div class="operation-layout">
            <!-- Table -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Operaciones de entrega</h3>
                </div>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID Pedido</th>
                                <th>Destino</th>
                                <th>Ventana</th>
                                <th>Transporte</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody id="operaciones-table-body">
                            <!-- Injected via JS -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Detail Panel -->
            <div class="card detail-panel" id="op-detail-panel" style="display: none;">
                <div class="detail-header">
                    <div>
                        <h3 class="card-title">Detalle de operación</h3>
                    </div>
                    <i class="ph ph-x" style="font-size: 20px; color: var(--text-muted); cursor: pointer;" onclick="document.getElementById('op-detail-panel').style.display='none'"></i>
                </div>

                <div class="detail-id" style="margin-bottom: 24px;">
                    <div class="id-info">
                        <h2 id="det-id-pedido" style="margin-bottom: 4px;">Seleccione pedido</h2>
                        <p id="det-destino" style="font-size: 13px; color: var(--text-muted);"></p>
                    </div>
                    <div id="det-estado" class="status-badge ontime" style="margin-left: auto;">...</div>
                </div>
                
                <div style="background: var(--bg-main); padding: 16px; border-radius: var(--radius-md); margin-bottom: 24px;">
                    <h4 style="font-size: 12px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px;">Información del Transporte</h4>
                    <div style="display: flex; gap: 12px; margin-bottom: 8px;">
                        <i class="ph-fill ph-truck" style="color: var(--primary);"></i>
                        <span id="det-vehiculo" style="font-weight: 500; font-size: 14px;"></span>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <i class="ph-fill ph-user" style="color: var(--primary);"></i>
                        <span id="det-conductor" style="font-weight: 500; font-size: 14px;"></span>
                    </div>
                </div>

                <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 16px;">Acciones Operativas</h4>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button id="btn-asignar" class="btn btn-primary" style="width: 100%;"><i class="ph-fill ph-truck"></i> Asignar / Reasignar Transporte</button>
                    <button id="btn-recoordinar" class="btn" style="width: 100%; border: 1px solid var(--border-color);"><i class="ph-bold ph-calendar"></i> Recoordinar Entrega</button>
                    <button id="btn-anular" class="btn" style="width: 100%; background: #FEF2F2; color: var(--danger); border: 1px solid #FECACA;"><i class="ph-bold ph-x-circle"></i> Anular Entrega</button>
                </div>
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
            const enRiesgo = total - aTiempo;
            
            const elTotal = document.getElementById('kpi-op-total');
            const elOk = document.getElementById('kpi-op-ok');
            const elRisk = document.getElementById('kpi-op-risk');
            
            if (elTotal) elTotal.textContent = total;
            if (elOk) elOk.textContent = aTiempo;
            if (elRisk) elRisk.textContent = enRiesgo;
        }

        // Action Handlers
        let selectedOp = null;

        document.getElementById('btn-anular').onclick = async () => {
            if(!selectedOp) return;
            window.showModal('Anular Entrega', [{ id: 'motivo', label: 'Motivo de anulación (opcional)', value: '' }], async () => {
                try {
                    await window.API.registrarIncidencia({ id_ruta: null, id_parada: null, tipo: 'Anulación de Operación', descripcion: 'Cancelado por usuario - Pedido ' + selectedOp.id_pedido });
                    // Adicionalmente actualizamos el frontend para que se vea cancelado de inmediato
                    window.showToast("Operación anulada exitosamente.", "success");
                    if (window.navigate) window.navigate('operacion'); // reload
                } catch(e) { window.showToast(e.message, 'error'); }
            });
        };

        document.getElementById('btn-recoordinar').onclick = async () => {
            if(!selectedOp) return;
            window.showModal('Recoordinar Entrega', [
                { id: 'nueva_fecha', label: 'Nueva Fecha', type: 'date', value: '' },
                { id: 'nueva_ventana', label: 'Nueva Ventana', value: '14:00 - 18:00' }
            ], async (vals) => {
                if(!vals.nueva_fecha) return window.showToast('Debe seleccionar fecha', 'warning');
                try {
                    await window.API.registrarIncidencia({ id_ruta: null, id_parada: null, tipo: 'Recoordinación', descripcion: 'Nueva fecha: ' + vals.nueva_fecha + ' - Pedido ' + selectedOp.id_pedido });
                    window.showToast("Pedido recoordinado exitosamente.", "success");
                    if (window.navigate) window.navigate('operacion');
                } catch(e) { window.showToast(e.message, 'error'); }
            });
        };
        
        document.getElementById('btn-asignar').onclick = async () => {
            if(!selectedOp) return;
            try {
                const flotaRaw = await window.API.getFlota();
                const opciones = flotaRaw.map(v => ({ value: v.id + '|' + v.conductor, text: v.patente + ' - ' + (v.conductor || 'Sin conductor') }));
                window.showModal('Asignar Transporte', [{ id: 'vehiculo', label: 'Transporte', type: 'select', options: opciones }], async (vals) => {
                    if(vals.vehiculo) {
                        try {
                            const [idVehiculo] = vals.vehiculo.split('|');
                            // Create route and assign just for this order
                            const resRuta = await window.API.createRuta({ id_centro: 1, id_zona: 1, nombre: 'Ruta ' + selectedOp.id_pedido, fecha_planificada: new Date().toISOString() });
                            await window.API.agregarParada(resRuta.id_ruta, { id_pedido: selectedOp.id_pedido, secuencia: 1 });
                            await window.API.asignarRuta(resRuta.id_ruta, { id_vehiculo: parseInt(idVehiculo), id_conductor: 1 });
                            await window.API.iniciarRuta(resRuta.id_ruta);
                            window.showToast("Transporte asignado a la base de datos", "success");
                            window.navigate('operacion');
                        } catch(e) { window.showToast(e.message, "error"); }
                    }
                });
            } catch (err) { window.showToast(err.message, 'error'); }
        };

        const tbody = document.getElementById('operaciones-table-body');
        if (tbody && operaciones) {
            tbody.innerHTML = operaciones.map(op => {
                let statusClass = 'ontime';
                let isPendiente = op.estado === 'PENDIENTE';
                if(op.estado === 'En riesgo' || op.estado === 'EN_RIESGO') statusClass = 'risk';
                if(op.estado === 'Con retraso' || op.estado === 'ATRASADO') statusClass = 'delayed';
                if(isPendiente) statusClass = 'delayed';

                return `
                    <tr style="cursor:pointer;" onclick="window.showOpDetail(${op.id}, '${op.destino}', '${op.vehiculo || 'Sin asignar'}', '${op.conductor || 'Sin conductor'}', '${op.estado}')">
                        <td style="color: var(--primary); font-weight: 600;">#${op.pedido || op.id}</td>
                        <td>${op.destino}</td>
                        <td>${op.ventana}</td>
                        <td>${op.vehiculo || '<span style="color:var(--text-muted);">Sin asignar</span>'}</td>
                        <td><span class="status-badge ${statusClass}">${op.estado}</span></td>
                    </tr>
                `;
            }).join('');
        }

        window.showOpDetail = (id, destino, vehiculo, conductor, estado) => {
            selectedOp = { id_pedido: id, destino, vehiculo, conductor, estado };
            document.getElementById('op-detail-panel').style.display = 'block';
            document.getElementById('det-id-pedido').textContent = 'Pedido #' + id;
            document.getElementById('det-destino').textContent = destino;
            document.getElementById('det-vehiculo').textContent = vehiculo;
            document.getElementById('det-conductor').textContent = conductor;
            document.getElementById('det-estado').textContent = estado;
        };

    } catch (e) {
        console.error("Error al cargar operaciones", e);
    }
};
