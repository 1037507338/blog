// ===== POE2 导航站 JS v4 =====
// 数据从 data/links.json 加载，支持 localStorage 覆盖
// 管理后台: admin.html

let allLinks = [];
const DATA_URL = 'data/links.json';
const STORAGE_KEY = 'poe2_links';

// ===== 从 JSON 或 localStorage 加载数据 =====
async function loadLinks() {
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) return;

  try {
    // 优先使用 localStorage 中的数据（管理员编辑后保存的）
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { allLinks = JSON.parse(stored); } catch(e) {}
    }

    if (!allLinks || !allLinks.length) {
      const resp = await fetch(DATA_URL);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      allLinks = await resp.json();
    }
    
    render(allLinks);
  } catch (e) {
    console.error('加载链接失败:', e);
    navContainer.innerHTML = '<div class="error-message"><p>😢 加载链接失败</p><button onclick="loadLinks()">重试</button></div>';
  }
}

// ===== 渲染链接 =====
function render(list) {
  const wrap = document.getElementById('nav-container');
  if (!wrap) return;

  const group = {};
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const cat = item.category || '未分类';
    if (!group[cat]) group[cat] = [];
    group[cat].push(item);
  }

  const sections = [];
  for (const category in group) {
    const links = group[category];
    sections.push('<section><h2>', escapeHtml(category), '</h2><ul>');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      sections.push(
        '<li data-url="', link.url, '" data-index="', list.indexOf(link), '">',
        '<a href="', link.url, '" target="_blank" rel="noopener" class="card-title">',
        '<div class="favicon-container"><img class="favicon" src="" alt=""></div>',
        '<span class="link-text">', escapeHtml(link.title), '</span>',
        '</a>',
        '<div class="url">', escapeHtml(link.desc), '</div>',
        '</li>'
      );
    }
    sections.push('</ul></section>');
  }
  wrap.innerHTML = sections.join('');

  wrap.addEventListener('click', handleCardClick);
  loadFavicons(list);
}

function handleCardClick(e) {
  const card = e.target.closest('li[data-url]');
  if (!card) return;
  if (e.target.closest('a')) { e.preventDefault(); e.stopPropagation(); }
  window.open(card.dataset.url, '_blank');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== 搜索 =====
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const searchResultsCount = document.getElementById('search-results-count');
  if (!searchInput) return;

  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const inputValue = searchInput.value;
    if (inputValue.length > 0) searchClear.classList.add('visible');
    else searchClear.classList.remove('visible');

    searchTimeout = setTimeout(() => {
      const query = inputValue.trim().toLowerCase();
      if (query === '') { render(allLinks); searchResultsCount.classList.remove('visible'); return; }
      const filtered = allLinks.filter(link =>
        (link.title||'').toLowerCase().includes(query) ||
        (link.desc||'').toLowerCase().includes(query) ||
        (link.url||'').toLowerCase().includes(query) ||
        (link.category||'').toLowerCase().includes(query)
      );
      render(filtered);
      searchResultsCount.textContent = `找到 ${filtered.length} 个结果`;
      searchResultsCount.classList.add('visible');
    }, 50);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    render(allLinks);
    searchResultsCount.classList.remove('visible');
    searchClear.classList.remove('visible');
  });
}

// ===== Favicon =====
function loadFavicons(links) {
  setTimeout(() => {
    document.querySelectorAll('.card-title[href]').forEach(el => {
      const url = el.getAttribute('href');
      const img = el.querySelector('.favicon');
      if (url && img) {
        const domain = extractDomain(url);
        if (domain) tryLoadFavicon(img, domain);
      }
    });
  }, 100);
}
function tryLoadFavicon(faviconImg, domain) {
  const url = `https://favicon.yandex.net/favicon/${domain}`;
  const img = new Image();
  img.onload = function() {
    if (img.naturalWidth === 1 && img.naturalHeight === 1) showEmojiIcon(faviconImg);
    else { faviconImg.src = url; faviconImg.classList.add('loaded'); }
  };
  img.onerror = function() { showEmojiIcon(faviconImg); };
  img.src = url;
}
function showEmojiIcon(faviconImg) {
  const c = document.createElement('canvas'); c.width=16; c.height=16;
  const ctx = c.getContext('2d'); ctx.font='12px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('🌐',8,8); faviconImg.src=c.toDataURL(); faviconImg.classList.add('loaded');
}
function extractDomain(url) {
  try { return new URL(url.startsWith('http')?url:'https://'+url).hostname; }
  catch(e) { const m=url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/?#]+)/); return m?m[1]:null; }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  // 主题
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.body.setAttribute('data-theme', savedTheme);
  else document.body.setAttribute('data-theme',
    matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // 主题切换（SVG图标切换）
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sun = themeToggleBtn?.querySelector('.theme-sun');
  const moon = themeToggleBtn?.querySelector('.theme-moon');
  function updateThemeIcon(t) {
    if(sun)sun.style.display=t==='dark'?'none':'block';
    if(moon)moon.style.display=t==='dark'?'block':'none';
  }
  updateThemeIcon(document.body.getAttribute('data-theme'));
  if(themeToggleBtn){
    themeToggleBtn.onclick=()=>{
      const cur=document.body.getAttribute('data-theme')==='dark'?'light':'dark';
      document.body.setAttribute('data-theme',cur);
      localStorage.setItem('theme',cur);
      updateThemeIcon(cur);
    };
  }

  // 返回顶部
  const btt=document.getElementById('back-to-top');
  if(btt){btt.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
  window.addEventListener('scroll',()=>btt.classList.toggle('visible',scrollY>300))}

  // 导航栏移动端
  const nt=document.getElementById('navToggle'),nl=document.querySelector('.site-nav-links');
  if(nt&&nl){nt.onclick=()=>{nl.classList.toggle('open');nt.classList.toggle('active')};
  nl.querySelectorAll('.site-nav-link').forEach(a=>a.onclick=()=>{nl.classList.remove('open');nt.classList.remove('active')}))

  // 高亮当前页
  const path=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.site-nav-link').forEach(a=>{
    if(a.getAttribute('href')===path)a.classList.add('active')
  });

  // 加载数据 + 搜索
  loadLinks();
  setupSearch();
});