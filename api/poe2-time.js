// Vercel Serverless - 抓取 poe2db.tw/cn/ 国服赛季倒计时
// 返回: { name, timestamp, status, fetched_at }
// CDN 缓存 10 分钟，stale-while-revalidate 30 分钟
// 数据源参考: https://github.com/wenjie23334/astrbot_plugin_poe2_time_check

const SOURCE = 'https://poe2db.tw/cn/';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let memCache = null;
let memCacheAt = 0;
const MEM_TTL = 10 * 60 * 1000; // 10 分钟

async function fetchAndParse() {
  const resp = await fetch(SOURCE, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml',
    },
    // Vercel runtime 默认带超时，这里做兜底
    signal: AbortSignal.timeout(12000),
  });
  if (!resp.ok) throw new Error(`upstream HTTP ${resp.status}`);
  const html = await resp.text();

  // 解析每个 card 块: <h5 ...>名称<small>0.x</small></h5> ... data-displaytime='ts' ... <a>开始倒数|已运行</a> ... data-countdown='ts'
  // 用正则做轻量解析（不引第三方依赖）
  const cardRe = /<div\s+class="card mb-2[^"]*"[\s\S]*?<h5[^>]*>([\s\S]*?)<\/h5>[\s\S]*?data-displaytime='(\d+)'[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
  const events = [];
  let m;
  while ((m = cardRe.exec(html)) !== null) {
    const rawTitle = m[1];
    const ts = parseInt(m[2], 10);
    const stateText = (m[3] || '').trim();
    // 提取标题文字 + 版本
    const titleClean = rawTitle.replace(/<small[^>]*>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!titleClean) continue;
    let status = 'unknown';
    if (stateText.includes('开始倒数') || /Starts in/i.test(stateText)) status = 'upcoming';
    else if (stateText.includes('已运行') || /Running/i.test(stateText)) status = 'running';
    events.push({ name: titleClean, timestamp: ts, status });
  }

  // 取第一条「开始倒数」(最近的国服开服)；没有则取第一条「已运行」
  const upcoming = events.find(e => e.status === 'upcoming');
  const running = events.find(e => e.status === 'running');
  const target = upcoming || running || events[0] || null;

  return {
    cn: target,
    all: events,
    fetched_at: Math.floor(Date.now() / 1000),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    if (!memCache || Date.now() - memCacheAt > MEM_TTL) {
      memCache = await fetchAndParse();
      memCacheAt = Date.now();
    }
    // 浏览器 5 分钟 + CDN 10 分钟 + 30 分钟 SWR
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800');
    return res.status(200).json(memCache);
  } catch (e) {
    console.error('[poe2-time]', e);
    // 兜底：如有旧缓存，过期也返回
    if (memCache) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.status(200).json({ ...memCache, stale: true, error: e.message });
    }
    return res.status(500).json({ error: e.message });
  }
}
