// ===================================
// Timeline Bar & Labels
// ===================================
import { state } from './init.js';

const MIN_YEAR = 1800;
const MAX_YEAR = 1900;
const YEAR_RANGE = MAX_YEAR - MIN_YEAR;

// Major labeled years - only these get text labels
const MAJOR_YEARS = [1800, 1850, 1900];

export function setupTimeline(timelineData) {
    const $fill = document.getElementById('timelineFill');
    const $labels = document.getElementById('timelineLabels');
    const $track = document.querySelector('.timeline-track');
    if (!$fill || !$labels || !$track) return;

    // Get all event years for tick marks
    const eventYears = timelineData.events.map(e => e.year);
    
    // Add start/end
    if (!eventYears.includes(MIN_YEAR)) eventYears.unshift(MIN_YEAR);
    if (!eventYears.includes(MAX_YEAR)) eventYears.push(MAX_YEAR);
    eventYears.sort((a, b) => a - b);

    // Build: major labels + all tick marks
    let html = '';
    
    // Major year labels (with text)
    MAJOR_YEARS.forEach(year => {
        const percent = ((year - MIN_YEAR) / YEAR_RANGE) * 100;
        html += `<span class="timeline-label-major" style="left: ${percent}%">${year}</span>`;
    });
    
    // Minor tick marks (all event years, no text)
    eventYears.forEach(year => {
        if (MAJOR_YEARS.includes(year)) return; // skip majors, already handled
        const percent = ((year - MIN_YEAR) / YEAR_RANGE) * 100;
        html += `<span class="timeline-tick" style="left: ${percent}%" title="${year}"></span>`;
    });
    
    $labels.innerHTML = html;

    // Style labels
    $labels.style.position = 'relative';
    $labels.style.display = 'flex';
    $labels.style.height = '24px'; // space for labels
    
    $labels.querySelectorAll('.timeline-label-major').forEach(span => {
        span.style.position = 'absolute';
        span.style.transform = 'translateX(-50%)';
        span.style.whiteSpace = 'nowrap';
        span.style.fontFamily = 'var(--font-body)';
        span.style.fontSize = '0.7rem';
        span.style.color = 'var(--color-text-muted)';
        span.style.top = '8px';
        span.style.pointerEvents = 'none';
    });
    
    $labels.querySelectorAll('.timeline-tick').forEach(span => {
        span.style.position = 'absolute';
        span.style.transform = 'translateX(-50%)';
        span.style.width = '1px';
        span.style.height = '10px';
        span.style.background = 'var(--color-border)';
        span.style.top = '0';
        span.style.pointerEvents = 'none';
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