// Vercel Serverless Function - 资讯动态 CRUD API
// 表 news：title / summary / tag / tag_color / content_type(link|markdown) / url / content / published_at / sort_order

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
const CACHE_TTL = 5 * 60 * 1000;

async function rebuildCache() {
  const client = await getSupabase();
  const { data, error } = await client
    .from('news')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false })
    .order('id', { ascending: false });
  if (error) throw error;
  cache = data;
  cacheTime = Date.now();
  return cache;
}

async function getCache() {
  if (!cache || Date.now() - cacheTime > CACHE_TTL) {
    await rebuildCache();
  }
  return cache;
}

function pickFields(body) {
  const allowed = ['title', 'summary', 'tag', 'tag_color', 'content_type', 'url', 'content', 'published_at', 'sort_order'];
  const out = {};
  for (const k of allowed) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { id, tag } = req.query;
      const data = await getCache();
      if (id) {
        const item = data.find(n => String(n.id) === String(id));
        if (!item) return res.status(404).json({ error: '资讯不存在' });
        return res.status(200).json(item);
      }
      if (tag && tag !== 'all') {
        return res.status(200).json(data.filter(n => n.tag === tag));
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const fields = pickFields(req.body || {});
      if (!fields.title) return res.status(400).json({ error: '标题为必填项' });
      const ct = fields.content_type || 'link';
      if (ct === 'link' && !fields.url) return res.status(400).json({ error: '链接类型需提供 url' });
      if (ct === 'markdown' && !fields.content) return res.status(400).json({ error: 'Markdown 类型需提供正文' });
      fields.content_type = ct;

      const client = await getSupabase();
      const { data, error } = await client.from('news').insert([fields]).select();
      if (error) throw error;
      cache = null; // 失效缓存
      return res.status(201).json(data[0]);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: '缺少资讯ID' });
      const updates = pickFields(req.body || {});
      updates.updated_at = new Date().toISOString();

      const client = await getSupabase();
      const { data, error } = await client.from('news').update(updates).eq('id', id).select();
      if (error) throw error;
      if (!data.length) return res.status(404).json({ error: '资讯不存在' });
      cache = null;
      return res.status(200).json(data[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: '缺少资讯ID' });
      const client = await getSupabase();
      const { error } = await client.from('news').delete().eq('id', id);
      if (error) throw error;
      cache = null;
      return res.status(200).json({ success: true, id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('News API Error:', error);
    return res.status(500).json({ error: error.message || '服务器错误' });
  }
}
