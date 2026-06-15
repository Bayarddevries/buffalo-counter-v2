// ===================================
// Main Initialization
// ===================================
import { setupCards } from './cards.js';
import { setupCounter } from './counter.js';
import { setupTimeline } from './timeline.js';
import { setupSplash } from './splash.js';
import { setupSources } from './sources.js';
import { setupCitationToast } from './toast.js';
import { setupScroll } from './scroll.js';
import { setupKeyboard } from './keyboard.js';

export function init(timelineData) {
    // Initialize all modules
    setupCards(timelineData);
    setupCounter();
    setupTimeline(timelineData);
    setupSplash();
    setupSources(timelineData);
    setupCitationToast();
    setupScroll();
    setupKeyboard();
    
    // Set initial state
    const firstEvent = timelineData.events[0];
    if (firstEvent) {
        updateCounterDisplay(firstEvent.year, firstEvent.population, firstEvent.populationLabel, firstEvent.status);
    }
}

// Global state for cross-module communication
export const state = {
    currentYear: 1800,
    currentPop: 30000000,
    ticking: false,
    promptHidden: false,
    cards: null,
    section: null,
    atmoBg: null
};

// Shared utility functions
export function formatNumber(n) {
    try { return n.toLocaleString('en-US'); }
    catch { return String(n); }
}

export function getStatusClass(status) {
    switch (status) {
        case 'extinct':
        case 'critical':
            return 'critical';
        case 'warning':
            return 'declining';
        case 'declining':
            return 'warning';
        default:
            return '';
    }
}

export function updateCounterDisplay(year, pop, label, status) {
    const $year = document.getElementById('counterYear');
    const $pop = document.getElementById('counterValue');
    const $status = document.getElementById('counterStatus');
    
    if ($year) $year.textContent = year;
    if ($pop) {
        $pop.textContent = formatNumber(pop);
        $pop.className = 'counter-value';
        const cls = getStatusClass(status);
        if (cls) $pop.classList.add(cls);
    }
    if ($status) $status.textContent = label;
    
    state.currentYear = year;
    state.currentPop = pop;
}