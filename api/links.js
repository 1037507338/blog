// Vercel Serverless Function - 链接 CRUD API
// 使用 SUPABASE_URL + SUPABASE_SERVICE_KEY 环境变量

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: '缺少 Supabase 环境变量配置' });
  }

  // 动态导入 @supabase/supabase-js（Vercel 自带）
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // GET - 获取所有链接
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw error;
      return res.status(200).json(data);
    }

    // POST - 新增链接
    if (req.method === 'POST') {
      const { title, desc, url, category, sort_order } = req.body;

      if (!title || !url) {
        return res.status(400).json({ error: '标题和URL为必填项' });
      }

      const { data, error } = await supabase
        .from('links')
        .insert([{ title, desc, url, category: category || '未分类', sort_order: sort_order || 0 }])
        .select();

      if (error) throw error;
      return res.status(201).json(data[0]);
    }

    // PUT - 更新链接
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { title, desc, url, category, sort_order } = req.body;

      if (!id) {
        return res.status(400).json({ error: '缺少链接ID' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (desc !== undefined) updates.desc = desc;
      if (url !== undefined) updates.url = url;
      if (category !== undefined) updates.category = category;
      if (sort_order !== undefined) updates.sort_order = sort_order;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('links')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data.length) {
        return res.status(404).json({ error: '链接不存在' });
      }
      return res.status(200).json(data[0]);
    }

    // DELETE - 删除链接
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: '缺少链接ID' });
      }

      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true, id });
    }

    // 其他方法
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || '服务器错误' });
  }
}