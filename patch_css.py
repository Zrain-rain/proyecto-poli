import os

file_path = 'frontend/css/styles.css'
css_content = '''
/* Global Loader */
.global-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--bg-main);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.5s ease, visibility 0.5s ease;
}

.global-loader.active {
    opacity: 1;
    visibility: visible;
}

.loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    animation: fade-in-up 0.8s ease-out;
}

.loader-content img {
    height: 80px;
    object-fit: contain;
    /* Optional: add a subtle pulse animation to the logo */
    animation: pulse-logo 2s infinite ease-in-out;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(var(--primary-rgb), 0.1);
    border-radius: 50%;
    border-top-color: var(--primary);
    animation: spin 1s linear infinite;
}

@keyframes pulse-logo {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
'''

with open(file_path, 'a', encoding='utf-8') as f:
    f.write(css_content)

print("styles.css patched")
