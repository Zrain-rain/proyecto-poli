import os

file_path = 'frontend/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

replacement = '''    <!-- Favicon -->
    <link rel="icon" type="image/png" href="img/Logo POLI de rutas inteligentes.png">
</head>
<body>
    <!-- Global Loader -->
    <div id="global-loader" class="global-loader">
        <div class="loader-content">
            <img src="img/Logo POLI de rutas inteligentes.png" alt="POLI Logo">
            <div class="spinner"></div>
        </div>
    </div>

    <div class="app-container">'''

# replace <head> and <body> block
import re
text = re.sub(r'</head>\s*<body>\s*<div class="app-container">', replacement, text)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("index.html patched")
