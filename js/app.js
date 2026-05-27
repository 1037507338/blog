/**
 * POE2 国服攻略站 - 主逻辑
 */
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initHero();
    renderBuilds();
    renderGuides();
    renderMaps();
    renderTools();
    renderNews();
    initSearch();
    initBackToTop();
});

// ===== 导航 =====
function initNavbar() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.classList.toggle('active');
    });
    // 点击链接关闭菜单
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.classList.remove('active');
        });
    });
    // 滚动高亮
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 100;
            if (pageYOffset >= top) current = sec.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) link.classList.add('active');
        });
    });
}

// ===== 英雄区统计数字动画 =====
function initHero() {
    animateCounter('statBuilds', SITE_STATS.builds);
    animateCounter('statItems', SITE_STATS.items);
    animateCounter('statGuides', SITE_STATS.guides);
    animateCounter('statUpdates', SITE_STATS.updates);
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    const duration = 2000;
    const start = performance.now();
    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target.toLocaleString() + '+';
    }
    requestAnimationFrame(update);
}

// ===== BD渲染 =====
function renderBuilds(filter = 'all') {
    const grid = document.getElementById('buildGrid');
    const filtered = filter === 'all' ? BUILDS : BUILDS.filter(b => b.tag === filter);
    grid.innerHTML = filtered.map(b => `
        <div class="build-card" data-tag="${b.tag}">
            <div class="build-card-header">
                <span class="build-tier ${b.tier.replace('T', 'tier')}">${b.tier}</span>
                <span class="build-class">${b.class}</span>
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

// BD Tab切换
document.getElementById('buildTabs')?.addEventListener('click', e => {
    if (!e.target.classList.contains('tab')) return;
    document.querySelectorAll('#buildTabs .tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    renderBuilds(e.target.dataset.tab);
});

// ===== 新手指南渲染 =====
function renderGuides() {
    const grid = document.getElementById('guideGrid');
    grid.innerHTML = GUIDES.map(g => `
        <a href="#" class="guide-card">
            <div class="guide-icon">${g.icon}</div>
            <div class="guide-info">
                <span class="guide-category">${g.category}</span>
                <h3 class="guide-title">${g.title}</h3>
                <p class="guide-desc">${g.description}</p>
                <div class="guide-meta">
                    <span>${g.date}</span>
                    <span>${g.views.toLocaleString()} 阅读</span>
                </div>
            </div>
        </a>
    `).join('');
}

// ===== 地图渲染 =====
function renderMaps() {
    const list = document.getElementById('mapList');
    list.innerHTML = MAPS.map(m => `
        <a href="#" class="map-item">
            <div class="map-info">
                <span class="map-tier">T${m.tier}</span>
                <span class="map-name">${m.name}</span>
            </div>
            <span class="map-boss">${m.boss}</span>
            <span class="map-diff">${m.difficulty}</span>
        </a>
    `).join('');
}

// ===== 工具渲染 =====
function renderTools() {
    const grid = document.getElementById('toolsGrid');
    grid.innerHTML = TOOLS.map(t => `
        <a href="${t.url}" class="tool-card ${t.status === '开发中' ? 'tool-coming' : ''}">
            <div class="tool-icon">${t.icon}</div>
            <h3 class="tool-name">${t.name}</h3>
            <p class="tool-desc">${t.desc}</p>
            <span class="tool-status ${t.status === '可用' ? 'status-ready' : 'status-dev'}">${t.status}</span>
        </a>
    `).join('');
}

// ===== 资讯渲染 =====
function renderNews() {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = NEWS.map(n => `
        <a href="#" class="news-card">
            <div class="news-header">
                <span class="news-tag" style="background:${n.tagColor}">${n.tag}</span>
                <span class="news-date">${n.date}</span>
            </div>
            <h3 class="news-title">${n.title}</h3>
            <p class="news-preview">${n.preview}</p>
            <span class="news-read-more">阅读全文 →</span>
        </a>
    `).join('');
}

// ===== 搜索 =====
function initSearch() {
    const btn = document.getElementById('searchBtn');
    const dropdown = document.getElementById('searchDropdown');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');

    btn.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
        if (dropdown.classList.contains('open')) input.focus();
    });

    document.addEventListener('click', e => {
        if (!dropdown.contains(e.target) && e.target !== btn) {
            dropdown.classList.remove('open');
        }
    });

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (!q) { results.innerHTML = ''; return; }
        const matched = SEARCH_INDEX.filter(item =>
            item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
        ).slice(0, 6);
        results.innerHTML = matched.length ? matched.map(item => `
            <a href="${item.url}" class="search-result-item">
                <span class="search-result-type">${item.type}</span>
                <div>
                    <div class="search-result-title">${highlight(item.title, q)}</div>
                    <div class="search-result-desc">${highlight(item.desc, q)}</div>
                </div>
            </a>
        `).join('') : '<div class="search-empty">未找到相关结果</div>';
    });
}

function highlight(text, q) {
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + q.length) + '</mark>' + text.slice(idx + q.length);
}

// ===== 返回顶部 =====
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', pageYOffset > 400);
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}