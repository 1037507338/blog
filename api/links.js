// Vercel Serverless Function - 链接 CRUD API
// 支持 page_type 字段，用于区分不同页面类型的链接
// GET ?page_type=首页导航  →  筛选指定页面类型的链接
// GET ?page_type=BD推荐    →  BD推荐页面专用数据

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
    // GET - 读取链接（支持 page_type 筛选）
    if (req.method === 'GET') {
      const { page_type, fresh } = req.query;
      // admin/写入页面带 fresh 参数 → 绕过缓存层取最新；强制重建内存缓存
      if (fresh) await rebuildCache();
      const data = await getCache();

      if (fresh) {
        res.setHeader('Cache-Control', 'no-store');
      } else {
        // 浏览器 60s + CDN 5 分钟 + 后台刷新窗口 10 分钟
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      }

      // 无 page_type → 返回全部
      if (!page_type) {
        return res.status(200).json(data);
      }

      // 有 page_type → 筛选
      const filtered = data.filter(l => l.page_type === page_type);
      return res.status(200).json(filtered);
    }

    // POST - 新增链接
    if (req.method === 'POST') {
      const { title, description, url, sort_order, page_type, link_type, categories } = req.body;

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
          sort_order: sort_order || 0,
          page_type: page_type || '首页导航',
          link_type: link_type || 'external',
          categories: Array.isArray(categories) ? categories : []
        }])
        .select();

      if (error) throw error;
      if (cache) cache.push(data[0]);
      return res.status(201).json(data[0]);
    }

    // PUT - 更新链接
    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: '缺少链接ID' });

      const { title, description, url, sort_order, page_type, link_type, categories } = req.body;

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (url !== undefined) updates.url = url;
      if (sort_order !== undefined) updates.sort_order = sort_order;
      if (page_type !== undefined) updates.page_type = page_type;
      if (link_type !== undefined) updates.link_type = link_type;
      if (categories !== undefined) updates.categories = Array.isArray(categories) ? categories : [];
      updates.updated_at = new Date().toISOString();

      const client = await getSupabase();
      const { data, error } = await client
        .from('links')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data.length) return res.status(404).json({ error: '链接不存在' });
      if (cache) {
        const idx = cache.findIndex(l => String(l.id) === String(id));
        if (idx !== -1) cache[idx] = data[0];
      }
      return res.status(200).json(data[0]);
    }

    // DELETE - 删除链接
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: '缺少链接ID' });

      const client = await getSupabase();
      const { error } = await client.from('links').delete().eq('id', id);
      if (error) throw error;
      if (cache) cache = cache.filter(l => String(l.id) !== String(id));
      return res.status(200).json({ success: true, id });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || '服务器错误' });
  }
}
