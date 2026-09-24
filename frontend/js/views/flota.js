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
        const data = await window.API.getFlota();
        
        // Filtrar específicamente camiones (pesados)
        const flota = data.filter(v => {
            const tipo = (v.tipo || '').toLowerCase();
            return tipo.includes('cam') || tipo === 'pesado' || tipo === '';
        });
        
        // Update KPIs
        const total = flota.length;
        const activos = flota.filter(v => {
            const st = (v.estado || '').toLowerCase();
            return st === 'activo' || st === 'disponible' || st === 'en_ruta';
        }).length;
        const enRuta = flota.filter(v => (v.estado || '').toLowerCase().includes('ruta')).length;

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
                        <div class="kpi-label">Camiones Disponibles</div>
                    </div>
                </div>
            `;
        }

        // Render Table
        const tbody = document.getElementById('flota-table-body');
        if (tbody && flota) {
            if (flota.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--text-muted);">No hay camiones registrados.</td></tr>`;
                return;
            }

            tbody.innerHTML = flota.map(v => {
                const st = (v.estado || '').toLowerCase();
                const isActivo = st === 'activo' || st === 'disponible' || st === 'en_ruta';
                let statusClass = 'ontime';
                if (st.includes('ruta')) statusClass = 'risk';
                if (st.includes('desact') || st.includes('inact')) statusClass = 'delayed';

                const actionBtnClass = isActivo ? 'btn-danger' : 'btn-primary';
                const actionBtnText = isActivo ? 'Desactivar' : 'Activar';
                const nextState = isActivo ? 'Desactivado' : 'Activo';

                return `
                    <tr>
                        <td style="font-weight: 600; color: var(--primary);">${v.id}</td>
                        <td><strong>${v.patente}</strong></td>
                        <td>${v.conductor || '<span style="color: var(--text-muted);">Sin asignar</span>'}</td>
                        <td><span class="status-badge ${statusClass}">${v.estado || 'Disponible'}</span></td>
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
