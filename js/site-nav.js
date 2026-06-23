// 全站共享导航组件 —— 单一来源
// 用法：页面 <body> 内放 <div id="site-nav"></div>，页尾 <script src="js/site-nav.js" defer></script>
// 注入：顶部导航栏 + 悬浮主题切换按钮 + 返回顶部按钮，并初始化交互
(function () {
  // 导航链接清单（单一来源；改导航只动这里）
  var LINKS = [
    { href: 'index.html',    text: '首页' },
    { href: 'builds.html',   text: 'BD推荐' },
    { href: 'economy.html',  text: '大盘行情' },
    { href: 'maps.html',     text: '剧情攻略' },
    { href: 'advanced.html', text: '进阶攻略' },
    { href: 'news.html',     text: '资讯动态' },
    { href: 'prices.html',   text: '物价参考' },
    { href: 'admin.html',    text: '管理', style: 'opacity:0.45;font-size:.82rem' },
  ];

  var SUN = '<svg class="theme-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
  var MOON = '<svg class="theme-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

  function currentPage() {
    return location.pathname.split('/').pop() || 'index.html';
  }

  function navHtml() {
    var links = LINKS.map(function (l) {
      var st = l.style ? ' style="' + l.style + '"' : '';
      return '<a href="' + l.href + '" class="site-nav-link"' + st + '>' + l.text + '</a>';
    }).join('\n      ');
    return '' +
      '<nav class="site-nav">\n' +
      '  <div class="site-nav-inner">\n' +
      '    <a href="index.html" class="site-nav-logo"><span class="logo-icon">⚔</span> POE2 Hub</a>\n' +
      '    <div class="site-nav-links">\n      ' + links + '\n    </div>\n' +
      '    <button id="navToggle" class="site-nav-toggle" aria-label="菜单"><span></span><span></span><span></span></button>\n' +
      '  </div>\n' +
      '</nav>\n' +
      '<button id="theme-toggle" aria-label="切换深浅色模式">' + SUN + MOON + '</button>\n' +
      '<button id="back-to-top" aria-label="返回顶部">👆</button>';
  }

  // 按当前页高亮导航项；供路由切页后复用
  function highlight(page) {
    page = page || currentPage();
    document.querySelectorAll('.site-nav-link').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === page);
    });
  }

  function updateThemeIcon(t) {
    var sun = document.querySelector('#theme-toggle .theme-sun');
    var moon = document.querySelector('#theme-toggle .theme-moon');
    if (sun) sun.style.display = t === 'dark' ? 'none' : 'block';
    if (moon) moon.style.display = t === 'dark' ? 'block' : 'none';
  }

  function initInteractions() {
    // 主题
    var saved = localStorage.getItem('theme');
    var theme = saved || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
    document.body.setAttribute('data-theme', theme);
    updateThemeIcon(theme);

    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var cur = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', cur);
        localStorage.setItem('theme', cur);
        updateThemeIcon(cur);
      });
    }

    // 返回顶部
    var btt = document.getElementById('back-to-top');
    if (btt) {
      btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
      window.addEventListener('scroll', function () { btt.classList.toggle('visible', scrollY > 300); });
    }

    // 移动端菜单
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.querySelector('.site-nav-links');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
        navToggle.classList.toggle('active');
      });
      navLinks.querySelectorAll('.site-nav-link').forEach(function (a) {
        a.addEventListener('click', function () {
          navLinks.classList.remove('open');
          navToggle.classList.remove('active');
        });
      });
    }

    highlight();
  }

  function mount() {
    var slot = document.getElementById('site-nav');
    // 占位存在则注入；若已注入过（SPA 切页）则跳过
    if (slot && !slot.dataset.mounted) {
      slot.innerHTML = navHtml();
      slot.dataset.mounted = '1';
      initInteractions();
    }
  }

  window.SiteNav = { highlight: highlight, mount: mount };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
