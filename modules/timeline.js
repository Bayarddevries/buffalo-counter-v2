// ===================================
// Timeline Bar & Labels
// ===================================
import { state } from './init.js';

const MIN_YEAR = 1800;
const MAX_YEAR = 1900;
const YEAR_RANGE = MAX_YEAR - MIN_YEAR;

export function setupTimeline(timelineData) {
    const $fill = document.getElementById('timelineFill');
    const $labels = document.getElementById('timelineLabels');
    if (!$fill || !$labels) return;
    
    // Generate year tick labels from data
    const years = timelineData.events.map(e => e.year);
    // Add start/end if not present
    if (!years.includes(MIN_YEAR)) years.unshift(MIN_YEAR);
    if (!years.includes(MAX_YEAR)) years.push(MAX_YEAR);
    years.sort((a, b) => a - b);
    
    // Render labels
    $labels.innerHTML = years.map(year => {
        const percent = ((year - MIN_YEAR) / YEAR_RANGE) * 100;
        return `<span style="left: ${percent}%">${year}</span>`;
    }).join('');
    
    // Style labels with absolute positioning
    $labels.style.position = 'relative';
    $labels.style.display = 'flex';
    $labels.querySelectorAll('span').forEach(span => {
        span.style.position = 'absolute';
        span.style.transform = 'translateX(-50%)';
        span.style.whiteSpace = 'nowrap';
    });
}

export function updateTimeline(year) {
    const $fill = document.getElementById('timelineFill');
    if (!$fill) return;
    
    // Progress from 1800 to 1900 - bar GROWS as tragedy accumulates
    const progress = Math.max(0, Math.min(1, (year - MIN_YEAR) / YEAR_RANGE));
    $fill.style.width = `${progress * 100}%`;
    
    // Color based on population level (using current pop from state)
    const pop = state.currentPop;
    let fillColor = '';
    let effectClass = '';
    
    if (pop < 10000) {
        fillColor = 'var(--color-danger-dark)';
        effectClass = 'pulse-extinct';
    } else if (pop < 100000) {
        fillColor = 'var(--color-danger)';
        effectClass = 'pulse-critical';
    } else if (pop < 1000000) {
        fillColor = 'var(--color-warning)';
    } else if (pop < 15000000) {
        fillColor = 'var(--color-accent)';
    } else {
        fillColor = 'var(--color-pop-green)';
    }
    
    $fill.style.background = fillColor;
    
    // Toggle pulse animation classes
    if (effectClass !== $fill.dataset.effect) {
        $fill.dataset.effect = effectClass;
        $fill.className = 'timeline-fill';
        if (effectClass) $fill.classList.add(effectClass);
    }
}