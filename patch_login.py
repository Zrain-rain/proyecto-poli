import os

file_path = 'frontend/login.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace favicon
text = text.replace('<title>POLI - Iniciar Sesión</title>', '<title>POLI - Iniciar Sesión</title>\n    <!-- Favicon -->\n    <link rel="icon" type="image/png" href="img/Logo POLI de rutas inteligentes.png">')

# Add global loader
loader_html = '''
    <!-- Global Loader -->
    <div id="global-loader" class="global-loader active">
        <div class="loader-content">
            <img src="img/Logo POLI de rutas inteligentes.png" alt="POLI Logo">
            <div class="spinner"></div>
        </div>
    </div>
'''
text = text.replace('<body>', '<body>' + loader_html)

# Add logic to fade out loader
script_logic = '''
    <script>
        // Hide global loader after short delay
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loader = document.getElementById('global-loader');
                if (loader) {
                    loader.classList.remove('active');
                    setTimeout(() => loader.style.display = 'none', 500);
                }
            }, 600);
        });
'''
text = text.replace('<script>', script_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("login.html patched")
