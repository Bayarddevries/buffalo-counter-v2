// ===================================
// The Vanishing Buffalo - Single File App
// No ES modules for static hosting compatibility
// ===================================

(async function() {
    'use strict';
    
    // ===================================
    // State
    // ===================================
    const state = {
        currentYear: 1800,
        currentPop: 30000000,
        ticking: false,
        promptHidden: false,
        cards: null,
        section: null,
        atmoBg: null,
        timelineData: null,
        imageManifest: null
    };
    
    const MIN_YEAR = 1800;
    const MAX_YEAR = 1900;
    const YEAR_RANGE = MAX_YEAR - MIN_YEAR;
    
    let animationFrame = null;
    let animationStart = null;
    const animationDuration = 800;
    let toastTimeout = null;
    
    // ===================================
    // Utilities
    // ===================================
    function formatNumber(n) {
        try { return n.toLocaleString('en-US'); }
        catch { return String(n); }
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function getStatusClass(status) {
        switch (status) {
            case 'extinct':
            case 'critical': return 'critical';
            case 'warning': return 'declining';
            case 'declining': return 'warning';
            default: return '';
        }
    }
    
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // ===================================
    // Load Timeline Data
    // ===================================
    async function loadTimeline() {
        const response = await fetch('data/timeline.json');
        if (!response.ok) throw new Error(`Failed to load timeline: ${response.status}`);
        return response.json();
    }

    // ===================================
    // Image Manifest Helpers
    // ===================================
    function getImageMeta(filename) {
        if (!state.imageManifest) return null;
        return state.imageManifest.get(filename) || null;
    }

    function buildImageCredit(filename) {
        const meta = getImageMeta(filename);
        if (!meta) return '';
        
        const parts = [];
        if (meta.credit) parts.push(`<span class="img-credit">Credit: ${escapeHtml(meta.credit)}</span>`);
        if (meta.license) parts.push(`<span class="img-license">${escapeHtml(meta.license)}</span>`);
        if (meta.source_url) parts.push(`<a class="img-source" href="${escapeHtml(meta.source_url)}" target="_blank" rel="noopener noreferrer">View source</a>`);
        
        if (parts.length === 0) return '';
        return `<div class="img-meta">${parts.join(' · ')}</div>`;
    }

    // ===================================
    // Load Image Manifest
    // ===================================
    async function loadImageManifest() {
        const response = await fetch('data/images.json');
        if (!response.ok) throw new Error(`Failed to load image manifest: ${response.status}`);
        const data = await response.json();
        const manifest = new Map();
        data.images.forEach(img => {
            manifest.set(img.file, img);
        });
        return manifest;
    }
    
    // ===================================
    // Counter Animation
    // ===================================
    function animateCounter(targetYear, targetPop, targetLabel, targetStatus) {
        const $pop = document.getElementById('counterValue');
        const $year = document.getElementById('counterYear');
        const $status = document.getElementById('counterStatus');
        if (!$pop || !$year || !$status) return;
        
        if (animationFrame) cancelAnimationFrame(animationFrame);
        
        const startPop = state.currentPop;
        const startYear = state.currentYear;
        const startTime = performance.now();
        
        function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            const eased = easeOutCubic(progress);
            
            const currentPop = Math.round(startPop + (targetPop - startPop) * eased);
            const currentYear = Math.round(startYear + (targetYear - startYear) * eased);
            
            $year.textContent = currentYear;
            $pop.textContent = formatNumber(currentPop);
            
            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                $year.textContent = targetYear;
                $pop.textContent = formatNumber(targetPop);
                $status.textContent = targetLabel;
                $pop.className = 'counter-value';
                const cls = getStatusClass(targetStatus);
                if (cls) $pop.classList.add(cls);
                
                state.currentYear = targetYear;
                state.currentPop = targetPop;
            }
        }
        
        animationFrame = requestAnimationFrame(animate);
    }
    
    // ===================================
    // Timeline Updates
    // ===================================
    function updateTimeline(year) {
        const $fill = document.getElementById('timelineFill');
        if (!$fill) return;
        
        const progress = Math.max(0, Math.min(1, (year - MIN_YEAR) / YEAR_RANGE));
        $fill.style.width = `${progress * 100}%`;
        
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
        
        if (effectClass !== $fill.dataset.effect) {
            $fill.dataset.effect = effectClass;
            $fill.className = 'timeline-fill';
            if (effectClass) $fill.classList.add(effectClass);
        }
    }
    
    // ===================================
    // Timeline Labels - Major years only + tick marks
    // ===================================
    function setupTimelineLabels(timelineData) {
        const $labels = document.getElementById('timelineLabels');
        if (!$labels) return;

        // Major labeled years
        const MAJOR_YEARS = [1800, 1850, 1900];
        
        // All event years for tick marks
        const eventYears = timelineData.events.map(e => e.year);
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
            if (MAJOR_YEARS.includes(year)) return;
            const percent = ((year - MIN_YEAR) / YEAR_RANGE) * 100;
            html += `<span class="timeline-tick" style="left: ${percent}%" title="${year}"></span>`;
        });
        
        $labels.innerHTML = html;

        // Style
        $labels.style.position = 'relative';
        $labels.style.display = 'flex';
        $labels.style.height = '24px';
        
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
    
    // ===================================
    // Atmospheric Background
    // ===================================
    function setupAtmosphericBg(card) {
        if (!state.atmoBg || !card) return;
        const bg = card.dataset.bg;
        if (!bg) return;
        state.atmoBg.style.backgroundImage = `url(${bg})`;
    }
    
    // ===================================
    // Cards Rendering
    // ===================================
    function renderCards(timelineData) {
        const section = document.getElementById('cardsSection');
        if (!section) return;
        
        state.section = section;
        state.atmoBg = document.getElementById('atmoBg');
        
        section.innerHTML = '';
        
        timelineData.events.forEach((event, index) => {
            const card = createCard(event, index, timelineData.events.length);
            section.appendChild(card);
        });
        
        // Footer
        const footer = document.createElement('div');
        footer.className = 'footer';
        footer.innerHTML = 'Created by Bayard deVries · <a href="https://github.com/Bayarddevries/buffalo-counter" target="_blank" rel="noopener noreferrer">GitHub</a>';
        section.appendChild(footer);
        
        // Buffer
        const buffer = document.createElement('div');
        buffer.className = 'card card-buffer';
        buffer.setAttribute('aria-hidden', 'true');
        section.appendChild(buffer);
        
        state.cards = section.querySelectorAll('.card[data-year]');
        
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

        const mainCredit = buildImageCredit(event.image);
        let html = `
            <div class="card-inner">
                <div class="card-year">${event.year}</div>
                <h2 class="card-title">${escapeHtml(event.label)}</h2>
                <figure class="card-image">
                    <img src="images/${event.image}" alt="${escapeHtml(event.alt)}" loading="${index === 0 ? 'eager' : 'lazy'}">
                    <figcaption>${escapeHtml(event.caption)}${mainCredit}</figcaption>
                </figure>
                <p class="card-text">${injectCitations(event.text, event.citations)}</p>
        `;

        if (isLast && event.finalImage) {
            const finalCredit = buildImageCredit(event.finalImage);
            html += `
                <p class="card-text" style="margin-top: 1rem;">${escapeHtml(event.closingText || '')}</p>
                <figure class="card-image-final">
                    <img src="images/${event.finalImage}" alt="${escapeHtml(event.finalAlt)}" loading="lazy">
                    <figcaption>${escapeHtml(event.finalCaption)}${finalCredit}</figcaption>
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
    
    // ===================================
    // Scroll Handling
    // ===================================
    function setupScroll() {
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
        if (state.timelineData && state.timelineData.events) {
            const event = state.timelineData.events.find(e => e.year === targetYear) 
                || state.timelineData.events.reduce((prev, curr) => 
                    Math.abs(curr.year - targetYear) < Math.abs(prev.year - targetYear) ? curr : prev);
            
            if (event) {
                targetPop = event.population;
                targetLabel = event.populationLabel;
                targetStatus = event.status;
            }
        }
        
        animateCounter(targetYear, targetPop, targetLabel, targetStatus);
        updateTimeline(targetYear);
        
        state.cards.forEach(c => c.classList.remove('active'));
        if (activeCard) {
            activeCard.classList.add('active');
            setupAtmosphericBg(activeCard);
        }
        
        if (!state.promptHidden) {
            const $prompt = document.getElementById('scrollPrompt');
            if ($prompt) {
                $prompt.style.display = 'none';
                state.promptHidden = true;
            }
        }
    }
    
    // ===================================
    // Splash Screen
    // ===================================
    function setupSplash() {
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

    function enhanceSplashImage() {
        const splashFigcaption = document.querySelector('.splash-image figcaption');
        if (!splashFigcaption) return;
        
        // Splash uses bisonhides.jpg
        const credit = buildImageCredit('bisonhides.jpg');
        if (credit) {
            splashFigcaption.innerHTML = splashFigcaption.textContent + credit;
        }
    }
    
    // ===================================
    // Sources Panel
    // ===================================
    function setupSources(timelineData) {
        const toggle = document.getElementById('sourcesToggle');
        const panel = document.getElementById('sourcesPanel');
        if (!toggle || !panel) return;
        
        if (timelineData.sources) {
            panel.innerHTML = renderSources(timelineData.sources);
        }
        
        toggle.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            if (expanded) panel.setAttribute('hidden', '');
            else panel.removeAttribute('hidden');
        });
        
        panel.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                toggle.setAttribute('aria-expanded', 'false');
                panel.setAttribute('hidden', '');
                toggle.focus();
            }
        });
        
        document.getElementById('sourcesBar').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                toggle.setAttribute('aria-expanded', 'false');
                panel.setAttribute('hidden', '');
            }
        });
    }
    
    function renderSources(sources) {
        const categories = {
            'Population Estimates & Data': [1, 2, 12],
            'Historical Events & Mechanisms': [3, 7, 10, 11],
            'Métis History & Culture': [4, 5, 8, 9],
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
    
    // ===================================
    // Citation Toast
    // ===================================
    function setupCitationToast() {
        const toast = document.createElement('div');
        toast.className = 'citation-toast';
        document.body.appendChild(toast);
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cite')) {
                e.preventDefault();
                const source = e.target.getAttribute('data-source');
                
                toast.textContent = source;
                toast.classList.add('visible');
                
                clearTimeout(toastTimeout);
                toastTimeout = setTimeout(() => {
                    toast.classList.remove('visible');
                }, 5000);
            }
        });
    }
    
    // ===================================
    // Keyboard Navigation
    // ===================================
    function setupKeyboard() {
        document.addEventListener('keydown', (e) => {
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
    
    // ===================================
    // Bootstrap
    // ===================================
    async function bootstrap() {
        try {
            const [timeline, imageManifest] = await Promise.all([
                loadTimeline(),
                loadImageManifest()
            ]);
            state.timelineData = timeline;
            state.imageManifest = imageManifest;

            setupTimelineLabels(timeline);
            renderCards(timeline);
            setupSplash();
            enhanceSplashImage();
            setupSources(timeline);
            setupCitationToast();
            setupScroll();
            setupKeyboard();

            // Initial state
            const firstEvent = timeline.events[0];
            if (firstEvent) {
                const $year = document.getElementById('counterYear');
                const $pop = document.getElementById('counterValue');
                const $status = document.getElementById('counterStatus');
                if ($year) $year.textContent = firstEvent.year;
                if ($pop) $pop.textContent = formatNumber(firstEvent.population);
                if ($status) $status.textContent = firstEvent.populationLabel;

                state.currentYear = firstEvent.year;
                state.currentPop = firstEvent.population;

                updateTimeline(firstEvent.year);
            }

            console.log('Buffalo Counter initialized successfully');
        } catch (err) {
            console.error('Failed to initialize:', err);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();