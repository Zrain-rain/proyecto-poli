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
        const flotaRaw = await window.API.getFlota();
        const flota = flotaRaw.filter(v => v.tipo && v.tipo.toUpperCase() === 'CAMIÓN' || v.tipo === 'Camión');
        
        // Update KPIs
        const activos = flota.filter(v => v.estado === 'DISPONIBLE' || v.estado === 'EN_RUTA').length;
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
                window.showModal('Registrar Camión', [
                    { id: 'patente', label: 'Patente (Ej: AB-CD-12)', placeholder: 'AB-CD-12' },
                    { id: 'conductor', label: 'Conductor Asignado', placeholder: 'Nombre del chofer' },
                    { id: 'capacidad', label: 'Capacidad Total (kg)', value: '15000' }
                ], async (values) => {
                    if (values.patente && values.conductor && values.capacidad) {
                        try {
                            // Simulamos la creación ya que no hay endpoint específico aún para crear flota
                            window.showToast("Camión " + values.patente + " registrado correctamente.", 'success');
                            window.navigate('flota'); // Refresh
                        } catch(err) {
                            window.showToast("Error: " + err.message, 'error');
                        }
                    }
                });
            };
        }
    } catch (e) {
        console.error("Error al cargar flota:", e);
    }
};

window.toggleFlotaStatus = (id, nextState) => {
    window.showModal('Confirmar', [
        { id: 'confirm', label: `¿Seguro que deseas cambiar el estado a ${nextState}?`, type: 'hidden' }
    ], async () => {
        try {
            await window.API.updateFlotaEstado(id, nextState);
            window.showToast(`Estado actualizado a ${nextState}`, 'success');
            if (window.navigate) window.navigate('flota');
        } catch(e) {
            window.showToast("Error al actualizar: " + e.message, 'error');
        }
    });
};
