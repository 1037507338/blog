// 共享鉴权工具（文件名带下划线前缀，Vercel 不会当作路由暴露）
// 写接口（POST/PUT/DELETE）统一通过 requireAuth 校验 Bearer Token。
//
// 需要在 Vercel 项目环境变量中配置：
//   ADMIN_USER      管理员用户名
//   ADMIN_PASSWORD  管理员密码（明文，仅服务端可见）
//   ADMIN_TOKEN     一段足够长的随机串，作为登录后下发的 Bearer Token
//
// 设计原则：fail-closed —— 未配置 ADMIN_TOKEN 时，所有写操作一律拒绝，
// 避免误部署导致接口裸奔。

// 校验登录凭证；返回 true 表示账号密码正确
export function verifyCredentials(username, password) {
  const { ADMIN_USER, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USER || !ADMIN_PASSWORD) return false;
  return username === ADMIN_USER && password === ADMIN_PASSWORD;
}

// 从请求头取 Bearer Token
function extractToken(req) {
  const h = req.headers['authorization'] || req.headers['Authorization'] || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1].trim() : '';
}

// 写接口鉴权守卫：通过返回 true；否则已写入 401/500 响应并返回 false
export function requireAuth(req, res) {
  const { ADMIN_TOKEN } = process.env;
  if (!ADMIN_TOKEN) {
    res.status(500).json({ error: '服务器未配置 ADMIN_TOKEN，写操作已禁用' });
    return false;
  }
  const token = extractToken(req);
  if (!token || token !== ADMIN_TOKEN) {
    res.status(401).json({ error: '未授权：缺少或无效的访问令牌' });
    return false;
  }
  return true;
}
