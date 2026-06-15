// ===================================
// Counter Animation
// ===================================
import { state, formatNumber, getStatusClass } from './init.js';

let animationFrame = null;
let animationStart = null;
let animationDuration = 800; // ms

export function setupCounter() {
    // Counter is initialized by init.js
}

export function animateCounter(targetYear, targetPop, targetLabel, targetStatus) {
    const $pop = document.getElementById('counterValue');
    const $year = document.getElementById('counterYear');
    const $status = document.getElementById('counterStatus');
    
    if (!$pop || !$year || !$status) return;
    
    // Cancel any ongoing animation
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
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
            // Animation complete - set final state
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

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}