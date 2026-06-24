// Vercel Serverless - 公开前端配置下发
// GET /api/public-config → { supabaseUrl, supabaseAnonKey }
//
// 仅下发「可公开」的值：anon key 是 Supabase 设计上允许暴露给浏览器的公钥，
// 所有数据访问受 RLS 约束。绝不下发 SUPABASE_SERVICE_KEY（仅服务端可用）。

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: '服务器未配置 SUPABASE_URL / SUPABASE_ANON_KEY' });
  }

  // 配置极少变动，可较长缓存
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).json({ supabaseUrl: SUPABASE_URL, supabaseAnonKey: SUPABASE_ANON_KEY });
}
