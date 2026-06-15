// ===================================
// Atmospheric Background Crossfade
// ===================================

export function setupAtmosphericBg(card) {
    const $atmoBg = document.getElementById('atmoBg');
    if (!$atmoBg || !card) return;
    
    const bg = card.dataset.bg;
    if (!bg) return;
    
    $atmoBg.style.backgroundImage = `url(${bg})`;
}