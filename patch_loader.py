import os
import re

# 1. Update index.html
path_idx = 'frontend/index.html'
with open(path_idx, 'r', encoding='utf-8') as f:
    text_idx = f.read()

text_idx = text_idx.replace('Logo POLI de rutas inteligentes.png', 'logo-poli.png')
with open(path_idx, 'w', encoding='utf-8') as f:
    f.write(text_idx)

# 2. Update login.html
path_login = 'frontend/login.html'
with open(path_login, 'r', encoding='utf-8') as f:
    text_login = f.read()

text_login = text_login.replace('Logo POLI de rutas inteligentes.png', 'logo-poli.png')
# Incrementar un poco más el tiempo en login.html
text_login = text_login.replace('600);', '1200);')
with open(path_login, 'w', encoding='utf-8') as f:
    f.write(text_login)

# 3. Update styles.css
path_css = 'frontend/css/styles.css'
with open(path_css, 'r', encoding='utf-8') as f:
    text_css = f.read()

text_css = text_css.replace('background-color: var(--bg-main);', 'background-color: #ffffff; /* Fijo para que no se mezcle */')
with open(path_css, 'w', encoding='utf-8') as f:
    f.write(text_css)

# 4. Update app.js
path_app = 'frontend/js/app.js'
with open(path_app, 'r', encoding='utf-8') as f:
    text_app = f.read()

# Make the timeout longer and rely on window.onload + timeout for dashboard
app_logic = '''
    // Hide global loader after a brief delay for smooth transition
    setTimeout(() => {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.classList.remove('active');
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 1500);
'''
text_app = re.sub(r'// Hide global loader after a brief delay.*?\}, \d+\);\n', app_logic.strip() + '\n', text_app, flags=re.DOTALL)

with open(path_app, 'w', encoding='utf-8') as f:
    f.write(text_app)

print("Archivos parcheados correctamente")
