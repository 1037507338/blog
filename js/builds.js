// ===== BD页面逻辑 =====
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    renderBuilds('all');
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

function renderBuilds(filter) {
    const grid = document.getElementById('buildGrid');
    if (!grid) return;
    const filtered = filter === 'all' ? BUILDS : BUILDS.filter(b => b.tag === filter);
    grid.innerHTML = filtered.map((b, i) => `
        <div class="build-card" style="animation-delay:${i * 60}ms">
            <div class="build-card-header">
                <span class="build-tier ${b.tier.replace('T', 'tier')}">${b.tier}</span>
                <span class="build-class">${b.class} <span class="en">${b.classEn}</span></span>
            </div>
            <h3 class="build-name">${b.name}</h3>
            <p class="build-desc">${b.description}</p>
            <div class="build-tags">
                ${b.tags.map(t => `<span class="build-tag">${t}</span>`).join('')}
            </div>
            <div class="build-meta">
                <span>💰 ${b.cost}</span>
                <span>📊 ${b.difficulty}</span>
                <span>📅 ${b.updateDate}</span>
            </div>
        </div>
    `).join('');
}

function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderBuilds(btn.dataset.filter);
        });
    });
    const classFilter = document.getElementById('classFilter');
    if (classFilter) {
        classFilter.addEventListener('change', () => {
            const tier = [...document.querySelectorAll('.filter-btn.active')].find(b => b.dataset.filter)?.dataset.filter || 'all';
            const cls = classFilter.value;
            renderFilteredBuilds(tier, cls);
        });
    }
}

function renderFilteredBuilds(tier, cls) {
    const grid = document.getElementById('buildGrid');
    if (!grid) return;
    let filtered = BUILDS;
    if (tier !== 'all') filtered = filtered.filter(b => b.tag === tier);
    if (cls !== 'all') filtered = filtered.filter(b => b.class === cls);
    grid.innerHTML = filtered.map((b, i) => `
        <div class="build-card" style="animation-delay:${i * 60}ms">
            <div class="build-card-header">
                <span class="build-tier ${b.tier.replace('T', 'tier')}">${b.tier}</span>
                <span class="build-class">${b.class} <span class="en">${b.classEn}</span></span>
            </div>
            <h3 class="build-name">${b.name}</h3>
            <p class="build-desc">${b.description}</p>
            <div class="build-tags">
                ${b.tags.map(t => `<span class="build-tag">${t}</span>`).join('')}
            </div>
            <div class="build-meta">
                <span>💰 ${b.cost}</span>
                <span>📊 ${b.difficulty}</span>
                <span>📅 ${b.updateDate}</span>
            </div>
        </div>
    `).join('');
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
