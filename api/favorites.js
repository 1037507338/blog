// Vercel Serverless - 用户收藏（大盘行情）CRUD
// 鉴权：请求头 Authorization: Bearer <supabase access_token(JWT)>
// 安全：用「带用户 JWT 的 anon 客户端」访问，RLS 自动限定 auth.uid() = user_id；
//       绝不使用 SERVICE_KEY（那会绕过 RLS）。
//
//   GET    /api/favorites                      → { items: [item_name, ...] }
//   POST   /api/favorites {item_name}          → 收藏单个
//   POST   /api/favorites {action:'merge', items:[...]}  → 批量合并（首次登录用）
//   DELETE /api/favorites {item_name}          → 取消收藏

function getBearer(req) {
  const h = req.headers['authorization'] || req.headers['Authorization'] || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1].trim() : '';
}

// 创建「以该用户身份」的 Supabase 客户端（RLS 生效）
async function getUserClient(jwt) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('服务器未配置 SUPABASE_URL / SUPABASE_ANON_KEY');
  }
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store'); // 个人数据不缓存
  if (req.method === 'OPTIONS') return res.status(200).end();

  const jwt = getBearer(req);
  if (!jwt) return res.status(401).json({ error: '未登录：缺少访问令牌' });

  try {
    const client = await getUserClient(jwt);
    // 校验 token 并拿到用户
    const { data: userData, error: userErr } = await client.auth.getUser();
    if (userErr || !userData || !userData.user) {
      return res.status(401).json({ error: '登录已失效，请重新登录' });
    }
    const userId = userData.user.id;

    if (req.method === 'GET') {
      const { data, error } = await client
        .from('user_favorites')
        .select('item_name')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json({ items: (data || []).map(r => r.item_name) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      // 批量合并（首次登录把本地收藏上云）
      if (body.action === 'merge') {
        const items = Array.isArray(body.items) ? body.items.filter(s => typeof s === 'string' && s) : [];
        if (items.length) {
          const rows = items.map(item_name => ({ user_id: userId, item_name }));
          const { error } = await client.from('user_favorites').upsert(rows, { onConflict: 'user_id,item_name' });
          if (error) throw error;
        }
        const { data, error } = await client.from('user_favorites').select('item_name').order('created_at', { ascending: true });
        if (error) throw error;
        return res.status(200).json({ items: (data || []).map(r => r.item_name) });
      }
      // 单个收藏
      const item_name = body.item_name;
      if (!item_name || typeof item_name !== 'string') return res.status(400).json({ error: 'item_name 必填' });
      const { error } = await client.from('user_favorites').upsert({ user_id: userId, item_name }, { onConflict: 'user_id,item_name' });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const item_name = (req.body && req.body.item_name) || req.query.item_name;
      if (!item_name) return res.status(400).json({ error: 'item_name 必填' });
      const { error } = await client.from('user_favorites').delete().eq('item_name', item_name);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error('[favorites]', req.method, e.message);
    return res.status(500).json({ error: e.message });
  }
}
