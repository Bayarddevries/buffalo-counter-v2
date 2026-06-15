// ===================================
// Scroll Interpolation & Active Card
// ===================================
import { state } from './init.js';
import { animateCounter } from './counter.js';
import { updateTimeline } from './timeline.js';
import { setupAtmosphericBg } from './atmosphere.js';

export function setupScroll() {
    if (!state.section) return;
    
    state.section.addEventListener('scroll', () => {
        if (!state.ticking) {
            requestAnimationFrame(() => {
                updateFromScroll();
                state.ticking = false;
            });
            state.ticking = true;
        }
    }, { passive: true });
}

function updateFromScroll() {
    const sectionRect = state.section.getBoundingClientRect();
    const viewportCenter = sectionRect.top + sectionRect.height / 2;
    
    let topCard = null;
    let bottomCard = null;
    
    state.cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        if (cardCenter <= viewportCenter) {
            if (!topCard || rect.top > topCard.getBoundingClientRect().top) {
                topCard = card;
            }
        }
        if (cardCenter > viewportCenter) {
            if (!bottomCard || rect.top < bottomCard.getBoundingClientRect().top) {
                bottomCard = card;
            }
        }
    });
    
    let activeCard = null;
    let targetYear = state.currentYear;
    let targetPop = state.currentPop;
    let targetLabel = '';
    let targetStatus = '';
    
    // Find the event data for the active card
    const timelineData = window.timelineData;
    
    if (topCard && bottomCard) {
        const topYear = parseInt(topCard.dataset.year, 10);
        const bottomYear = parseInt(bottomCard.dataset.year, 10);
        const topRect = topCard.getBoundingClientRect();
        const botRect = bottomCard.getBoundingClientRect();
        
        const topCenter = topRect.top + topRect.height / 2;
        const botCenter = botRect.top + botRect.height / 2;
        const range = botCenter - topCenter;
        const progress = range > 0 ? (viewportCenter - topCenter) / range : 0;
        const clampedProgress = Math.max(0, Math.min(1, progress));
        
        targetYear = Math.round(topYear + clampedProgress * (bottomYear - topYear));
        activeCard = clampedProgress < 0.5 ? topCard : bottomCard;
    } else if (topCard) {
        targetYear = parseInt(topCard.dataset.year, 10);
        activeCard = topCard;
    } else if (bottomCard) {
        targetYear = parseInt(bottomCard.dataset.year, 10);
        activeCard = bottomCard;
    }
    
    // Find matching event data
    if (timelineData && timelineData.events) {
        const event = timelineData.events.find(e => e.year === targetYear) 
            || timelineData.events.reduce((prev, curr) => 
                Math.abs(curr.year - targetYear) < Math.abs(prev.year - targetYear) ? curr : prev);
        
        if (event) {
            targetPop = event.population;
            targetLabel = event.populationLabel;
            targetStatus = event.status;
        }
    }
    
    // Update counter with animation
    animateCounter(targetYear, targetPop, targetLabel, targetStatus);
    
    // Update timeline
    updateTimeline(targetYear);
    
    // Update active card visual state
    state.cards.forEach(c => c.classList.remove('active'));
    if (activeCard) {
        activeCard.classList.add('active');
        setupAtmosphericBg(activeCard);
    }
    
    // Hide scroll prompt on first interaction
    if (!state.promptHidden) {
        const $prompt = document.getElementById('scrollPrompt');
        if ($prompt) {
            $prompt.style.display = 'none';
            state.promptHidden = true;
        }
    }
}