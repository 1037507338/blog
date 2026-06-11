// Vercel Serverless - 站点配置 KV 表
// GET  /api/site-config            → 返回全部配置 { key: value }
// GET  /api/site-config?key=foo    → 返回单个 { key, value }
// POST /api/site-config            → body: { key, value }（upsert）
//
// 表结构（请在 Supabase SQL Editor 执行）:
//   create table if not exists site_config (
//     key text primary key,
//     value jsonb not null,
//     updated_at timestamptz default now()
//   );

import { requireAuth } from './_auth.js';

let _supabase = null;
async function getSupabase() {
  if (!_supabase) {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('缺少 Supabase 环境变量');
    const { createClient } = await import('@supabase/supabase-js');
    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }
  return _supabase;
}

// 内存缓存（写入时主动失效）
let cache = null;
let cacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function rebuildCache() {
  const c = await getSupabase();
  const { data, error } = await c.from('site_config').select('key, value');
  if (error) throw error;
  const map = {};
  (data || []).forEach(row => { map[row.key] = row.value; });
  cache = map;
  cacheAt = Date.now();
  return map;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { key, fresh } = req.query;
      if (fresh) await rebuildCache();
      if (!cache || Date.now() - cacheAt > CACHE_TTL) await rebuildCache();
      if (fresh) res.setHeader('Cache-Control', 'no-store');
      // 配置变更需要快速生效；数据极小，CDN 只缓存 10 秒，SWR 60 秒
      else res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=60');

      if (key) return res.status(200).json({ key, value: cache[key] ?? null });
      return res.status(200).json(cache);
    }

    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return;
      const { key, value } = req.body || {};
      if (!key || value === undefined) return res.status(400).json({ error: 'key 和 value 必填' });
      const c = await getSupabase();
      const { error } = await c.from('site_config').upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
      cache = null;
      return res.status(200).json({ ok: true, key, value });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error('[site-config]', e);
    return res.status(500).json({ error: e.message });
  }
}
