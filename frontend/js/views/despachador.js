// js/views/despachador.js

const renderDespachador = () => {
    return `
        <style>
            /* Estilos específicos para la vista móvil del Despachador */
            .mobile-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .mobile-header {
                text-align: center;
                margin-bottom: 10px;
            }
            .mobile-header h2 {
                font-size: 24px;
                color: var(--text-main);
                margin: 0;
            }
            .mobile-header p {
                font-size: 14px;
                color: var(--text-muted);
            }
            .order-card {
                background: white;
                border-radius: 16px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                border: 1px solid var(--border-color);
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .order-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 12px;
            }
            .order-id {
                font-size: 18px;
                font-weight: 700;
                color: var(--primary);
            }
            .order-details p {
                margin: 4px 0;
                font-size: 15px;
                color: var(--text-main);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .order-actions {
                display: flex;
                gap: 12px;
                margin-top: 8px;
            }
            .btn-huge {
                flex: 1;
                padding: 16px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                border: none;
                cursor: pointer;
                transition: transform 0.1s;
            }
            .btn-huge:active {
                transform: scale(0.98);
            }
            .btn-deliver {
                background: var(--success);
                color: white;
            }
            .btn-delay {
                background: #FFFBEB;
                color: #975A16;
                border: 1px solid #FFCE20;
            }
            .btn-disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        </style>

        <div class="mobile-container">
            <div class="mobile-header">
                <h2>Mis Entregas</h2>
                <p>Gestiona tus pedidos asignados</p>
            </div>
            
            <div id="despachador-orders-list">
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    Cargando entregas...
                </div>
            </div>
        </div>
    `;
};

const initDespachador = async () => {
    try {
        const operaciones = await window.API.getOperaciones();
        
        // En una app real, filtraríamos por el chofer logueado.
        // Aquí mostramos todos los pedidos que no estén Entregados, o bien todos ordenados.
        // Simularemos mostrar las operaciones activas para el rol despachador.
        
        const listContainer = document.getElementById('despachador-orders-list');
        if (listContainer && operaciones) {
            
            if(operaciones.length === 0) {
                listContainer.innerHTML = `<div style="text-align:center; padding: 20px;">No tienes pedidos asignados.</div>`;
                return;
            }

            listContainer.innerHTML = operaciones.map(op => {
                const isDelivered = op.estado === 'Entregado';
                return `
                    <div class="order-card" style="${isDelivered ? 'opacity: 0.7;' : ''}">
                        <div class="order-header">
                            <div class="order-id">#${op.id}</div>
                            <div class="status-badge ${isDelivered ? 'ontime' : (op.estado === 'Con retraso' ? 'delayed' : 'outline')}">${op.estado}</div>
                        </div>
                        <div class="order-details">
                            <p><i class="ph-fill ph-map-pin" style="color: var(--primary);"></i> <strong>Destino:</strong> ${op.destino}</p>
                            <p><i class="ph-fill ph-clock" style="color: var(--primary);"></i> <strong>Ventana:</strong> ${op.ventana}</p>
                        </div>
                        <div class="order-actions">
                            ${!isDelivered ? `
                                <button class="btn-huge btn-delay" onclick="window.updateOrderStatus('${op.id}', 'Con retraso')">
                                    <i class="ph-fill ph-warning"></i> Retraso
                                </button>
                                <button class="btn-huge btn-deliver" onclick="window.updateOrderStatus('${op.id}', 'Entregado')">
                                    <i class="ph-bold ph-check"></i> Entregado
                                </button>
                            ` : `
                                <div style="width: 100%; text-align: center; color: var(--success); font-weight: 700; padding: 10px;">
                                    <i class="ph-fill ph-check-circle"></i> Operación finalizada
                                </div>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (e) {
        console.error("Error al cargar operaciones para despachador:", e);
    }
};

window.updateOrderStatus = async (id, estado) => {
    if(confirm(`¿Confirmas marcar el pedido como "${estado}"?`)) {
        try {
            await window.API.updateOperacionEstado(id, estado);
            if(window.navigate) {
                window.navigate('despachador'); // Refresca la vista
            }
        } catch(e) {
            alert("Ocurrió un error al actualizar");
        }
    }
};
