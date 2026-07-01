// 全站共享导航组件 —— 单一来源
// 用法：页面 <body> 内放 <div id="site-nav"></div>，页尾 <script src="js/site-nav.js" defer></script>
// 注入：顶部导航栏 + 悬浮主题切换按钮 + 返回顶部按钮，并初始化交互
(function () {
  // 导航链接清单（单一来源；改导航只动这里）
  var LINKS = [
    { href: 'index.html',    text: '首页' },
    { href: 'builds.html',   text: 'BD推荐' },
    { href: 'economy.html',  text: '大盘行情' },
    { href: 'maps.html',        text: '剧情攻略' },
    { href: 'advanced.html',  text: '进阶攻略' },
    { href: 'expedition.html', text: '异界攻略' },
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
      '    <div id="nav-account" class="nav-account"></div>\n' +
      '    <button id="navToggle" class="site-nav-toggle" aria-label="菜单"><span></span><span></span><span></span></button>\n' +
      '  </div>\n' +
      '</nav>\n' +
      '<button id="theme-toggle" aria-label="切换深浅色模式">' + SUN + MOON + '</button>\n' +
      '<button id="back-to-top" aria-label="返回顶部">👆</button>' +
      authModalHtml();
  }

  // 登录/注册弹窗（纯原生，无新依赖）
  function authModalHtml() {
    return '' +
      '<div id="auth-modal" class="auth-modal" hidden>' +
      '  <div class="auth-mask"></div>' +
      '  <div class="auth-dialog" role="dialog" aria-modal="true">' +
      '    <button class="auth-close" type="button" aria-label="关闭">&times;</button>' +
      '    <div class="auth-tabs">' +
      '      <button type="button" class="auth-tab active" data-mode="signin">登录</button>' +
      '      <button type="button" class="auth-tab" data-mode="signup">注册</button>' +
      '    </div>' +
      '    <form class="auth-form">' +
      '      <input id="auth-email" type="email" autocomplete="email" placeholder="邮箱" required>' +
      '      <input id="auth-password" type="password" autocomplete="current-password" placeholder="密码（至少 6 位）" minlength="6" required>' +
      '      <div id="auth-msg" class="auth-msg"></div>' +
      '      <button type="submit" class="auth-submit">登录</button>' +
      '    </form>' +
      '    <div class="auth-confirm" hidden>' +
      '      <div class="auth-confirm-icon">✉️</div>' +
      '      <h3 class="auth-confirm-title">验证邮件已发送</h3>' +
      '      <p class="auth-confirm-text">我们已向 <b id="auth-confirm-email"></b> 发送了一封验证邮件。<br>请点击邮件中的链接完成验证，然后回到这里登录。</p>' +
      '      <p class="auth-confirm-hint">没收到？请检查垃圾邮件，或稍等片刻。</p>' +
      '      <button type="button" class="auth-submit auth-confirm-back">去登录</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';
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

  // ===== 账号区（登录入口 / 已登录显示）=====
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }

  function renderAccount(user) {
    var box = document.getElementById('nav-account');
    if (!box) return;
    if (user && user.email) {
      var short = user.email.length > 18 ? user.email.slice(0, 16) + '…' : user.email;
      box.innerHTML =
        '<span class="nav-user" title="' + esc(user.email) + '">' + esc(short) + '</span>' +
        '<button id="nav-logout" class="nav-auth-btn" type="button">退出</button>';
      var lo = document.getElementById('nav-logout');
      if (lo) lo.addEventListener('click', function () { if (window.Auth) Auth.signOut(); });
    } else {
      box.innerHTML = '<button id="nav-login" class="nav-auth-btn" type="button">登录</button>';
      var li = document.getElementById('nav-login');
      if (li) li.addEventListener('click', openAuthModal);
    }
  }

  function setAuthMode(mode) {
    var modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.querySelectorAll('.auth-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.mode === mode);
    });
    var submit = modal.querySelector('.auth-submit');
    var pwd = modal.querySelector('#auth-password');
    if (submit) submit.textContent = mode === 'signup' ? '注册' : '登录';
    if (pwd) pwd.setAttribute('autocomplete', mode === 'signup' ? 'new-password' : 'current-password');
    modal.dataset.mode = mode;
    setAuthMsg('');
  }

  function setAuthMsg(text, ok) {
    var el = document.getElementById('auth-msg');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'auth-msg' + (text ? (ok ? ' ok' : ' err') : '');
  }

  // 注册成功 → 展示「去邮箱验证」提示视图（隐藏表单与切换 tab）
  function showConfirmSent(email) {
    var modal = document.getElementById('auth-modal');
    if (!modal) return;
    var form = modal.querySelector('.auth-form');
    var tabs = modal.querySelector('.auth-tabs');
    var confirm = modal.querySelector('.auth-confirm');
    var emailEl = document.getElementById('auth-confirm-email');
    if (emailEl) emailEl.textContent = email;
    if (form) form.hidden = true;
    if (tabs) tabs.hidden = true;
    if (confirm) confirm.hidden = false;
  }

  // 恢复表单视图（登录/注册）
  function showAuthForm() {
    var modal = document.getElementById('auth-modal');
    if (!modal) return;
    var form = modal.querySelector('.auth-form');
    var tabs = modal.querySelector('.auth-tabs');
    var confirm = modal.querySelector('.auth-confirm');
    if (form) form.hidden = false;
    if (tabs) tabs.hidden = false;
    if (confirm) confirm.hidden = true;
  }

  function openAuthModal() {
    var modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.hidden = false;
    showAuthForm();
    setAuthMode('signin');
    var pwd = document.getElementById('auth-password');
    if (pwd) pwd.value = '';
    var email = document.getElementById('auth-email');
    if (email) setTimeout(function () { email.focus(); }, 30);
  }

  function closeAuthModal() {
    var modal = document.getElementById('auth-modal');
    if (modal) modal.hidden = true;
  }

  function initAuthUI() {
    // 页面可通过 <div id="site-nav" data-no-auth> 关闭登录入口
    var slot = document.getElementById('site-nav');
    if (slot && slot.hasAttribute('data-no-auth')) {
      var acct = document.getElementById('nav-account');
      if (acct) acct.remove();
      var m = document.getElementById('auth-modal');
      if (m) m.remove();
      return;
    }
    var modal = document.getElementById('auth-modal');
    if (modal && !modal.dataset.wired) {
      modal.dataset.wired = '1';
      modal.querySelector('.auth-mask').addEventListener('click', closeAuthModal);
      modal.querySelector('.auth-close').addEventListener('click', closeAuthModal);
      modal.querySelectorAll('.auth-tab').forEach(function (t) {
        t.addEventListener('click', function () { setAuthMode(t.dataset.mode); });
      });
      modal.querySelector('.auth-form').addEventListener('submit', function (e) {
        e.preventDefault();
        submitAuth();
      });
      var back = modal.querySelector('.auth-confirm-back');
      if (back) back.addEventListener('click', function () { showAuthForm(); setAuthMode('signin'); });
    }
    // 登录态驱动账号区
    if (window.Auth && Auth.onChange) {
      Auth.onChange(renderAccount);
    } else {
      renderAccount(null);
    }
  }

  async function submitAuth() {
    if (!window.Auth) { setAuthMsg('登录服务不可用'); return; }
    var modal = document.getElementById('auth-modal');
    var mode = (modal && modal.dataset.mode) || 'signin';
    var email = (document.getElementById('auth-email').value || '').trim();
    var pwd = document.getElementById('auth-password').value || '';
    if (!email || pwd.length < 6) { setAuthMsg('请输入邮箱和至少 6 位密码'); return; }
    var submit = modal.querySelector('.auth-submit');
    submit.disabled = true;
    setAuthMsg(mode === 'signup' ? '注册中…' : '登录中…', true);
    try {
      var res = mode === 'signup' ? await Auth.signUp(email, pwd) : await Auth.signIn(email, pwd);
      if (res && res.error) { setAuthMsg(res.error); return; }
      if (res && res.needConfirm) { showConfirmSent(email); return; }
      setAuthMsg('登录成功', true);
      closeAuthModal();
    } catch (err) {
      setAuthMsg(err && err.message ? err.message : '操作失败');
    } finally {
      submit.disabled = false;
    }
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
    initAuthUI();
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
