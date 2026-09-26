import os
import re

file_path = 'frontend/js/app.js'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Reemplazar la funcion openNuevaOperacionModal completa
old_func_pattern = r'const openNuevaOperacionModal = \(\) => \{.*?(?=const openCrearRutaModal)'
new_func = '''const openNuevaOperacionModal = () => {
        if (!actionModal || !modalTitle || !modalBody) return;
        modalTitle.textContent = 'Nueva Operación de Entrega';
        modalBody.innerHTML = `
            <form id="form-nueva-operacion">
                <div class="modal-form-group">
                    <label>Dirección (Calle y Número)</label>
                    <input type="text" id="modal-op-calle" placeholder="Ej: Av. Vitacura 5400" required>
                </div>
                <div class="modal-form-group">
                    <label>Comuna (Región Metropolitana)</label>
                    <select id="modal-op-comuna" required>
                        <option value="">Seleccione Comuna...</option>
                        <option value="Santiago">Santiago</option>
                        <option value="Providencia">Providencia</option>
                        <option value="Las Condes">Las Condes</option>
                        <option value="Vitacura">Vitacura</option>
                        <option value="Lo Barnechea">Lo Barnechea</option>
                        <option value="Ñuñoa">Ñuñoa</option>
                        <option value="Macul">Macul</option>
                        <option value="Peñalolén">Peñalolén</option>
                        <option value="La Florida">La Florida</option>
                        <option value="Maipú">Maipú</option>
                        <option value="Estación Central">Estación Central</option>
                        <option value="Pudahuel">Pudahuel</option>
                        <option value="Quilicura">Quilicura</option>
                        <option value="San Bernardo">San Bernardo</option>
                        <option value="Puente Alto">Puente Alto</option>
                    </select>
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
                <div class="modal-footer">
                    <button type="button" class="btn" style="background: white; border: 1px solid var(--border-color); color: var(--text-main);" onclick="document.getElementById('action-modal').classList.remove('active')">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="btn-crear-pedido"><i class="ph-bold ph-plus"></i> Crear Pedido</button>
                </div>
            </form>
        `;

        const form = document.getElementById('form-nueva-operacion');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const calle = document.getElementById('modal-op-calle').value.trim();
            const comuna = document.getElementById('modal-op-comuna').value;
            const ventana = document.getElementById('modal-op-ventana').value;
            const btn = document.getElementById('btn-crear-pedido');

            const direccion_completa = `${calle}, ${comuna}, Chile`;

            // Geocoding
            btn.disabled = true;
            btn.innerHTML = 'Procesando...';

            let lat = null;
            let lng = null;

            if (typeof google !== 'undefined' && google.maps) {
                try {
                    const geocoder = new google.maps.Geocoder();
                    const result = await new Promise((resolve, reject) => {
                        geocoder.geocode({ address: direccion_completa }, (res, status) => {
                            if (status === 'OK') resolve(res[0].geometry.location);
                            else reject(status);
                        });
                    });
                    lat = result.lat();
                    lng = result.lng();
                } catch(err) {
                    console.warn('Geocoder failed, using fallback coordinates');
                    // Fallback to central Santiago
                    lat = -33.4489;
                    lng = -70.6693;
                }
            } else {
                lat = -33.4489;
                lng = -70.6693;
            }

            const newOp = {
                id_cliente: 1, // Default para UI
                direccion: direccion_completa,
                latitud: lat,
                longitud: lng,
                codigo_pedido: `P-${Math.floor(10000 + Math.random() * 90000)}`,
                fecha_requerida: new Date().toISOString().split('T')[0],
                ventana_horaria: ventana,
                peso_total: 10,
                volumen_total: 0.5
            };

            try {
                const response = await window.API.createOperacion(newOp);
                closeModal();
                alert(`¡Pedido creado exitosamente!`);
                // Refrescar mapa/lista en la vista actual
                if (currentActiveView === 'operacion' && window.views['operacion'].init) {
                    window.views['operacion'].init();
                } else if (currentActiveView === 'inicio' && window.views['inicio'].init) {
                    window.views['inicio'].init();
                }
            } catch (err) {
                console.warn('API error:', err);
                alert('Error al crear el pedido: ' + err.message);
                btn.disabled = false;
                btn.innerHTML = '<i class="ph-bold ph-plus"></i> Crear Pedido';
            }
        });

        actionModal.classList.add('active');
    };

    '''

text = re.sub(old_func_pattern, new_func, text, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("app.js modal actualizado")
