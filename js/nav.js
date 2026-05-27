// ===== POE2 导航站 JS =====
// 参照 poe2.baozangdh.com 的 nav.js 逻辑
// 去掉搜索引擎，改为站内搜索

let allLinks = [];

// ===== 链接数据（照搬宝藏导航 + 补充） =====
const LINKS_DATA = [
  // 官方相关
  { title: 'poe2 国服', desc: '国服唯一官网', url: 'https://poe2.qq.com/main.shtml', category: '官方相关' },
  { title: 'poe2 国际服', desc: '国际服唯一官网', url: 'https://pathofexile2.com', category: '官方相关' },
  { title: '国服官方论坛', desc: 'poe2官网论坛', url: 'https://poe.game.qq.com/forum', category: '官方相关' },
  { title: '国际服官方论坛', desc: 'poe2官网论坛', url: 'https://www.pathofexile.com/forum/view-category/poe2', category: '官方相关' },
  { title: 'poe2市集', desc: '装备交易网站', url: 'https://www.pathofexile.com/trade2', category: '官方相关' },
  { title: 'poe2天梯榜', desc: '官方玩家排名', url: 'https://pathofexile2.com/ladder/Standard', category: '官方相关' },
  { title: 'poe2皮肤幻化商店', desc: '皮肤幻化购买', url: 'https://pathofexile2.com/shop', category: '官方相关' },

  // poe2社区
  { title: 'poe2 NGA', desc: 'NGA论坛', url: 'https://nga.178.com/thread.php?fid=510481', category: 'poe2社区' },
  { title: 'poe2 Reddit', desc: 'Reddit论坛', url: 'https://www.reddit.com/r/pathofexile2builds', category: 'poe2社区' },
  { title: 'poe2 踩蘑菇', desc: '踩蘑菇论坛', url: 'https://www.caimogu.cc/circle/449.html', category: 'poe2社区' },
  { title: 'poe2 巴哈姆特', desc: '台湾论坛', url: 'https://forum.gamer.com.tw/B.php?bsn=82273', category: 'poe2社区' },
  { title: 'poe2 TFT', desc: '非官方交易社区', url: 'https://discord.gg/gmVxAqfRNZ', category: 'poe2社区' },
  { title: 'poe2吧', desc: '百度贴吧', url: 'https://tieba.baidu.com/f?ie=utf-8&kw=poe2&fr=search', category: 'poe2社区' },

  // 攻略站、数据库
  { title: 'poe2 编年史', desc: '流放2数据查询', url: 'https://poe2db.tw/', category: '攻略站、数据库' },
  { title: 'poe2 Wiki', desc: '流放2数据库', url: 'https://www.poe2wiki.net/wiki/Path_of_Exile_2_Wiki', category: '攻略站、数据库' },

  // BD、抄作业
  { title: 'poe2 忍者网英文版', desc: '流放2数据查询', url: 'https://poe.ninja/poe2/builds', category: 'BD、抄作业' },
  { title: 'poe2 忍者网中文版', desc: '流放2数据查询', url: 'https://poe.show/poe2/builds', category: 'BD、抄作业' },
  { title: 'poe2 暗黑盒', desc: '抄作业', url: 'https://www.d2core.com/poe2/builds', category: 'BD、抄作业' },
  { title: 'poe2 Maxroll', desc: '国外抄作业', url: 'https://maxroll.gg/poe2', category: 'BD、抄作业' },
  { title: 'poe2 Reddit BD', desc: 'Reddit论坛', url: 'https://www.reddit.com/r/pathofexile2builds', category: 'BD、抄作业' },

  // 过滤器、查价器
  { title: 'NeverSink过滤器', desc: '过滤器文件下载', url: 'https://www.pathofexile.com/account/view-profile/NeverSink-3349/item-filters', category: '过滤器、查价器' },
  { title: '一乐过滤器', desc: '过滤器文件下载', url: 'https://www.caimogu.cc/post/1619566.html', category: '过滤器、查价器' },
  { title: '文子过滤器', desc: '过滤器文件下载', url: 'https://www.caimogu.cc/post/1618851.html', category: '过滤器、查价器' },
  { title: 'NeverSink自定义过滤器', desc: '一乐自定义过滤器', url: 'https://www.filterblade.xyz/?game=Poe2', category: '过滤器、查价器' },
  { title: '一乐自定义过滤器', desc: '一乐自定义过滤器', url: 'https://edit.filtereditor.cn/#/login?redirect=/home/', category: '过滤器、查价器' },
  { title: 'PoE Overlay II', desc: '查价器', url: 'https://www.overwolf.com/app/kyusung4698-poe_overlay_ii', category: '过滤器、查价器' },
  { title: '易刷', desc: '查价器', url: 'https://www.caimogu.cc/post/1621584.html', category: '过滤器、查价器' },

  // 小工具
  { title: 'poe2 市集汉化', desc: '市集汉化', url: 'https://poe2db.tw/tw/chinese', category: '小工具' },
  { title: 'poe2 dend工具箱', desc: '支线任务检查工具、中文正则工具', url: 'https://dend.chaozj.com/', category: '小工具' },
  { title: 'poe2 正则工具', desc: '流放之路2正则工具', url: 'https://poe2re.netlify.app/', category: '小工具' },
  { title: '技能宝石', desc: '英文版', url: 'https://poe2gems.com/supports', category: '小工具' },
  { title: 'PathOfBuilding-PoE2', desc: 'poe2模拟器', url: 'https://github.com/PathOfBuildingCommunity/PathOfBuilding-PoE2', category: '小工具' },
  { title: 'PoeCharm2', desc: 'poe2模拟器的汉化器', url: 'https://github.com/Chuanhsing/PoeCharm2', category: '小工具' },
  { title: 'poe2 藏身处', desc: '藏身处分享', url: 'https://www.hideoutshowcase.com/hideouts', category: '小工具' },
  { title: 'poe2 模拟做装', desc: '藏身处分享', url: 'https://www.poe2ggg.com/CraftingSimulator/simulator.html', category: '小工具' },

  // 过滤器、查价器、市集汉化 网盘文件
  { title: '主文件分享', desc: '多渠道下载', url: 'https://pan.quark.cn/s/8f7d9608c50f', category: '过滤器、查价器、市集汉化 网盘文件' },
  { title: '文件备份', desc: '文件分享', url: 'https://pan.baidu.com/s/1N9JWtMqbFx52QxbZjd0lgw?pwd=q24f', category: '过滤器、查价器、市集汉化 网盘文件' },
];

