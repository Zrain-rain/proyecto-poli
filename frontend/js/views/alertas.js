// js/views/alertas.js

const renderAlertas = () => {
    return `
        <div class="card" style="min-height: 500px;">
            <div class="card-header">
                <h3 class="card-title">Registro de Incidentes y Retrasos</h3>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>ID Pedido</th>
                            <th>Destino</th>
                            <th>Camión/Vehículo</th>
                            <th>Conductor</th>
                            <th>Estado Actual</th>
                        </tr>
                    </thead>
                    <tbody id="alertas-table-body">
                        <tr><td colspan="6" style="text-align:center; padding: 20px;">Cargando historial...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

const initAlertas = async () => {
    try {
        const alertas = await window.API.getAlertas();
        const tbody = document.getElementById('alertas-table-body');
        
        if (alertas && alertas.length > 0) {
            tbody.innerHTML = alertas.map(alerta => {
                const date = new Date(alerta.fecha).toLocaleDateString('es-CL', {
                    day: '2-digit', month: 'short', year: 'numeric'
                });
                return `
                    <tr>
                        <td>${date}</td>
                        <td style="color: var(--danger); font-weight: 600;">${alerta.pedido}</td>
                        <td>${alerta.destino}</td>
                        <td><span class="badge-pill outline"><i class="ph ph-truck"></i> ${alerta.patente || 'N/A'}</span></td>
                        <td>${alerta.conductor || 'N/A'}</td>
                        <td><span class="status-badge delayed">${alerta.estado}</span></td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--text-muted);">No hay registros de alertas.</td></tr>`;
        }
    } catch (error) {
        console.error("Error cargando alertas:", error);
    }
};
