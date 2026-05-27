// ===== 职业页面逻辑 =====
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    renderClasses();
    initFilters();
    initBackToTop();
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

function renderClasses(filter = 'all') {
    const grid = document.getElementById('classGrid');
    if (!grid) return;
    const filtered = filter === 'all' ? CLASSES : CLASSES.filter(c => c.attrType === filter);
    grid.innerHTML = filtered.map((c, i) => `
        <div class="class-card" style="animation-delay:${i * 60}ms">
            <div class="class-header">
                <div class="class-attr-icon">${c.attrIcon}</div>
                <div class="class-meta">
                    <span class="class-attrs">${c.attrs}</span>
                    <span class="class-weapon">${c.weapon}</span>
                </div>
            </div>
            <h3 class="class-name">${c.name} <span class="class-en">${c.enName}</span></h3>
            <p class="class-desc">${c.desc}</p>
            <div class="class-ascendancies">
                ${c.ascendancies.map(a => `
                    <div class="ascendancy-item ${a.tier === 'T0' ? 'asc-t0' : a.tier === 'T1' ? 'asc-t1' : 'asc-t2'}">
                        <span class="asc-name">${a.name}</span>
                        <span class="asc-desc">${a.desc}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderClasses(btn.dataset.filter);
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
