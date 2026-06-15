// ===================================
// Citation Toast
// ===================================

export function setupCitationToast() {
    const toast = document.createElement('div');
    toast.className = 'citation-toast';
    document.body.appendChild(toast);
    
    let toastTimeout;
    
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