// 子页面共用：主题切换 / 移动端导航 / 返回顶部 / 高亮当前页
// 用法：在 <body> 末尾 <script src="js/common.js" defer></script>
(function(){
  function init(){
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

    // ---- 高亮当前页面 ----
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".site-nav-link").forEach(a => {
      if (a.getAttribute("href") === path) a.classList.add("active");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
