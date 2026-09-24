// js/views/vehiculos.js

const renderVehiculos = () => {
    return `
        <div class="dashboard-grid" style="grid-template-columns: repeat(2, 1fr);" id="vehiculos-kpis-container">
            <div style="padding: 20px; color: var(--text-muted);">Cargando vehículos...</div>
        </div>

        <div class="operation-layout">
            <div class="card" style="width: 100%;">
                <div class="card-header">
                    <h3 class="card-title">Gestión de Vehículos Livianos</h3>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID Vehículo</th>
                                <th>Patente</th>
                                <th>Conductor Asignado</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody id="vehiculos-table-body">
                            <tr><td colspan="5" style="text-align:center; padding: 20px;">Cargando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

const initVehiculos = async () => {
    try {
        const flotaRaw = await window.API.getFlota();
        // Filtrar por livianos
        const vehiculos = flotaRaw.filter(v => v.tipo && v.tipo.toUpperCase() !== 'CAMIÓN' && v.tipo !== 'Camión');
        
        // Update KPIs
        const activos = vehiculos.filter(v => v.estado === 'DISPONIBLE' || v.estado === 'EN_RUTA').length;
        const total = vehiculos.length;

        const kpiContainer = document.getElementById('vehiculos-kpis-container');
        if (kpiContainer) {
            kpiContainer.innerHTML = `
                <div class="card kpi-card">
                    <div class="kpi-icon blue"><i class="ph ph-car"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row"><span class="kpi-value">${total}</span></div>
                        <div class="kpi-label">Total Vehículos</div>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="kpi-icon green"><i class="ph-fill ph-check-circle"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row"><span class="kpi-value">${activos}</span></div>
                        <div class="kpi-label">Vehículos Activos</div>
                    </div>
                </div>
            `;
        }

        // Render Table
        const tbody = document.getElementById('vehiculos-table-body');
        if (tbody && vehiculos) {
            tbody.innerHTML = vehiculos.map(v => {
                const isActivo = v.estado === 'DISPONIBLE' || v.estado === 'EN_RUTA';
                const statusClass = isActivo ? 'ontime' : 'delayed';
                const actionBtnClass = isActivo ? 'btn-danger' : 'btn-primary';
                const actionBtnText = isActivo ? 'Desactivar' : 'Activar';
                const nextState = isActivo ? 'Desactivado' : 'DISPONIBLE';

                return `
                    <tr>
                        <td style="font-weight: 600;">${v.id}</td>
                        <td>${v.patente}</td>
                        <td>${v.conductor || 'Sin asignar'}</td>
                        <td><span class="status-badge ${statusClass}">${v.estado}</span></td>
                        <td>
                            <button class="btn ${actionBtnClass}" style="padding: 6px 12px; font-size: 12px; border-radius: 6px;" onclick="window.toggleFlotaStatus('${v.id}', '${nextState}')">
                                ${actionBtnText}
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        const headerActionBtn = document.getElementById('header-action-btn');
        if (headerActionBtn) {
            headerActionBtn.onclick = () => {
                window.showModal('Registrar Vehículo Liviano', [
                    { id: 'patente', label: 'Patente (Ej: XX-YY-99)', placeholder: 'XX-YY-99' },
                    { id: 'conductor', label: 'Conductor Asignado', placeholder: 'Nombre del chofer' },
                    { id: 'capacidad', label: 'Capacidad Total (kg)', value: '1500' }
                ], async (values) => {
                    if (values.patente && values.conductor && values.capacidad) {
                        try {
                            window.showToast("Vehículo liviano " + values.patente + " registrado correctamente.", 'success');
                            window.navigate('vehiculos'); 
                        } catch(err) {
                            window.showToast("Error: " + err.message, 'error');
                        }
                    }
                });
            };
        }
    } catch (e) {
        console.error("Error al cargar vehiculos:", e);
    }
};
