// 站内内容级跳转（SPA Router）—— 仅替换导航栏下方内容，不重载导航
// 渐进增强：任何异常都回退为整页跳转，关闭 JS / 直链 / 刷新仍是完整页面
// 约定：
//   - 每页主内容包在 <main id="view" data-page="<name>"> 中
//   - 每页内联 <script> 用 IIFE 包裹，首屏自执行；路由切页时重新注入执行
//   - 页面专属内联 <style> 标记 data-page-style，切页时替换
(function () {
  // 这些脚本全站共享或为第三方库，切页时不重新执行（已加载即可）
  var SHARED_SCRIPT_RE = /(js\/site-nav\.js|js\/speed-insights\.js|js\/router\.js|cdn\.jsdelivr\.net)/;

  function isInternalLink(a) {
    if (!a) return false;
    var href = a.getAttribute('href');
    if (!href) return false;
    if (a.target === '_blank' || a.hasAttribute('download')) return false;
    if (/^(https?:)?\/\//.test(href)) return false;        // 外链
    if (href[0] === '#' || /^(mailto|tel):/.test(href)) return false;
    if (!/\.html(\?|#|$)/.test(href)) return false;          // 仅站内 .html
    if (/^admin\.html/.test(href)) return false;             // 后台不纳入 SPA
    return true;
  }

  // 同步 <head>：共享 <link> 样式表（缺则补，不删，累积兼容）+ 页面专属内联 <style> + <title>
  function syncHead(doc) {
    // 1) 补齐目标页需要的样式表 link（按裸 href 去重）
    var have = {};
    document.querySelectorAll('head link[rel="stylesheet"]').forEach(function (l) {
      have[(l.getAttribute('href') || '').split('?')[0]] = true;
    });
    doc.querySelectorAll('head link[rel="stylesheet"]').forEach(function (l) {
      var href = l.getAttribute('href');
      if (!href) return;
      if (have[href.split('?')[0]]) return;
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
    // 2) 替换页面专属内联 <style>
    document.querySelectorAll('style[data-page-style]').forEach(function (s) { s.remove(); });
    doc.querySelectorAll('head style[data-page-style]').forEach(function (s) {
      var clone = document.createElement('style');
      clone.setAttribute('data-page-style', '1');
      clone.textContent = s.textContent;
      document.head.appendChild(clone);
    });
    if (doc.title) document.title = doc.title;
  }

  // 重新注入并执行 #view 之后（body 末尾）的内联脚本
  function runScripts(doc) {
    var scripts = doc.querySelectorAll('body script');
    scripts.forEach(function (old) {
      var src = old.getAttribute('src');
      if (src) { if (!SHARED_SCRIPT_RE.test(src)) injectExternal(src); return; }
      // 内联脚本：重新创建以触发执行（innerHTML 不会执行 <script>）
      var s = document.createElement('script');
      s.textContent = old.textContent;
      document.body.appendChild(s);
      s.remove(); // 执行后即可移除，避免 DOM 堆积
    });
  }

  function injectExternal(src) {
    // 已加载过则跳过（按裸 src 去重，忽略 query）
    var base = src.split('?')[0];
    var exist = [].some.call(document.scripts, function (sc) {
      return sc.src && sc.src.indexOf(base) !== -1;
    });
    if (exist) return;
    var s = document.createElement('script');
    s.src = src;
    document.body.appendChild(s);
  }

  function swap(doc) {
    var cur = document.getElementById('view');
    var next = doc.getElementById('view');
    if (!cur || !next) throw new Error('缺少 #view 容器，回退整页');
    syncHead(doc);
    cur.replaceWith(next);
    runScripts(doc);
    if (window.SiteNav && SiteNav.highlight) {
      SiteNav.highlight(next.getAttribute('data-page-href') || undefined);
    }
    // 通知已加载的外部页面脚本（如 story.js）重新初始化
    document.dispatchEvent(new CustomEvent('spa:navigated', { detail: { page: next.getAttribute('data-page') } }));
    window.scrollTo(0, 0);
  }

  var navToken = 0;
  async function navigate(href, addHistory) {
    var token = ++navToken;
    try {
      var resp = await fetch(href);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var html = await resp.text();
      if (token !== navToken) return; // 已有更新的跳转，丢弃本次
      var doc = new DOMParser().parseFromString(html, 'text/html');
      // 先更新地址，再注入脚本：页面脚本可能依赖 location.search（如 news-detail 读 ?id=）
      if (addHistory) history.pushState({ spa: true }, '', href);
      swap(doc);
    } catch (e) {
      // 任何失败都回退为整页跳转，保证可用
      location.href = href;
    }
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a');
    if (!isInternalLink(a)) return;
    e.preventDefault();
    var href = a.getAttribute('href');
    // 同页锚点/同地址不处理
    if (href === location.pathname.split('/').pop() + location.search) return;
    navigate(href, true);
  });

  window.addEventListener('popstate', function () {
    // 后退/前进：取当前地址重新加载内容（不再 pushState）
    navigate(location.pathname.split('/').pop() + location.search || 'index.html', false);
  });
})();
