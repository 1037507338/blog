// 子页面共用：导航注入 / 主题切换 / 移动端导航 / 返回顶部 / 高亮当前页
// 用法：在 <head> 中同步加载 <script src="js/common.js"></script>
(function(){
  // ---- 导航栏 HTML 模板 ----
  const NAV_HTML = `
<nav class="site-nav">
  <div class="site-nav-inner">
    <a href="index.html" class="site-nav-logo"><span class="logo-icon">⚔</span> POE2 Hub</a>
    <div class="site-nav-links">
      <a href="index.html" class="site-nav-link">首页</a>
      <a href="builds.html" class="site-nav-link">BD推荐</a>
      <a href="economy.html" class="site-nav-link">大盘行情</a>
      <a href="maps.html" class="site-nav-link">剧情攻略</a>
      <a href="advanced.html" class="site-nav-link">进阶攻略</a>
      <a href="news.html" class="site-nav-link">资讯动态</a>
      <a href="prices.html" class="site-nav-link">物价参考</a>
    </div>
    <button id="navToggle" class="site-nav-toggle" aria-label="菜单"><span></span><span></span><span></span></button>
  </div>
</nav>
<button id="theme-toggle" aria-label="切换深浅色模式"><svg class="theme-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg><svg class="theme-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></button>
<button id="back-to-top" aria-label="返回顶部">👆</button>`;

  // ---- 注入导航 ----
  function injectNav() {
    const mount = document.getElementById('site-nav-mount');
    if (mount) {
      mount.outerHTML = NAV_HTML;
    } else {
      // 如果找不到占位符，在 body 开头插入
      document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
    }
    
    // 高亮当前页面
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav-link').forEach(a => {
      if (a.getAttribute('href') === path) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  function init(){
    // ---- 注入导航 ----
    injectNav();

    // ---- 主题 ----
    const saved = localStorage.getItem("theme");
    const theme = saved || (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
    document.body.setAttribute("data-theme", theme);

    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const cur = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", cur);
        localStorage.setItem("theme", cur);
      });
    }

    // ---- 返回顶部 ----
    const btt = document.getElementById("back-to-top");
    if (btt) {
      btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
      window.addEventListener("scroll", () => btt.classList.toggle("visible", scrollY > 300));
    }

    // ---- 移动端菜单 ----
    const navToggle = document.getElementById("navToggle");
    const navLinks  = document.querySelector(".site-nav-links");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
        navToggle.classList.toggle("active");
      });
      navLinks.querySelectorAll(".site-nav-link").forEach(a =>
        a.addEventListener("click", () => {
          navLinks.classList.remove("open");
          navToggle.classList.remove("active");
        })
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
