// js/views/configuracion.js

const renderConfiguracion = () => {
    const user = localStorage.getItem('poli_user') || 'Usuario';
    const role = (localStorage.getItem('poli_role') || 'Admin').toUpperCase();
    const config = JSON.parse(localStorage.getItem('poli_settings') || '{}');

    const empresa = config.empresa || 'TransAndes Logística S.A.';
    const base = config.base || 'Camino las flores 1008, Lampa, Chile';
    const umbralRetraso = config.umbralRetraso || '15';
    const autoRefresh = config.autoRefresh !== false;
    const trafficLayer = config.trafficLayer !== false;

    return `
        <div class="operation-layout" style="grid-template-columns: 1fr; max-width: 900px; margin: 0 auto;">
            
            <!-- Empresa y Operación -->
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="kpi-icon blue" style="width: 40px; height: 40px; font-size: 20px;"><i class="ph-fill ph-buildings"></i></div>
                        <div>
                            <h3 class="card-title" style="margin: 0;">Parámetros de la Base Operativa</h3>
                            <p style="font-size: 13px; color: var(--text-muted); margin: 2px 0 0 0;">Información del centro de distribución y ruteo central</p>
                        </div>
                    </div>
                </div>

                <div style="padding: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">Nombre de la Empresa</label>
                        <input type="text" id="cfg-empresa" value="${empresa}" class="filter-select" style="width: 100%; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">Centro de Distribución (Base)</label>
                        <input type="text" id="cfg-base" value="${base}" class="filter-select" style="width: 100%; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                    </div>
                </div>
            </div>

            <!-- Inteligencia Artificial & Mapas -->
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="kpi-icon blue" style="width: 40px; height: 40px; font-size: 20px; background: #EEF2FF; color: var(--primary);"><i class="ph-fill ph-sparkle"></i></div>
                        <div>
                            <h3 class="card-title" style="margin: 0;">Motor de Optimización e Inteligencia Artificial</h3>
                            <p style="font-size: 13px; color: var(--text-muted); margin: 2px 0 0 0;">Configuración de Google Maps y Gemini AI</p>
                        </div>
                    </div>
                </div>

                <div style="padding: 20px 0; display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-app); border-radius: 12px;">
                        <div>
                            <h4 style="margin: 0; font-size: 14px; font-weight: 600;">Asistente de IA (Gemini Flash)</h4>
                            <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-muted);">Genera recomendaciones automáticas de reasignación y alerta de cuellos de botella</p>
                        </div>
                        <span class="badge-pill active" style="padding: 6px 14px;"><i class="ph-fill ph-check-circle"></i> Conectado</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-app); border-radius: 12px;">
                        <div>
                            <h4 style="margin: 0; font-size: 14px; font-weight: 600;">Capa de Tráfico en Tiempo Real</h4>
                            <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-muted);">Muestra congestión y retrasos en los mapas de la plataforma</p>
                        </div>
                        <input type="checkbox" id="cfg-traffic" ${trafficLayer ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--primary); cursor: pointer;">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 8px;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">Umbral de Alerta por Retraso</label>
                            <select id="cfg-umbral" class="filter-select" style="width: 100%; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                                <option value="10" ${umbralRetraso === '10' ? 'selected' : ''}>10 minutos de retraso</option>
                                <option value="15" ${umbralRetraso === '15' ? 'selected' : ''}>15 minutos de retraso (Recomendado)</option>
                                <option value="20" ${umbralRetraso === '20' ? 'selected' : ''}>20 minutos de retraso</option>
                                <option value="30" ${umbralRetraso === '30' ? 'selected' : ''}>30 minutos de retraso</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">Refresco de Monitoreo</label>
                            <select id="cfg-refresh" class="filter-select" style="width: 100%; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                                <option value="true" ${autoRefresh ? 'selected' : ''}>Automático (cada 30 segundos)</option>
                                <option value="false" ${!autoRefresh ? 'selected' : ''}>Manual (al navegar)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sesión Actual -->
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="kpi-icon green" style="width: 40px; height: 40px; font-size: 20px;"><i class="ph-fill ph-user-circle"></i></div>
                        <div>
                            <h3 class="card-title" style="margin: 0;">Sesión Activa</h3>
                            <p style="font-size: 13px; color: var(--text-muted); margin: 2px 0 0 0;">Información del usuario y credenciales actuales</p>
                        </div>
                    </div>
                </div>

                <div style="padding: 20px 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">${user}</div>
                        <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Rol: <strong style="color: var(--primary);">${role}</strong></div>
                    </div>
                    <button class="btn btn-danger" onclick="window.logoutSession()" style="padding: 8px 16px; border-radius: var(--radius-sm);">
                        <i class="ph ph-sign-out"></i> Cerrar Sesión
                    </button>
                </div>
            </div>

            <!-- Botón Guardar -->
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 40px;">
                <button class="btn btn-primary" onclick="window.saveConfiguracion()" style="padding: 12px 24px; font-size: 14px; font-weight: 600;">
                    <i class="ph ph-floppy-disk"></i> Guardar Cambios
                </button>
            </div>

        </div>
    `;
};

const initConfiguracion = () => {
    // Configuración inicial o listeners si se requieren
};

window.saveConfiguracion = () => {
    const empresa = document.getElementById('cfg-empresa')?.value || '';
    const base = document.getElementById('cfg-base')?.value || '';
    const umbralRetraso = document.getElementById('cfg-umbral')?.value || '15';
    const trafficLayer = document.getElementById('cfg-traffic')?.checked ?? true;
    const autoRefresh = document.getElementById('cfg-refresh')?.value === 'true';

    const newConfig = {
        empresa,
        base,
        umbralRetraso,
        trafficLayer,
        autoRefresh
    };

    localStorage.setItem('poli_settings', JSON.stringify(newConfig));

    // Actualizar nombre de empresa en sidebar si existe
    const companyDisplay = document.querySelector('.user-info .user-company');
    if (companyDisplay && empresa) {
        companyDisplay.textContent = empresa;
    }

    alert('Configuración guardada correctamente.');
};

window.logoutSession = () => {
    if (confirm('¿Deseas cerrar sesión en POLI?')) {
        localStorage.removeItem('poli_jwt');
        localStorage.removeItem('poli_role');
        localStorage.removeItem('poli_user');
        window.location.href = 'login.html';
    }
};
