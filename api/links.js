// Vercel Serverless Function - 链接 CRUD API
// 使用 SUPABASE_URL + SUPABASE_SERVICE_KEY 环境变量
// 内存缓存：首次请求时加载，后续请求直接读缓存
// POST/PUT/DELETE 时更新缓存

// Supabase 客户端（模块级单例）
let _supabase = null;
async function getSupabase() {
  if (!_supabase) {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('缺少 Supabase 环境变量配置');
    }
    const { createClient } = await import('@supabase/supabase-js');
    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }
  return _supabase;
}

// ===== 内存缓存 =====
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟自动过期

// 从数据库加载全部数据并写入缓存
async function rebuildCache() {
  const client = await getSupabase();
  const { data, error } = await client
    .from('links')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (error) throw error;
  cache = data;
  cacheTime = Date.now();
  console.log(`[cache] 重建，共 ${cache.length} 条`);
  return cache;
}

// 获取缓存（懒加载 + TTL 过期自动刷新）
async function getCache() {
  if (!cache || Date.now() - cacheTime > CACHE_TTL) {
    await rebuildCache();
  }
  return cache;
}

// ===== 请求入口 =====
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - 读取链接（走缓存）
    if (req.method === 'GET') {
      const data = await getCache();
      return res.status(200).json(data);
    }

    // POST - 新增链接
    if (req.method === 'POST') {
      const { title, description, url, category, sort_order } = req.body;

      if (!title || !url) {
        return res.status(400).json({ error: '标题和URL为必填项' });
      }

      const client = await getSupabase();
      const { data, error } = await client
        .from('links')
        .insert([{
          title,
          description: description || '',
          url,
          category: category || '未分类',
          sort_order: sort_order || 0
        }])
        .select();

      if (error) throw error;

      // 缓存追加
      if (cache) cache.push(data[0]);

      return res.status(201).json(data[0]);
    }

    // PUT - 更新链接
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { title, description, url, category, sort_order } = req.body;

      if (!id) {
        return res.status(400).json({ error: '缺少链接ID' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (url !== undefined) updates.url = url;
      if (category !== undefined) updates.category = category;
      if (sort_order !== undefined) updates.sort_order = sort_order;
      updates.updated_at = new Date().toISOString();

      const client = await getSupabase();
      const { data, error } = await client
        .from('links')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data.length) {
        return res.status(404).json({ error: '链接不存在' });
      }

      // 缓存更新
      if (cache) {
        const idx = cache.findIndex(l => String(l.id) === String(id));
        if (idx !== -1) cache[idx] = data[0];
      }

      return res.status(200).json(data[0]);
    }

    // DELETE - 删除链接
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: '缺少链接ID' });
      }

      const client = await getSupabase();
      const { error } = await client
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 缓存移除
      if (cache) {
        cache = cache.filter(l => String(l.id) !== String(id));
      }

      return res.status(200).json({ success: true, id });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || '服务器错误' });
  }
}
