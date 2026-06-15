// ===================================
// Splash Screen
// ===================================

export function setupSplash() {
    const splash = document.getElementById('splash');
    const btn = document.getElementById('splashEnter');
    if (!splash || !btn) return;
    
    btn.addEventListener('click', () => {
        splash.classList.add('hidden');
        splash.addEventListener('transitionend', () => {
            if (splash.parentNode) splash.remove();
        }, { once: true });
        setTimeout(() => { if (splash.parentNode) splash.remove(); }, 600);
    });
}