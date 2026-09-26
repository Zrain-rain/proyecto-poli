import os
import re

# 1. Update index.html
path_idx = 'frontend/index.html'
with open(path_idx, 'r', encoding='utf-8') as f:
    text_idx = f.read()

# The sidebar logo has class="sidebar-header" before it, let's use regex to target the sidebar logo
# Sidebar logo:
# <div class="sidebar-header">
#     <div class="logo">
#         <img src="img/logo-poli.png" alt="POLI Logo" style="height: 48px; object-fit: contain;">

text_idx = re.sub(
    r'(<div class="sidebar-header">\s*<div class="logo">\s*<img src=")img/logo-poli.png(")',
    r'\g<1>img/Logo POLI de rutas inteligentes.png\g<2>',
    text_idx
)

with open(path_idx, 'w', encoding='utf-8') as f:
    f.write(text_idx)


# 2. Update login.html
path_login = 'frontend/login.html'
with open(path_login, 'r', encoding='utf-8') as f:
    text_login = f.read()

# The login card logo:
# <div class="login-logo">
#     <img src="img/logo-poli.png" alt="POLI Logo" style="height: 56px; object-fit: contain;">
# </div>

text_login = re.sub(
    r'(<div class="login-logo">\s*<img src=")img/logo-poli.png(")',
    r'\g<1>img/Logo POLI de rutas inteligentes.png\g<2>',
    text_login
)

with open(path_login, 'w', encoding='utf-8') as f:
    f.write(text_login)

print("Logos revertidos a 'Logo POLI de rutas inteligentes.png' solo en Sidebar y Login Card.")
