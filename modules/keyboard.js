// ===================================
// Keyboard Navigation
// ===================================
import { state } from './init.js';
import { animateCounter } from './counter.js';
import { updateTimeline } from './timeline.js';
import { setupAtmosphericBg } from './atmosphere.js';

export function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
        // Only handle arrow keys when not in sources panel
        const sourcesPanel = document.getElementById('sourcesPanel');
        if (sourcesPanel && !sourcesPanel.hasAttribute('hidden')) return;
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            scrollToNextCard(e.key === 'ArrowDown' ? 1 : -1);
        }
    });
}

function scrollToNextCard(direction) {
    if (!state.section || !state.cards.length) return;
    
    const activeIndex = Array.from(state.cards).findIndex(c => c.classList.contains('active'));
    if (activeIndex === -1) return;
    
    const nextIndex = Math.max(0, Math.min(state.cards.length - 1, activeIndex + direction));
    const nextCard = state.cards[nextIndex];
    
    if (nextCard) {
        state.section.scrollTo({
            top: nextCard.offsetTop,
            behavior: 'smooth'
        });
    }
}