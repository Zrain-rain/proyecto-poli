// js/views/operacion.js

const renderOperacion = () => {
    return `
        <div class="dashboard-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="card kpi-card">
                <div class="kpi-icon blue"><i class="ph-fill ph-cube"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value">3.800</span>
                    </div>
                    <div class="kpi-label">Entregas programadas</div>
                </div>
            </div>
            
            <div class="card kpi-card">
                <div class="kpi-icon green"><i class="ph-bold ph-check"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value">2.964</span>
                    </div>
                    <div class="kpi-label">A tiempo</div>
                </div>
            </div>

            <div class="card kpi-card">
                <div class="kpi-icon warning"><i class="ph-fill ph-warning"></i></div>
                <div class="kpi-content">
                    <div class="kpi-value-row">
                        <span class="kpi-value">624</span>
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
                    <span>Mostrando 12 de 3.800 operaciones</span>
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

const initOperacion = () => {
    const tbody = document.getElementById('operaciones-table-body');
    if (tbody) {
        tbody.innerHTML = mockData.operaciones.map(op => {
            let statusClass = 'ontime';
            let barColor = 'green';
            if(op.estado === 'En riesgo') { statusClass = 'risk'; barColor = 'blue'; }
            if(op.estado === 'Retrasada') { statusClass = 'delayed'; barColor = 'blue'; }
            if(op.estado === 'Entregada') { barColor = 'green'; }

            return `
                <tr>
                    <td style="color: var(--primary); font-weight: 600;">${op.id}</td>
                    <td>${op.pedido}</td>
                    <td>${op.destino}</td>
                    <td>${op.ventana}</td>
                    <td>${op.vehiculo}</td>
                    <td>${op.conductor}</td>
                    <td><span class="status-badge ${statusClass}">${op.estado}</span></td>
                    <td>
                        <div class="progress-cell">
                            <span style="width: 35px; font-size: 12px; font-weight: 600;">${op.avance}%</span>
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill ${barColor}" style="width: ${op.avance}%;"></div>
                            </div>
                        </div>
                    </td>
                    <td style="color: var(--text-muted); cursor: pointer; text-align: center;"><i class="ph-bold ph-dots-three"></i></td>
                </tr>
            `;
        }).join('');
    }
};
