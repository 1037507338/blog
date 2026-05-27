// ===== 地图页面逻辑 =====
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    renderMaps();
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

function renderMaps(tier = 'all') {
    const list = document.getElementById('mapList');
    if (!list) return;
    const filtered = tier === 'all' ? MAPS : MAPS.filter(m => String(m.tier) === String(tier));
    if (!filtered.length) {
        list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px">该难度暂无数据</p>';
        return;
    }
    list.innerHTML = filtered.map((m, i) => `
        <div class="map-item" style="animation-delay:${i * 30}ms">
            <div class="map-info">
                <span class="map-tier">T${m.tier}</span>
                <span class="map-name">${m.cnName || m.name}</span>
            </div>
            <span class="map-boss">⚔️ ${m.boss}</span>
            <span class="map-diff">${m.difficulty}</span>
        </div>
    `).join('');
}

function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMaps(btn.dataset.tier);
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
