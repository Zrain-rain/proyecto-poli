// js/views/vehiculos.js

const renderVehiculos = () => {
    return `
        <div class="dashboard-grid" style="grid-template-columns: repeat(3, 1fr);" id="vehiculos-kpis-container">
            <!-- KPIs Injected via JS -->
            <div style="padding: 20px; color: var(--text-muted);">Cargando vehículos livianos...</div>
        </div>

        <div class="operation-layout">
            <div class="card" style="width: 100%;">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 class="card-title">Gestión de Vehículos Livianos</h3>
                        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Furgones, camionetas y vehículos utilitarios de última milla</p>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Patente</th>
                                <th>Tipo</th>
                                <th>Conductor Asignado</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody id="vehiculos-table-body">
                            <tr><td colspan="6" style="text-align:center; padding: 20px;">Cargando vehículos...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

const initVehiculos = async () => {
    try {
        const flota = await window.API.getFlota();

        // Filtramos vehículos livianos (excluyendo camiones pesados)
        const vehiculos = flota.filter(v => {
            const tipo = (v.tipo || '').toLowerCase();
            return tipo.includes('liviano') || tipo.includes('veh') || tipo.includes('furgon') || tipo.includes('auto') || tipo === '';
        });

        // KPIs
        const total = vehiculos.length;
        const activos = vehiculos.filter(v => {
            const st = (v.estado || '').toLowerCase();
            return st === 'activo' || st === 'disponible' || st === 'en_ruta';
        }).length;
        const enRuta = vehiculos.filter(v => (v.estado || '').toLowerCase().includes('ruta')).length;

        const kpiContainer = document.getElementById('vehiculos-kpis-container');
        if (kpiContainer) {
            kpiContainer.innerHTML = `
                <div class="card kpi-card">
                    <div class="kpi-icon blue"><i class="ph-fill ph-car"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row"><span class="kpi-value">${total}</span></div>
                        <div class="kpi-label">Total Vehículos Livianos</div>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="kpi-icon green"><i class="ph-fill ph-check-circle"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row"><span class="kpi-value">${activos}</span></div>
                        <div class="kpi-label">Disponibles / Activos</div>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="kpi-icon warning"><i class="ph-fill ph-navigation-arrow"></i></div>
                    <div class="kpi-content">
                        <div class="kpi-value-row"><span class="kpi-value">${enRuta}</span></div>
                        <div class="kpi-label">En Ruta</div>
                    </div>
                </div>
            `;
        }

        // Render Table
        const tbody = document.getElementById('vehiculos-table-body');
        if (tbody) {
            if (vehiculos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No se encontraron vehículos livianos registrados.</td></tr>`;
                return;
            }

            tbody.innerHTML = vehiculos.map(v => {
                const st = (v.estado || '').toLowerCase();
                const isActivo = st === 'activo' || st === 'disponible' || st === 'en_ruta';
                let statusClass = 'ontime';
                if (st.includes('ruta')) statusClass = 'risk';
                if (st.includes('desact') || st.includes('inact') || st.includes('taller')) statusClass = 'delayed';

                const actionBtnClass = isActivo ? 'btn-danger' : 'btn-primary';
                const actionBtnText = isActivo ? 'Desactivar' : 'Activar';
                const nextState = isActivo ? 'Desactivado' : 'Activo';

                return `
                    <tr>
                        <td style="font-weight: 600; color: var(--primary);">${v.id}</td>
                        <td><strong>${v.patente}</strong></td>
                        <td><span class="badge-pill outline"><i class="ph ph-car"></i> ${v.tipo || 'Liviano'}</span></td>
                        <td>${v.conductor || '<span style="color: var(--text-muted);">Sin asignar</span>'}</td>
                        <td><span class="status-badge ${statusClass}">${v.estado || 'Disponible'}</span></td>
                        <td>
                            <button class="btn ${actionBtnClass}" style="padding: 6px 12px; font-size: 12px; border-radius: 6px;" onclick="window.toggleVehiculoStatus('${v.id}', '${nextState}')">
                                ${actionBtnText}
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (e) {
        console.error("Error al cargar vehículos:", e);
    }
};

window.toggleVehiculoStatus = async (id, nextState) => {
    if (confirm(`¿Seguro que deseas cambiar el estado del vehículo a "${nextState}"?`)) {
        try {
            await window.API.updateFlotaEstado(id, nextState);
            if (window.navigate) {
                window.navigate('vehiculos');
            }
        } catch (e) {
            alert("Error al actualizar el estado del vehículo");
        }
    }
};
