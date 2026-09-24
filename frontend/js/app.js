// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Auth Guard
    const token = localStorage.getItem('poli_jwt');
    const userRole = (localStorage.getItem('poli_role') || '').toLowerCase();
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Set User Name, Company, and Avatar
    const username = localStorage.getItem('poli_user') || 'Usuario';
    const userDisplay = document.querySelector('.user-info .user-name');
    const avatarDisplay = document.querySelector('.user-profile .avatar');
    const companyDisplay = document.querySelector('.user-info .user-company');
    
    if (userDisplay) {
        userDisplay.textContent = username;
    }
    if (avatarDisplay) {
        avatarDisplay.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0052FF&color=FFFFFF`;
    }
    const savedConfig = JSON.parse(localStorage.getItem('poli_settings') || '{}');
    if (companyDisplay && savedConfig.empresa) {
        companyDisplay.textContent = savedConfig.empresa;
    }

    // Profile dropdown toggle
    const userProfile = document.getElementById('user-profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (userProfile && profileDropdown) {
        userProfile.addEventListener('click', (e) => {
            // Prevent toggling if clicked on dropdown itself
            if(e.target.closest('.profile-dropdown')) return;
            const isVisible = profileDropdown.style.display === 'flex';
            profileDropdown.style.display = isVisible ? 'none' : 'flex';
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!userProfile.contains(e.target)) {
                profileDropdown.style.display = 'none';
            }
        });
    }

    // Global UI Functions
    window.showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const icons = { success: 'ph-check-circle', error: 'ph-warning-circle', warning: 'ph-warning' };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="ph-fill ${icons[type] || icons.success}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    };

    window.showModal = (title, fields, onConfirm) => {
        const overlay = document.getElementById('global-modal');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const btnCancel = document.getElementById('modal-cancel');
        const btnConfirm = document.getElementById('modal-confirm');
        const btnClose = document.getElementById('modal-close');

        if(!overlay) return;

        titleEl.textContent = title;
        bodyEl.innerHTML = fields.map(f => {
            if (f.type === 'custom') {
                return f.html;
            }
            if (f.type === 'select') {
                return `
                    <div class="modal-input-group">
                        <label>${f.label}</label>
                        <select id="modal-input-${f.id}">
                            ${f.options.map(opt => `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.text}</option>`).join('')}
                        </select>
                    </div>
                `;
            }
            return `
                <div class="modal-input-group">
                    <label>${f.label}</label>
                    <input type="${f.type || 'text'}" id="modal-input-${f.id}" placeholder="${f.placeholder || ''}" value="${f.value || ''}">
                </div>
            `;
        }).join('');

        const closeModal = () => { overlay.style.display = 'none'; };

        btnCancel.onclick = closeModal;
        btnClose.onclick = closeModal;
        
        btnConfirm.onclick = () => {
            const values = {};
            fields.forEach(f => {
                if (f.id) {
                    const inputEl = document.getElementById(`modal-input-${f.id}`);
                    if (inputEl) values[f.id] = inputEl.value;
                }
            });
            onConfirm(values);
            closeModal();
        };

        overlay.style.display = 'flex';
    };

    const viewContainer = document.getElementById('view-container');
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    
    // Header Elements
    const headerTitle = document.querySelector('.page-title');
    const headerSubtitle = document.querySelector('.page-subtitle');
    const headerActionBtn = document.getElementById('header-action-btn');
    const searchBar = document.getElementById('global-search');

    // Sidebar Toggle
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('sidebar-close-btn');
    
    if (sidebar) {
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('collapsed');
                if (overlay) {
                    overlay.classList.toggle('active');
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.remove('collapsed');
                if (overlay) overlay.classList.remove('active');
            });
        }

        // Close sidebar on mobile when clicking the overlay
        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('collapsed');
                overlay.classList.remove('active');
            });
        }
    }

    // Real-time Clock
    const dateWidget = document.getElementById('date-widget');
    const timeWidget = document.getElementById('time-widget');
    if (dateWidget && timeWidget) {
        const updateClock = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            dateWidget.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
            timeWidget.textContent = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    // Update Alert Badge
    const updateAlertBadge = async () => {
        try {
            const alertas = await window.API.getAlertas();
            const badge = document.getElementById('sidebar-alert-badge');
            if (badge && alertas) {
                const count = alertas.length;
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline-flex' : 'none';
            }
        } catch(e) { console.error('Error fetching alertas badge:', e); }
    };
    updateAlertBadge();


    // Role-based UI logic
    const navInicio = document.querySelector('.nav-item[data-view="inicio"]');
    const navOperacion = document.querySelector('.nav-item[data-view="operacion"]');
    const navRutas = document.querySelector('.nav-item[data-view="rutas"]');
    const navFlota = document.getElementById('nav-flota');
    const navVehiculos = document.getElementById('nav-vehiculos');
    const navDespachador = document.getElementById('nav-despachador');

    if (userRole && ['admin', 'user', 'operador'].includes(userRole.toLowerCase())) {
        if (navFlota) navFlota.style.display = 'flex';
        if (navVehiculos) navVehiculos.style.display = 'flex';
    }
    
    if (userRole && userRole.toLowerCase() === 'despachador') {
        if (navInicio) navInicio.style.display = 'none';
        if (navRutas) navRutas.style.display = 'none';
        if (navFlota) navFlota.style.display = 'none';
        if (navVehiculos) navVehiculos.style.display = 'none';
        if (navDespachador) navDespachador.style.display = 'flex';
        // Hide sidebar for mobile workers to give full screen to their app
        document.querySelector('.sidebar').style.display = 'none';
        document.querySelector('.main-content').style.marginLeft = '0';
        
        // Inyectar botón de logout en el header para que puedan salir
        const headerRight = document.querySelector('.header-right');
        if (headerRight && !document.getElementById('mobile-logout-btn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'mobile-logout-btn';
            logoutBtn.className = 'btn btn-primary';
            logoutBtn.innerHTML = '<i class="ph-bold ph-sign-out"></i> Salir';
            logoutBtn.onclick = () => {
                if(confirm('¿Desea cerrar sesión?')) {
                    localStorage.removeItem('poli_jwt');
                    localStorage.removeItem('poli_role');
                    localStorage.removeItem('poli_user');
                    window.location.href = 'login.html';
                }
            };
            headerRight.appendChild(logoutBtn);
        }
    }

    if (userRole && userRole.toLowerCase() === 'conductor') {
        if (navInicio) navInicio.style.display = 'none';
        if (navOperacion) navOperacion.style.display = 'none';
        if (navRutas) navRutas.style.display = 'none';
        if (navFlota) navFlota.style.display = 'none';
        if (navVehiculos) navVehiculos.style.display = 'none';
        if (navDespachador) navDespachador.style.display = 'none';
        
        document.querySelector('.sidebar').style.display = 'none';
        document.querySelector('.main-content').style.marginLeft = '0';
        
        const headerRight = document.querySelector('.header-right');
        if (headerRight && !document.getElementById('mobile-logout-btn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'mobile-logout-btn';
            logoutBtn.className = 'btn btn-primary';
            logoutBtn.innerHTML = '<i class="ph-bold ph-sign-out"></i> Salir';
            logoutBtn.onclick = () => {
                if(confirm('¿Desea cerrar sesión?')) {
                    localStorage.removeItem('poli_jwt');
                    localStorage.removeItem('poli_role');
                    localStorage.removeItem('poli_user');
                    window.location.href = 'login.html';
                }
            };
            headerRight.appendChild(logoutBtn);
        }
    }

    // View configurations
    const views = {
        'inicio': {
            title: 'Panel de control',
            subtitle: 'Resumen de la operación logística',
            render: renderInicio,
            init: initInicio,
            showActionBtn: false,
            showSearch: false
        },
        'operacion': {
            title: 'Operación',
            subtitle: 'Seguimiento y control de entregas',
            render: renderOperacion,
            init: initOperacion,
            showActionBtn: true,
            actionText: 'Crear pedido',
            showSearch: true
        },
        'rutas': {
            title: 'Rutas',
            subtitle: 'Planificación y optimización de recorridos',
            render: renderRutas,
            init: initRutas,
            showActionBtn: true,
            actionText: 'Crear ruta',
            showSearch: true
        },
        'flota': {
            title: 'Gestión de Camiones',
            subtitle: 'Control de camiones pesados',
            render: renderFlota,
            init: initFlota,
            showActionBtn: true,
            actionText: 'Registrar Camión',
            showSearch: true
        },
        'vehiculos': {
            title: 'Gestión de Vehículos',
            subtitle: 'Control de vehículos livianos y última milla',
            render: renderVehiculos,
            init: initVehiculos,
            showActionBtn: true,
            actionText: 'Registrar Vehículo Liviano',
            showSearch: true
        },
        'alertas': {
            title: 'Historial de Alertas',
            subtitle: 'Registro de incidentes y retrasos',
            render: typeof renderAlertas !== 'undefined' ? renderAlertas : () => '<div style="padding: 24px;">Módulo en construcción</div>',
            init: typeof initAlertas !== 'undefined' ? initAlertas : () => {},
            showActionBtn: false,
            showSearch: false
        },
        'reportes': {
            title: 'Reportes y Análisis',
            subtitle: 'Rendimiento general de la operación',
            render: typeof renderReportes !== 'undefined' ? renderReportes : () => '<div style="padding: 24px;">Módulo en construcción</div>',
            init: typeof initReportes !== 'undefined' ? initReportes : () => {},
            showActionBtn: false,
            showSearch: false
        },
        'despachador': {
            title: 'Despachador',
            subtitle: 'Mis rutas y entregas',
            render: renderDespachador,
            init: initDespachador,
            showActionBtn: false,
            showSearch: false
        },
        'conductor': {
            title: 'Mi Ruta',
            subtitle: 'Navegación y entregas',
            render: typeof renderConductor !== 'undefined' ? renderConductor : () => '<div style="padding: 24px;">Módulo en construcción</div>',
            init: typeof initConductor !== 'undefined' ? initConductor : () => {},
            showActionBtn: false,
            showSearch: false
        },
        'configuracion': {
            title: 'Configuración del Sistema',
            subtitle: 'Parámetros generales de la plataforma y preferencias',
            render: renderConfiguracion,
            init: initConfiguracion,
            showActionBtn: false,
            showSearch: false
        }
    };

    let currentActiveView = 'inicio';

    // Routing function
    const navigate = (viewName) => {
        if (!views[viewName]) return;
        const view = views[viewName];
        currentActiveView = viewName;

        // Clear search input on navigation
        if (searchBar) {
            const input = searchBar.querySelector('input');
            if (input) input.value = '';
        }

        // Update active nav item
        navItems.forEach(item => {
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update Header
        headerTitle.textContent = view.title;
        headerSubtitle.textContent = view.subtitle;
        
        if (view.showActionBtn) {
            headerActionBtn.style.display = 'inline-flex';
            document.getElementById('header-action-text').textContent = view.actionText;
            headerActionBtn.onclick = null; // Clear previous handlers
        } else {
            headerActionBtn.style.display = 'none';
        }

        if (view.showSearch) {
            searchBar.style.display = 'flex';
        } else {
            searchBar.style.display = 'none';
        }

        // Render Content
        viewContainer.innerHTML = view.render();
        
        // Wait for DOM update then initialize scripts (maps, charts, etc.)
        setTimeout(() => {
            view.init();
        }, 50);
    };

    // Attach click events
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.dataset.view;
            navigate(viewName);
            // Hide sidebar on mobile after clicking
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('collapsed'); // In our CSS, mobile shows when .collapsed is present
                const overlay = document.getElementById('sidebar-overlay');
                if (overlay) overlay.classList.remove('active');
            }
        });
    });

    // Expose navigate globally for inline links
    window.navigate = navigate;

    // ==========================================
    // 1. BUSCADOR GLOBAL EN TIEMPO REAL
    // ==========================================
    const searchInput = searchBar ? searchBar.querySelector('input') : null;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (currentActiveView === 'operacion' && window.setOperacionSearchQuery) {
                window.setOperacionSearchQuery(query);
            } else if (currentActiveView === 'rutas' && window.setRutaSearchQuery) {
                window.setRutaSearchQuery(query);
            } else if (currentActiveView === 'flota') {
                filterTableSimple('flota-table-body', query);
            } else if (currentActiveView === 'vehiculos') {
                filterTableSimple('vehiculos-table-body', query);
            } else if (currentActiveView === 'alertas') {
                filterTableSimple('alertas-table-body', query);
            }
        });
    }

    const filterTableSimple = (tbodyId, query) => {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    };

    // ==========================================
    // 2. CONTADOR DE ALERTAS EN SIDEBAR
    // ==========================================
    const updateSidebarAlertBadge = async () => {
        try {
            const alertas = await window.API.getAlertas();
            const badge = document.getElementById('sidebar-alert-badge');
            if (badge && Array.isArray(alertas)) {
                badge.textContent = alertas.length;
                badge.style.display = 'inline-block';
                badge.style.padding = '2px 8px';
                badge.style.borderRadius = '999px';
                badge.style.fontSize = '11px';
                badge.style.fontWeight = '700';
                badge.style.color = 'white';
                if (alertas.length > 0) {
                    badge.style.backgroundColor = 'var(--danger)';
                } else {
                    badge.style.backgroundColor = 'var(--success)';
                }
            }
        } catch (e) {
            console.error('Error actualizando contador de alertas', e);
        }
    };
    updateSidebarAlertBadge();
    setInterval(updateSidebarAlertBadge, 30000);

    // ==========================================
    // 3. MODAL DE ACCIONES (+ NUEVA OPERACIÓN / RUTA)
    // ==========================================
    const actionModal = document.getElementById('action-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    const closeModal = () => {
        if (actionModal) actionModal.classList.remove('active');
    };

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    if (actionModal) {
        actionModal.addEventListener('click', (e) => {
            if (e.target === actionModal) closeModal();
        });
    }

    // IMPORTANTE: Las funciones deben declararse ANTES del addEventListener
    // para evitar errores de Temporal Dead Zone con const.
    const openNuevaOperacionModal = () => {
        if (!actionModal || !modalTitle || !modalBody) return;
        modalTitle.textContent = 'Nueva Operación de Entrega';
        modalBody.innerHTML = `
            <form id="form-nueva-operacion">
                <div class="modal-form-group">
                    <label>Destino de Entrega (Dirección Completa)</label>
                    <input type="text" id="modal-op-destino" placeholder="Ej: Av. Vitacura 5400, Vitacura, Chile" required>
                </div>
                <div class="modal-form-group">
                    <label>Ventana Horaria</label>
                    <select id="modal-op-ventana" required>
                        <option value="08:00 - 10:00">08:00 - 10:00</option>
                        <option value="09:00 - 11:00">09:00 - 11:00</option>
                        <option value="11:00 - 13:00">11:00 - 13:00</option>
                        <option value="14:00 - 16:00">14:00 - 16:00</option>
                        <option value="16:00 - 18:00">16:00 - 18:00</option>
                    </select>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                    <div class="modal-form-group">
                        <label>Vehículo Asignado</label>
                        <select id="modal-op-vehiculo" required>
                            <option value="V-101">V-101 (Camión)</option>
                            <option value="V-118">V-118 (Camión)</option>
                            <option value="V-207">V-207 (Liviano)</option>
                            <option value="V-093">V-093 (Liviano)</option>
                        </select>
                    </div>
                    <div class="modal-form-group">
                        <label>Conductor Asignado</label>
                        <select id="modal-op-conductor" required>
                            <option value="F. Contreras">F. Contreras</option>
                            <option value="A. Morales">A. Morales</option>
                            <option value="M. Silva">M. Silva</option>
                            <option value="Sin asignar">Sin asignar</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn" style="background: white; border: 1px solid var(--border-color); color: var(--text-main);" onclick="document.getElementById('action-modal').classList.remove('active')">Cancelar</button>
                    <button type="submit" class="btn btn-primary"><i class="ph-bold ph-plus"></i> Crear Operación</button>
                </div>
            </form>
        `;

        const form = document.getElementById('form-nueva-operacion');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const destino = document.getElementById('modal-op-destino').value.trim();
            const ventana = document.getElementById('modal-op-ventana').value;
            const vehiculo = document.getElementById('modal-op-vehiculo').value;
            const conductor = document.getElementById('modal-op-conductor').value;

            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const newOp = {
                id: `#E${randomNum}`,
                pedido: `P-${Math.floor(10000 + Math.random() * 90000)}`,
                destino,
                ventana,
                vehiculo,
                conductor,
                estado: 'A tiempo',
                avance: 0
            };

            try {
                await window.API.createOperacion(newOp);
            } catch (err) {
                console.warn('API error:', err);
            }

            if (window.addNewOperacionLocally) {
                window.addNewOperacionLocally(newOp);
            }

            closeModal();
            alert(`¡Operación ${newOp.id} creada exitosamente!\nAsignada a ${conductor} (${vehiculo}).`);
        });

        actionModal.classList.add('active');
    };

    const openCrearRutaModal = () => {
        if (!actionModal || !modalTitle || !modalBody) return;
        modalTitle.textContent = 'Crear Nueva Ruta de Despacho';
        modalBody.innerHTML = `
            <form id="form-crear-ruta">
                <div class="modal-form-group">
                    <label>Nombre de la Ruta</label>
                    <input type="text" id="modal-ruta-nombre" placeholder="Ej: Ruta Vitacura - Las Condes" required>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                    <div class="modal-form-group">
                        <label>Zona</label>
                        <select id="modal-ruta-zona" required>
                            <option value="Oriente">Sector Oriente</option>
                            <option value="Poniente">Sector Poniente</option>
                            <option value="Norte">Sector Norte</option>
                            <option value="Sur">Sector Sur</option>
                            <option value="Centro">Sector Centro</option>
                        </select>
                    </div>
                    <div class="modal-form-group">
                        <label>Distancia Estimada (km)</label>
                        <input type="number" id="modal-ruta-distancia" value="28" min="1" max="500" required>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                    <div class="modal-form-group">
                        <label>Vehículo Asignado</label>
                        <select id="modal-ruta-vehiculo" required>
                            <option value="V-101">V-101 (Camión)</option>
                            <option value="V-118">V-118 (Camión)</option>
                            <option value="V-207">V-207 (Liviano)</option>
                            <option value="V-093">V-093 (Liviano)</option>
                        </select>
                    </div>
                    <div class="modal-form-group">
                        <label>Conductor Asignado</label>
                        <select id="modal-ruta-conductor" required>
                            <option value="F. Contreras">F. Contreras</option>
                            <option value="A. Morales">A. Morales</option>
                            <option value="M. Silva">M. Silva</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn" style="background: white; border: 1px solid var(--border-color); color: var(--text-main);" onclick="document.getElementById('action-modal').classList.remove('active')">Cancelar</button>
                    <button type="submit" class="btn btn-primary"><i class="ph-bold ph-plus"></i> Crear Ruta</button>
                </div>
            </form>
        `;

        const form = document.getElementById('form-crear-ruta');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('modal-ruta-nombre').value.trim();
            const zona = document.getElementById('modal-ruta-zona').value;
            const distancia = Number(document.getElementById('modal-ruta-distancia').value) || 25;
            const vehiculo = document.getElementById('modal-ruta-vehiculo').value;
            const conductor = document.getElementById('modal-ruta-conductor').value;

            const randomId = 'R' + Math.floor(4 + Math.random() * 20);
            const newRuta = {
                id: randomId,
                nombre,
                zona,
                estado: 'Planificada',
                vehiculo,
                conductor,
                paradas: 1,
                distancia,
                tiempoEstimado: '1 h 20 min',
                avance: 0
            };

            try {
                await window.API.createRuta(newRuta);
            } catch (err) {
                console.warn('API error:', err);
            }

            if (window.addNewRutaLocally) {
                window.addNewRutaLocally(newRuta);
            }

            closeModal();
            alert(`¡Ruta ${newRuta.id} (${nombre}) creada exitosamente!`);
        });

        actionModal.classList.add('active');
    };

    if (headerActionBtn) {
        headerActionBtn.addEventListener('click', () => {
            if (currentActiveView === 'operacion') {
                openNuevaOperacionModal();
            } else if (currentActiveView === 'rutas') {
                openCrearRutaModal();
            }
        });
    }



    // Load initial view based on role
    if (userRole === 'despachador') {
        navigate('despachador');
    } else if (userRole === 'conductor') {
        navigate('conductor');
    } else {
        navigate('inicio');
    }
});
