// ===================================
// Sources Panel
// ===================================

export function setupSources(timelineData) {
    const toggle = document.getElementById('sourcesToggle');
    const panel = document.getElementById('sourcesPanel');
    if (!toggle || !panel) return;
    
    // Render sources
    if (timelineData.sources) {
        panel.innerHTML = renderSources(timelineData.sources);
    }
    
    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        if (expanded) panel.setAttribute('hidden', '');
        else panel.removeAttribute('hidden');
    });
    
    // Close on Escape
    panel.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggle.setAttribute('aria-expanded', 'false');
            panel.setAttribute('hidden', '');
            toggle.focus();
        }
    });
    
    // Close on outside click
    document.getElementById('sourcesBar').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            toggle.setAttribute('aria-expanded', 'false');
            panel.setAttribute('hidden', '');
        }
    });
}

function renderSources(sources) {
    // Group by category
    const categories = {
        'Population Estimates & Data': [1, 2, 12], // Flores, Peterson, Phillips
        'Historical Events & Mechanisms': [3, 7, 10, 11], // Isenberg, Taylor, Smits, Sheridan
        'Métis History & Culture': [4, 5, 8, 9], // Calloway, MacEwan, Doback, Geist
        'All Sources': sources.map(s => s.id)
    };
    
    let html = '';
    
    Object.entries(categories).forEach(([category, ids]) => {
        const catSources = sources.filter(s => ids.includes(s.id));
        if (catSources.length === 0) return;
        
        html += `<h3>${escapeHtml(category)}</h3><ul>`;
        catSources.forEach(s => {
            html += `<li>${escapeHtml(s.full)}</li>`;
        });
        html += '</ul>';
    });
    
    html += '<p class="sources-note">Population data points are interpolated between published estimates. The exact numbers shown are approximations. The pre-collapse population is debated. The scale of collapse, however, is undisputed.</p>';
    
    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}