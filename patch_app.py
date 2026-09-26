import os

file_path = 'frontend/js/app.js'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

replacement = '''
    // Load initial view based on role
    if (userRole === 'despachador') {
        navigate('despachador');
    } else if (userRole === 'conductor') {
        navigate('conductor');
    } else {
        navigate('inicio');
    }

    // Hide global loader after a brief delay for smooth transition
    setTimeout(() => {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.classList.remove('active');
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 600);
});
'''

text = text.replace('''
    // Load initial view based on role
    if (userRole === 'despachador') {
        navigate('despachador');
    } else if (userRole === 'conductor') {
        navigate('conductor');
    } else {
        navigate('inicio');
    }
});''', replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("app.js patched")
