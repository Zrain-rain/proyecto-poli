// js/views/configuracion.js

const renderConfiguracion = () => {
    return `
        <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr;">
            <!-- User Creation Form -->
            <div class="card" style="padding: 24px;">
                <h3 class="card-title" style="margin-bottom: 20px;">Crear Nuevo Usuario</h3>
                <form id="create-user-form" style="display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-main);">Nombre de Usuario</label>
                        <input type="text" id="cfg-username" class="modal-input" placeholder="Ej. jperez" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-main);">Contraseña</label>
                        <input type="password" id="cfg-password" class="modal-input" placeholder="Contraseña segura" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                    </div>
                    <div style="display: flex; gap: 16px;">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-main);">Nombre</label>
                            <input type="text" id="cfg-nombre" class="modal-input" placeholder="Nombre" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-main);">Apellido</label>
                            <input type="text" id="cfg-apellido" class="modal-input" placeholder="Apellido" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                        </div>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-main);">Rol del Usuario</label>
                        <select id="cfg-role" class="modal-input" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: white;">
                            <option value="">Cargando roles...</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" style="margin-top: 10px; width: 100%;">
                        <i class="ph-bold ph-user-plus"></i> Crear Usuario
                    </button>
                </form>
            </div>

            <!-- System Settings -->
            <div class="card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <h3 class="card-title" style="margin-bottom: 20px;">Sistema y Seguridad</h3>
                    <p style="color: var(--text-muted); line-height: 1.5; margin-bottom: 20px;">
                        Gestione su sesión actual y las preferencias globales del sistema. Para mayor seguridad, asegúrese de cerrar sesión al finalizar su jornada.
                    </p>
                    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                        <h4 style="color: var(--primary); font-size: 14px; font-weight: 600; margin-bottom: 8px;">Estado del Sistema</h4>
                        <div style="display: flex; align-items: center; gap: 8px; color: var(--text-main); font-size: 13px;">
                            <div class="dot green"></div> Conexión con Poli-DB Estable
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; color: var(--text-main); font-size: 13px; margin-top: 8px;">
                            <div class="dot green"></div> Modelos de IA Habilitados
                        </div>
                    </div>
                </div>
                
                
                <div style="background-color: var(--bg-main); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Editar Mi Perfil</h4>
                    <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                        <input type="text" id="cfg-my-name" class="modal-input" placeholder="Mi Nombre" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                        <button id="btn-update-name" class="btn btn-primary" style="padding: 10px 16px;"><i class="ph-bold ph-floppy-disk"></i> Guardar</button>
                    </div>
                </div>
                <button id="cfg-logout-btn" class="btn" style="background-color: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; width: 100%; font-weight: 600;">
                    <i class="ph-bold ph-sign-out"></i> Cerrar Sesión Definitivamente
                </button>
            </div>
        </div>
    `;
};

const initConfiguracion = async () => {
    
    const myNameInput = document.getElementById('cfg-my-name');
    if(myNameInput) {
        myNameInput.value = localStorage.getItem('poli_user') || 'Usuario';
        document.getElementById('btn-update-name').onclick = () => {
            const newName = myNameInput.value.trim();
            if(newName) {
                localStorage.setItem('poli_user', newName);
                const sidebarName = document.getElementById('sidebar-user-name');
                if(sidebarName) sidebarName.textContent = newName;
                const sidebarAvatar = document.getElementById('sidebar-avatar');
                if(sidebarAvatar) sidebarAvatar.src = 'https://ui-avatars.com/api/?name='+encodeURIComponent(newName)+'&background=E2E8F0&color=475569';
                window.showToast('Nombre actualizado correctamente', 'success');
            }
        };
    }

    // 1. Cargar roles disponibles
    try {
        const roles = await window.API.getRoles();
        const roleSelect = document.getElementById('cfg-role');
        if (roleSelect && roles) {
            roleSelect.innerHTML = '<option value="" disabled selected>Seleccione un rol...</option>' + 
                roles.map(r => `<option value="${r.id_rol}">${r.nombre} - ${r.descripcion}</option>`).join('');
        }
    } catch (e) {
        console.error("Error cargando roles", e);
    }

    // 2. Manejar creación de usuarios
    const form = document.getElementById('create-user-form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('cfg-username').value;
            const password = document.getElementById('cfg-password').value;
            const nombre = document.getElementById('cfg-nombre').value;
            const apellido = document.getElementById('cfg-apellido').value;
            const role_id = document.getElementById('cfg-role').value;

            if (!role_id) {
                window.showToast("Debe seleccionar un rol", "warning");
                return;
            }

            try {
                const res = await window.API.crearUsuario({ username, password, nombre, apellido, role_id: parseInt(role_id) });
                window.showToast(res.message || "Usuario creado exitosamente", "success");
                form.reset();
            } catch (err) {
                window.showToast(err.message, "error");
            }
        };
    }

    // 3. Botón de Cerrar Sesión
    const logoutBtn = document.getElementById('cfg-logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if(confirm('¿Está seguro que desea cerrar sesión en el sistema Poli?')) {
                localStorage.removeItem('poli_jwt');
                localStorage.removeItem('poli_role');
                localStorage.removeItem('poli_user');
                window.location.href = 'login.html';
            }
        };
    }
};