// ===== 渲染链接 =====
function render(list) {
  const wrap = document.getElementById('nav-container');
  if (!wrap) return;

  const group = {};
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!group[item.category]) group[item.category] = [];
    group[item.category].push(item);
  }

  const sections = [];
  for (const category in group) {
    const links = group[category];
    sections.push('<section><h2>', category, '</h2><ul>');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      sections.push(
        '<li data-url="', link.url, '">',
        '<a href="', link.url, '" target="_blank" rel="noopener" class="card-title">',
        '<div class="favicon-container"><img class="favicon" src="" alt=""></div>',
        '<span class="link-text">', link.title, '</span>',
        '</a>',
        '<div class="url">', link.desc, '</div>',
        '</li>'
      );
    }
    sections.push('</ul></section>');
  }
  wrap.innerHTML = sections.join('');

  // 卡片点击
  wrap.addEventListener('click', handleCardClick);
  // 加载 favicon
  loadFavicons(list);
}

function handleCardClick(e) {
  const card = e.target.closest('li[data-url]');
  if (!card) return;
  if (e.target.closest('a')) { e.preventDefault(); e.stopPropagation(); }
  window.open(card.dataset.url, '_blank');
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
        link.title.toLowerCase().includes(query) ||
        link.desc.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        link.category.toLowerCase().includes(query)
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

// ===== Favicon 加载 =====
function loadFavicons(links) {
  setTimeout(() => {
    const linkElements = document.querySelectorAll('a[href]');
    linkElements.forEach(linkElement => {
      const url = linkElement.getAttribute('href');
      const faviconImg = linkElement.querySelector('.favicon');
      if (url && faviconImg) {
        const domain = extractDomain(url);
        if (domain) tryLoadFavicon(faviconImg, domain);
      }
    });
  }, 100);
}

function tryLoadFavicon(faviconImg, domain) {
  const faviconUrl = `https://favicon.yandex.net/favicon/${domain}`;
  const img = new Image();
  img.onload = function() {
    if (img.naturalWidth === 1 && img.naturalHeight === 1) {
      showEmojiIcon(faviconImg);
    } else {
      faviconImg.src = faviconUrl;
      faviconImg.classList.add('loaded');
    }
  };
  img.onerror = function() { showEmojiIcon(faviconImg); };
  img.src = faviconUrl;
}

function showEmojiIcon(faviconImg) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 16; canvas.height = 16;
  ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🌐', 8, 8);
  faviconImg.src = canvas.toDataURL();
  faviconImg.classList.add('loaded');
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    return urlObj.hostname;
  } catch (e) {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/?#]+)/);
    return match ? match[1] : null;
  }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  // 主题
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
  } else {
    document.body.setAttribute('data-theme',
      matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
  }

  // 主题切换（带图标切换动画）
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeSun = themeToggleBtn?.querySelector('.theme-sun');
  const themeMoon = themeToggleBtn?.querySelector('.theme-moon');
  function updateThemeIcon(theme) {
    if (themeSun && themeMoon) {
      themeSun.style.display = theme === 'dark' ? 'none' : 'block';
      themeMoon.style.display = theme === 'dark' ? 'block' : 'none';
    }
  }
  updateThemeIcon(document.body.getAttribute('data-theme'));
  if (themeToggleBtn) {
    themeToggleBtn.onclick = () => {
      const cur = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', cur);
      localStorage.setItem('theme', cur);
      updateThemeIcon(cur);
    };
  }

  // 返回顶部
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('visible', window.scrollY > 300);
    });
  }

  // 导航栏移动端切换
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.site-nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
    });
    navLinks.querySelectorAll('.site-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  // 加载数据
  allLinks = LINKS_DATA;
  render(allLinks);
  setupSearch();
});