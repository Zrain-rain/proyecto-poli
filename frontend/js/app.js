// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Auth Guard
    const token = localStorage.getItem('poli_jwt');
    const userRole = localStorage.getItem('poli_role');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Set User Name
    const username = localStorage.getItem('poli_user') || 'Usuario';
    const userDisplay = document.querySelector('.user-info .user-name');
    if (userDisplay) {
        userDisplay.textContent = username;
    }

    // Logout functionality
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.style.cursor = 'pointer';
        userProfile.addEventListener('click', () => {
            if(confirm('¿Desea cerrar sesión?')) {
                localStorage.removeItem('poli_jwt');
                localStorage.removeItem('poli_role');
                localStorage.removeItem('poli_user');
                window.location.href = 'login.html';
            }
        });
    }

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
    if (sidebar && toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Real-time Clock
    const dateWidget = document.getElementById('date-widget');
    const timeWidget = document.getElementById('time-widget');
    if (dateWidget && timeWidget) {
        const updateClock = () => {
            const now = new Date();
            dateWidget.textContent = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            timeWidget.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    // Role-based UI logic
    const navInicio = document.querySelector('.nav-item[data-view="inicio"]');
    const navOperacion = document.querySelector('.nav-item[data-view="operacion"]');
    const navRutas = document.querySelector('.nav-item[data-view="rutas"]');
    const navFlota = document.getElementById('nav-flota');
    const navVehiculos = document.getElementById('nav-vehiculos');
    const navDespachador = document.getElementById('nav-despachador');

    if (userRole === 'admin') {
        if (navFlota) navFlota.style.display = 'flex';
        if (navVehiculos) navVehiculos.style.display = 'flex';
    }
    
    if (userRole === 'despachador') {
        if (navInicio) navInicio.style.display = 'none';
        if (navOperacion) navOperacion.style.display = 'none';
        if (navRutas) navRutas.style.display = 'none';
        if (navFlota) navFlota.style.display = 'none';
        if (navVehiculos) navVehiculos.style.display = 'none';
        if (navDespachador) navDespachador.style.display = 'flex';
        // Hide sidebar header text except for mobile
        document.querySelector('.sidebar').style.width = '100%';
        document.querySelector('.main-content').style.marginLeft = '0';
        document.querySelector('.sidebar').style.display = 'none'; // Maybe hide sidebar completely for despachador if they just see the mobile view
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
            actionText: 'Nueva operación',
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
            showActionBtn: false,
            showSearch: true
        },
        'vehiculos': {
            title: 'Gestión de Vehículos',
            subtitle: 'Control de vehículos livianos',
            render: typeof renderVehiculos !== 'undefined' ? renderVehiculos : () => '<div style="padding: 24px;">Módulo en construcción</div>',
            init: typeof initVehiculos !== 'undefined' ? initVehiculos : () => {},
            showActionBtn: false,
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
        }
    };

    // Routing function
    const navigate = (viewName) => {
        if (!views[viewName]) return;
        const view = views[viewName];

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
        });
    });

    // Expose navigate globally for inline links
    window.navigate = navigate;

    // Load initial view based on role
    if (userRole === 'despachador') {
        navigate('despachador');
    } else {
        navigate('inicio');
    }
});
