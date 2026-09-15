// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Auth Guard
    const token = localStorage.getItem('poli_jwt');
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

    // Load initial view
    navigate('inicio');
});
