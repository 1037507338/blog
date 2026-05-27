// ===== 攻略页面逻辑 =====
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initBackToTop();
    initTOC();
});

function initNavbar() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.classList.toggle('active');
    });
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.classList.remove('active');
        });
    });
}

function initTOC() {
    const tocItems = document.querySelectorAll('.toc-item');
    if (!tocItems.length) return;
    tocItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(item.getAttribute('href'));
            if (target) {
                const top = target.getBoundingClientRect().top + pageYOffset - 90;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.guide-section');
        let current = '';
        sections.forEach(sec => {
            const top = sec.getBoundingClientRect().top + pageYOffset - 120;
            if (pageYOffset >= top) current = sec.id;
        });
        tocItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + current) {
                item.classList.add('active');
            }
        });
    });
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', pageYOffset > 300);
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
