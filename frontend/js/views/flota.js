// js/views/flota.js

const renderFlota = () => {
    return `
        <div class="dashboard-grid" style="grid-template-columns: repeat(2, 1fr);" id="flota-kpis-container">
            <!-- KPIs Injected via JS -->
            <div style="padding: 20px; color: var(--text-muted);">Cargando flota...</div>
        </div>

        <div class="operation-layout">
            <div class="card" style="width: 100%;">
                <div class="card-header">
                    <h3 class="card-title">Gestión de Flota</h3>
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
                        <tbody id="flota-table-body">
                            <tr><td colspan="5" style="text-align:center; padding: 20px;">Cargando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

const initFlota = async () => {
    try {
        const flota = await window.API.getFlota();
        
        // Update KPIs
        const activos = flota.filter(v => v.estado === 'Activo').length;
        const total = flota.length;

        const kpiContainer = document.getElementById('flota-kpis-container');
        if (kpiContainer) {
            kpiContainer.innerHTML = `
                <div class="card kpi-card">
                    <div class="kpi-icon blue"><i class="ph-fill ph-truck"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row"><span class="kpi-value">${total}</span></div>
                        <div class="kpi-label">Total Camiones</div>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="kpi-icon green"><i class="ph-fill ph-check-circle"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row"><span class="kpi-value">${activos}</span></div>
                        <div class="kpi-label">Camiones Activos</div>
                    </div>
                </div>
            `;
        }

        // Render Table
        const tbody = document.getElementById('flota-table-body');
        if (tbody && flota) {
            tbody.innerHTML = flota.map(v => {
                const isActivo = v.estado === 'Activo';
                const statusClass = isActivo ? 'ontime' : 'delayed';
                const actionBtnClass = isActivo ? 'btn-danger' : 'btn-primary';
                const actionBtnText = isActivo ? 'Desactivar' : 'Activar';
                const nextState = isActivo ? 'Desactivado' : 'Activo';

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
    } catch (e) {
        console.error("Error al cargar flota:", e);
    }
};

window.toggleFlotaStatus = async (id, nextState) => {
    if(confirm(`¿Seguro que deseas cambiar el estado a ${nextState}?`)) {
        try {
            await window.API.updateFlotaEstado(id, nextState);
            // Refresh view
            if(window.navigate) {
                window.navigate('flota');
            }
        } catch(e) {
            alert("Error al actualizar");
        }
    }
};
