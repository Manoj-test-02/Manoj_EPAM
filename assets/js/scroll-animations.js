// Scroll-triggered animation logic
function revealOnScroll() {
    const reveals = document.querySelectorAll('.fade-in, .slide-up, .slide-left, .hero-title');
    const windowHeight = window.innerHeight;
    const revealPoint = 120;
    reveals.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - revealPoint) {
            el.style.animationPlayState = 'running';
            el.style.opacity = 1;
        }
    });

    // Gradient text reveal for welcome paragraph
    const grad = document.querySelector('.gradient-reveal');
    if (grad) {
        const gradTop = grad.getBoundingClientRect().top;
        const gradHeight = grad.offsetHeight;
        let visible = 0;
        if (gradTop < windowHeight && gradTop + gradHeight > 0) {
            // Calculate how much of the element is visible
            const visiblePx = Math.min(windowHeight, gradTop + gradHeight) - Math.max(0, gradTop);
            visible = Math.max(0, Math.min(1, visiblePx / gradHeight));
        }
        if (visible > 0.5) {
            grad.classList.add('visible');
        } else {
            grad.classList.remove('visible');
        }
        grad.style.opacity = 0.3 + visible * 0.7;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Set all animated elements to paused initially
    document.querySelectorAll('.fade-in, .slide-up, .slide-left, .hero-title').forEach(el => {
        el.style.animationPlayState = 'paused';
        el.style.opacity = 0;
    });
    // Only show hero title at first
    document.querySelector('.hero-title').style.animationPlayState = 'running';
    document.querySelector('.hero-title').style.opacity = 1;
    revealOnScroll();
});

window.addEventListener('scroll', revealOnScroll);
