// ===== POE2 导航站 JS v5 - Supabase 版本 =====
// 数据通过 Vercel Serverless API: /api/links

let allLinks = [];
const API_URL = '/api/links';

// ===== 从 API 加载数据 =====
async function loadLinks() {
  console.log('[loadLinks] 开始加载...');
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) {
    console.error('[loadLinks] 找不到 nav-container!');
    return;
  }

  try {
    console.log('[loadLinks] fetch:', API_URL);
    const resp = await fetch(API_URL);
    console.log('[loadLinks] response status:', resp.status);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    allLinks = await resp.json();
    console.log('[loadLinks] 获取到', allLinks.length, '条数据');
    // 只保留首页导航数据
    allLinks = allLinks.filter(l => l.page_type === '首页导航');
    console.log('[loadLinks] 首页导航过滤后剩余', allLinks.length, '条');
    render(allLinks);
  } catch (e) {
    console.error('[loadLinks] 加载失败:', e);
    navContainer.innerHTML = '<div class="error-message"><p>😢 加载链接失败: ' + e.message + '</p><button onclick="loadLinks()">重试</button></div>';
  }
}

// ===== 渲染链接 =====
function render(list) {
  const wrap = document.getElementById('nav-container');
  if (!wrap) return;

  const group = {};
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const cats = item.categories;
    const cat = (Array.isArray(cats) && cats.length) ? cats[0] : (item.category || '未分类');
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
        '<li data-url="', link.url, '" data-id="', link.id, '">',
        '<a href="', link.url, '" target="_blank" rel="noopener" class="card-title">',
        '<div class="favicon-container"><img class="favicon" src="" alt=""></div>',
        '<span class="link-text">', escapeHtml(link.title), '</span>',
        '</a>',
        '<div class="url">', escapeHtml(link.description || ''), '</div>',
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
        (link.description||'').toLowerCase().includes(query) ||
        (link.url||'').toLowerCase().includes(query) ||
        (link.category||'').toLowerCase().includes(query) ||
        ((Array.isArray(link.categories) && link.categories.length && link.categories.some(c=>c.toLowerCase().includes(query))))
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
  console.log('[nav.js] DOMContentLoaded, 开始初始化...');

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
  nl.querySelectorAll('.site-nav-link').forEach(a=>a.onclick=()=>{nl.classList.remove('open');nt.classList.remove('active')});}

  // 高亮当前页
  const path=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.site-nav-link').forEach(a=>{
    if(a.getAttribute('href')===path)a.classList.add('active')
  });

  // 加载数据 + 搜索
  console.log('[nav.js] 调用 loadLinks()...');
  loadLinks();
  setupSearch();
});