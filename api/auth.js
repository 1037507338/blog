// Vercel Serverless Function - 管理员登录
// POST /api/auth  body: { username, password }
//   成功 → { ok: true, token }（token 即 ADMIN_TOKEN，前端存 sessionStorage 后用于写接口鉴权）
//   失败 → 401
//
// 账号密码与 token 均来自环境变量（见 _auth.js），代码与前端均不含明文。

import { verifyCredentials } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // 登录响应绝不缓存
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { ADMIN_TOKEN } = process.env;
  if (!ADMIN_TOKEN) {
    return res.status(500).json({ error: '服务器未配置 ADMIN_TOKEN' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码必填' });
  }

  if (!verifyCredentials(username, password)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  return res.status(200).json({ ok: true, token: ADMIN_TOKEN });
}
