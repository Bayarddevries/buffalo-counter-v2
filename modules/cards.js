// ===================================
// Cards Rendering & Setup
// ===================================
import { state, formatNumber, updateCounterDisplay } from './init.js';
import { setupAtmosphericBg } from './atmosphere.js';

export function setupCards(timelineData) {
    const section = document.getElementById('cardsSection');
    if (!section) return;
    
    state.section = section;
    state.atmoBg = document.getElementById('atmoBg');
    
    // Render cards
    section.innerHTML = '';
    
    timelineData.events.forEach((event, index) => {
        const card = createCard(event, index, timelineData.events.length);
        section.appendChild(card);
    });
    
    // Add footer
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = 'Created by Bayard deVries · <a href="https://github.com/Bayarddevries/buffalo-counter" target="_blank" rel="noopener noreferrer">GitHub</a>';
    section.appendChild(footer);
    
    // Add buffer card
    const buffer = document.createElement('div');
    buffer.className = 'card card-buffer';
    buffer.setAttribute('aria-hidden', 'true');
    section.appendChild(buffer);
    
    // Cache card references
    state.cards = section.querySelectorAll('.card[data-year]');
    
    // Set initial active
    if (state.cards.length > 0) {
        state.cards[0].classList.add('active');
        setupAtmosphericBg(state.cards[0]);
    }
}

function createCard(event, index, total) {
    const card = document.createElement('div');
    const isLast = index === total - 1;
    card.className = `card${isLast ? ' card-end' : ''}`;
    card.dataset.year = event.year;
    card.dataset.pop = event.population;
    if (event.atmosphericBg) card.dataset.bg = `images/${event.atmosphericBg}`;
    
    let html = `
        <div class="card-inner">
            <div class="card-year">${event.year}</div>
            <h2 class="card-title">${event.label}</h2>
            <figure class="card-image">
                <img src="images/${event.image}" alt="${escapeHtml(event.alt)}" loading="${index === 0 ? 'eager' : 'lazy'}">
                <figcaption>${escapeHtml(event.caption)}</figcaption>
            </figure>
            <p class="card-text">${injectCitations(event.text, event.citations)}</p>
    `;
    
    if (isLast && event.finalImage) {
        html += `
            <p class="card-text" style="margin-top: 1rem;">${escapeHtml(event.closingText || '')}</p>
            <figure class="card-image-final">
                <img src="images/${event.finalImage}" alt="${escapeHtml(event.finalAlt)}" loading="lazy">
                <figcaption>${escapeHtml(event.finalCaption)}</figcaption>
            </figure>
        `;
    }
    
    html += '</div>';
    card.innerHTML = html;
    return card;
}

function injectCitations(text, citations) {
    if (!citations) return text;
    let result = text;
    citations.forEach(cite => {
        const ref = `[${cite.id}]`;
        const replacement = `<a href="#" class="cite" data-source="${escapeHtml(cite.source)}">${ref}</a>`;
        result = result.replace(ref, replacement);
    });
    return result;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}