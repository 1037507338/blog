// ===== 资讯页面逻辑 =====
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    renderNews();
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

function renderNews(cat = 'all') {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    const filtered = cat === 'all' ? NEWS : NEWS.filter(n => n.tag === cat);
    if (!filtered.length) {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px">暂无该分类资讯</p>';
        return;
    }
    grid.innerHTML = filtered.map((n, i) => `
        <div class="news-card" style="animation-delay:${i * 80}ms">
            <div class="news-header">
                <span class="news-tag" style="background:${n.tagColor}">${n.tag}</span>
                <span class="news-date">${n.date}</span>
            </div>
            <h3 class="news-title">${n.title}</h3>
            <p class="news-preview">${n.preview}</p>
            <span class="news-read-more">阅读全文 →</span>
        </div>
    `).join('');
}

function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderNews(btn.dataset.cat);
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
