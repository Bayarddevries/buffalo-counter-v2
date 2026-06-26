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
        atmoBgCurrent: null,
        atmoBgNext: null,
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

        // v2.1 (B1): year snaps immediately to its already-snapped targetValue. We never animate
        // year text through fractional/non-existent years (e.g. 1815 between 1800→1825). Only the
        // population counter animates; year, label, and status-locked CSS class are applied on the
        // very first frame so the user never sees a non-event year on the counter.
        function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            const eased = easeOutCubic(progress);

            const currentPop = Math.round(startPop + (targetPop - startPop) * eased);

            // Pop updates every frame; year, label, status appear on frame 1 and stay locked.
            $year.textContent = targetYear;
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
    let atmoTransitioning = false;
    function setupAtmosphericBg(card) {
        if (!state.atmoBgCurrent || !state.atmoBgNext || !card) return;
        const bg = card.dataset.bg;
        if (!bg) return;
        
        // If same image already showing, skip
        const currentBg = state.atmoBgCurrent.style.backgroundImage;
        if (currentBg && currentBg.includes(bg)) return;
        
        // Prevent overlapping transitions
        if (atmoTransitioning) return;
        atmoTransitioning = true;
        
        // Set next layer to new image (invisible, behind current)
        state.atmoBgNext.style.backgroundImage = `url(${bg})`;
        state.atmoBgNext.classList.remove('fade-in');
        state.atmoBgCurrent.classList.remove('fade-out');
        
        // Force reflow to ensure initial state is applied
        void state.atmoBgNext.offsetWidth;
        
        // Crossfade: fade in next, fade out current
        state.atmoBgNext.classList.add('fade-in');
        state.atmoBgCurrent.classList.add('fade-out');
        
        // After transition, swap layers
        setTimeout(() => {
            // Move current image to current layer
            state.atmoBgCurrent.style.backgroundImage = `url(${bg})`;
            // Reset classes
            state.atmoBgCurrent.classList.remove('fade-out');
            state.atmoBgNext.classList.remove('fade-in');
            // Reset z-index and opacity via classes (handled by CSS)
            atmoTransitioning = false;
        }, 1200); // Match CSS transition duration
    }
    
    // ===================================
    // Cards Rendering
    // ===================================
    function renderCards(timelineData) {
        const section = document.getElementById('cardsSection');
        if (!section) return;
        
        state.section = section;
        state.atmoBgCurrent = document.getElementById('atmoBgCurrent');
        state.atmoBgNext = document.getElementById('atmoBgNext');
        
        section.innerHTML = '';
        
        timelineData.events.forEach((event, index) => {
            const card = createCard(event, index, timelineData.events.length);
            section.appendChild(card);
        });
        
        // Footer
        const footer = document.createElement('div');
        footer.className = 'footer';
        footer.innerHTML = "Created by Bayard deVries · <a href='https://github.com/Bayarddevries/buffalo-counter' target='_blank' rel='noopener noreferrer'>GitHub</a>";

        // Share button — Web Share API with clipboard fallback
        const shareWrap = document.createElement('div');
        shareWrap.className = 'footer-share';
        const shareBtn = document.createElement('button');
        shareBtn.className = 'share-btn';
        shareBtn.innerHTML = '<span aria-hidden="true">↗</span> Share this';
        shareBtn.addEventListener('click', async () => {
            const url = window.location.href;
            if (navigator.share) {
                try {
                    await navigator.share({ title: 'The Vanishing Buffalo', text: '30 million buffalo in 1800. Fewer than 500 by 1900.', url });
                } catch {}
            } else {
                try {
                    await navigator.clipboard.writeText(url);
                    const orig = shareBtn.textContent;
                    shareBtn.textContent = 'Copied!';
                    setTimeout(() => { shareBtn.textContent = orig; }, 2000);
                } catch {}
            }
        });
        shareWrap.appendChild(shareBtn);
        footer.appendChild(shareWrap);
        
        section.appendChild(footer);
        
        // Buffer
        const buffer = document.createElement('div');
        buffer.className = 'card card-buffer';
        buffer.setAttribute('aria-hidden', 'true');
        section.appendChild(buffer);
        
        state.cards = section.querySelectorAll('.card[data-year]');
        
        // Build scroll-position side dots
        if (state.cards.length > 0) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'scroll-dots';
            dotsContainer.setAttribute('aria-hidden', 'true');
            state.cards.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.className = 'scroll-dot' + (i === 0 ? ' active' : '');
                dotsContainer.appendChild(dot);
            });
            document.body.appendChild(dotsContainer);
        }
        
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
        
        // v2.1 (B1): counter year snaps to nearest known event — never displays invented fractional years.
        // Population still interpolates freely via the activeCard's data-anchored range — see below.
        function snapToNearestEventYear(y, events) {
            if (!events || events.length === 0) return y;
            let bestYear = events[0].year;
            let bestDelta = Math.abs(y - bestYear);
            for (let i = 1; i < events.length; i++) {
                const d = Math.abs(y - events[i].year);
                if (d < bestDelta) { bestDelta = d; bestYear = events[i].year; }
            }
            return bestYear;
        }
        // Interpolate population between the two bracketing events so the pop curve stays smooth.
        // Year is snapped to the nearest event so we never display e.g. 1826 between 1825 and 1850.
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

            const interpolatedYear = topYear + clampedProgress * (bottomYear - topYear);
            // Pop points: look up the two bracketing events for population only.
            const events = (state.timelineData && state.timelineData.events) || [];
            const topEvent = events.find(e => e.year === topYear);
            const botEvent = events.find(e => e.year === bottomYear);
            if (topEvent && botEvent) {
                targetPop = Math.round(topEvent.population + clampedProgress * (botEvent.population - topEvent.population));
                targetLabel = clampedProgress < 0.5 ? topEvent.populationLabel : botEvent.populationLabel;
                targetStatus = clampedProgress < 0.5 ? topEvent.status : botEvent.status;
            }
            // Year: snap to nearest event so counter never shows an invented year.
            targetYear = snapToNearestEventYear(interpolatedYear, events);
            activeCard = clampedProgress < 0.5 ? topCard : bottomCard;
        } else if (topCard) {
            const y = parseInt(topCard.dataset.year, 10);
            targetYear = y;
            const events = (state.timelineData && state.timelineData.events) || [];
            const e = events.find(ev => ev.year === y);
            if (e) { targetPop = e.population; targetLabel = e.populationLabel; targetStatus = e.status; }
            activeCard = topCard;
        } else if (bottomCard) {
            const y = parseInt(bottomCard.dataset.year, 10);
            targetYear = y;
            const events = (state.timelineData && state.timelineData.events) || [];
            const e = events.find(ev => ev.year === y);
            if (e) { targetPop = e.population; targetLabel = e.populationLabel; targetStatus = e.status; }
            activeCard = bottomCard;
        }

        animateCounter(targetYear, targetPop, targetLabel, targetStatus);
        updateTimeline(targetYear);
        
        state.cards.forEach(c => c.classList.remove('active'));
        if (activeCard) {
            activeCard.classList.add('active');
            setupAtmosphericBg(activeCard);
        }

        // Update scroll-position side dots
        const dots = document.querySelectorAll('.scroll-dot');
        if (dots.length && activeCard) {
            const activeIdx = Array.from(state.cards).indexOf(activeCard);
            dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
        }
        
        if (!state.promptHidden) {
            const $prompt = document.getElementById('scrollPrompt');
            if ($prompt) {
                $prompt.style.display = 'none';
                state.promptHidden = true;
            }
        }

        // v2.2 (U2): show the restart pill once we've moved past the first card; hide it again
        // when the user scrolls back to top. Threshold matches card.height: scroll beyond one
        // card height means they've engaged with the timeline.
        const $pill = document.getElementById('restartPill');
        if ($pill) {
            const firstCard = state.cards && state.cards[0];
            if (firstCard) {
                const scrolled = (state.section.scrollTop || 0) > firstCard.offsetHeight * 0.6;
                if (scrolled && $pill.hasAttribute('hidden')) {
                    $pill.removeAttribute('hidden');
                } else if (!scrolled && !$pill.hasAttribute('hidden')) {
                    $pill.setAttribute('hidden', '');
                }
            }
        }
    }

    // ===================================
    // Restart Pill (v2.2, audit U2)
    // ===================================
    function setupRestart() {
        const pill = document.getElementById('restartPill');
        if (!pill) return;
        pill.addEventListener('click', () => {
            if (!state.section) return;
            state.section.scrollTo({ top: 0, behavior: 'smooth' });
            // Reset counter state so the year starts back at 1800 once the scroll lands.
            // (Population will animate down to 30M via the existing updateFromScroll loop.)
            state.currentYear = 1800;
            state.currentPop = 30000000;
        });
    }
    
    // ===================================
    // Splash Screen
    // ===================================
    function setupSplash() {
        const splash = document.getElementById('splash');
        const btn = document.getElementById('splashEnter');
        if (!splash || !btn) return;

        btn.addEventListener('click', () => {
            // v2.2 (U1): use only `transitionend` with `{ once: true }`. The redundant `setTimeout(600)`
            // fallback from the original implementation could double-fire on slow browsers. The CSS
            // transition fully completes within 600ms under all reduced-motion-off conditions, so
            // `transitionend` is reliable. If accessibility needs ever force a no-transition state,
            // re-introduce a fallback guarded the same way (parentNode check).
            splash.classList.add('hidden');
            splash.addEventListener('transitionend', () => {
                if (splash.parentNode) splash.remove();
            }, { once: true });
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
    function isAnyModalOpen() {
        // v2.2 (U3): generic "any modal open?" check. Used by keyboard nav so that arrow keys
        // gracefully skip when the user is reading any overlay (sources panel, splash if still
        // present, future citation lightbox or share dialog). Add new modal selectors here as
        // they're introduced.
        const sourcesOpen = !document.getElementById('sourcesPanel')?.hasAttribute('hidden');
        const splashOpen = !!document.getElementById('splash');
        return sourcesOpen || splashOpen;
    }

    function setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            if (isAnyModalOpen()) return;
            e.preventDefault();
            scrollToNextCard(e.key === 'ArrowDown' ? 1 : -1);
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
            setupRestart();

            // Initial atmospheric background
            if (state.cards && state.cards.length > 0) {
                setupAtmosphericBg(state.cards[0]);
            }

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