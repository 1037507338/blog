// 前端用户登录封装（Supabase Auth / 邮箱密码）
// 暴露 window.Auth：init / getUser / signUp / signIn / signOut / getAccessToken / onChange
// 会话由 supabase-js 自动持久化到 localStorage 并自动刷新 JWT。
(function () {
  let _client = null;
  let _ready = null;          // init() 的 Promise（幂等）
  let _user = null;
  const _listeners = new Set();

  function notify() { _listeners.forEach(fn => { try { fn(_user); } catch (e) {} }); }

  // 初始化：拉公开配置 → 动态加载 supabase-js → 建客户端 → 恢复会话
  function init() {
    if (_ready) return _ready;
    _ready = (async () => {
      const cfg = await fetch('/api/public-config').then(r => r.ok ? r.json() : null).catch(() => null);
      if (!cfg || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {
        console.warn('[auth] 未配置 Supabase，登录功能不可用');
        return null;
      }
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      _client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      const { data } = await _client.auth.getSession();
      _user = data && data.session ? data.session.user : null;
      // 监听登录态变化（登录/登出/刷新）
      _client.auth.onAuthStateChange((_event, session) => {
        const next = session ? session.user : null;
        const changed = (next && next.id) !== (_user && _user.id);
        _user = next;
        if (changed) notify();
      });
      return _client;
    })();
    return _ready;
  }

  async function signUp(email, password) {
    await init();
    if (!_client) return { error: '登录服务不可用' };
    const { data, error } = await _client.auth.signUp({ email, password });
    if (error) return { error: error.message };
    // 关闭邮箱验证时 signUp 直接返回 session；开启时需先验证
    _user = data.user || null;
    notify();
    return { user: _user, needConfirm: !data.session };
  }

  async function signIn(email, password) {
    await init();
    if (!_client) return { error: '登录服务不可用' };
    const { data, error } = await _client.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    _user = data.user || null;
    notify();
    return { user: _user };
  }

  async function signOut() {
    await init();
    if (!_client) return;
    await _client.auth.signOut();
    _user = null;
    notify();
  }

  async function getAccessToken() {
    await init();
    if (!_client) return null;
    const { data } = await _client.auth.getSession();
    return data && data.session ? data.session.access_token : null;
  }

  function getUser() { return _user; }

  // 注册登录态变化回调；返回取消订阅函数。注册时立即回调一次当前态。
  function onChange(fn) {
    _listeners.add(fn);
    init().then(() => fn(_user));
    return () => _listeners.delete(fn);
  }

  window.Auth = { init, getUser, signUp, signIn, signOut, getAccessToken, onChange };
  // 提前初始化，使会话尽早恢复
  init();
})();
