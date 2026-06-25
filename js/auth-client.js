// 前端用户登录封装（Supabase Auth / 邮箱密码）
// 暴露 window.Auth：init / getUser / signUp / signIn / signOut / getAccessToken / onChange
// 会话由 supabase-js 自动持久化到 localStorage 并自动刷新 JWT。
(function () {
  let _client = null;
  let _ready = null;          // init() 的 Promise（幂等）
  let _user = null;
  const _listeners = new Set();

  function notify() { _listeners.forEach(fn => { try { fn(_user); } catch (e) {} }); }

  // Supabase 返回的英文错误 → 友好中文
  function zhError(msg) {
    if (!msg) return '操作失败，请稍后重试';
    const m = String(msg).toLowerCase();
    if (m.includes('email not confirmed')) return '邮箱尚未验证，请先到邮箱点击验证链接后再登录';
    if (m.includes('invalid login credentials')) return '邮箱或密码错误';
    if (m.includes('user already registered') || m.includes('already been registered')) return '该邮箱已注册，请直接登录';
    if (m.includes('password should be at least')) return '密码至少 6 位';
    if (m.includes('unable to validate email') || m.includes('invalid email')) return '邮箱格式不正确';
    if (m.includes('rate limit') || m.includes('too many requests')) return '操作过于频繁，请稍后再试';
    if (m.includes('signups not allowed') || m.includes('signup is disabled')) return '当前未开放注册';
    return msg;
  }

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
    if (error) return { error: zhError(error.message) };
    // 开启邮箱验证时无 session，此时不视为登录态（避免导航误显示已登录）
    if (!data.session) return { needConfirm: true };
    // 关闭邮箱验证时直接返回 session，视为登录
    _user = data.user || null;
    notify();
    return { user: _user, needConfirm: false };
  }

  async function signIn(email, password) {
    await init();
    if (!_client) return { error: '登录服务不可用' };
    const { data, error } = await _client.auth.signInWithPassword({ email, password });
    if (error) return { error: zhError(error.message), code: error.message };
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
