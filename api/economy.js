// Vercel Serverless - 抓取 poe2db.tw/cn/Economy_* 国服大盘行情
// 当前仅支持「通货」(Currency)，验证后再铺开其余分类
// 返回: { cat, label, items:[{name,icon,qty,ref,trendPct,trendUp,spark,volume}], fetched_at }
// 数据来源: poe2db.tw (CC BY-NC-SA 3.0) —— 非商用，需署名
// 抓取套路与 api/poe2-time.js 一致：服务端正则解析 + 三层缓存兜底

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// 分类清单（先只开通货；其余先登记，待铺开时启用）
const CATS = {
  Currency: '通货',
};

// 基准货币英文 key → 中文名（价格列左侧的计价货币）
const REF_CN = {
  divine: '神圣石',
  chaos: '混沌石',
  exalted: '崇高石',
};

let memCache = {};   // { [cat]: { payload, at } }
const MEM_TTL = 30 * 60 * 1000; // 30 分钟

function parseRows(html) {
  const tbodyM = html.match(/<tbody[\s\S]*?>([\s\S]*?)<\/tbody>/);
  if (!tbodyM) return [];
  const body = tbodyM[1];
  const rows = body.match(/<tr[\s\S]*?<\/tr>/g) || [];
  const items = [];

  for (const tr of rows) {
    const tds = tr.match(/<td[\s\S]*?<\/td>/g);
    if (!tds || tds.length !== 4) continue;

    // 列1 名称：第一个 <a href="Economy_*"> 内、去 img 后的中文文本；图标取该 td 第一个 img
    const nameA = tds[0].match(/<a href="Economy_[^"]*">[\s\S]*?<\/a>/);
    const name = nameA ? nameA[0].replace(/<[^>]+>/g, '').trim() : '';
    const iconM = tds[0].match(/<img[^>]*src="([^"]+)"/);
    const icon = iconM ? iconM[1] : '';

    // 列2 价格：形如「3690 <divine图标> ⟷ 1 <自身图标>」→ qty=3690, ref=divine
    const valNoImg = tds[1].replace(/<img[^>]*>/g, '');
    const nums = valNoImg.match(/\d[\d,\.]*/g) || [];
    const refs = tds[1].match(/Economy_([a-z]+)/g) || [];
    const qty = nums[0] || '';
    const refKey = refs.length ? refs[0].replace('Economy_', '') : '';

    // 列3 趋势：sparkline path + 涨跌方向/百分比
    const pathM = tds[2].match(/<path d="([^"]+)"[^>]*stroke="(green|red)"/);
    const spark = pathM ? pathM[1] : '';
    const pctM = tds[2].match(/color:\s*(green|red)[^>]*>\s*([+\-][\d\.]+%)/);
    const trendPct = pctM ? pctM[2] : '';
    const trendUp = pctM ? pctM[1] === 'green' : null;

    // 列4 成交量
    const volume = tds[3].replace(/<[^>]+>/g, '').replace(/\s+/g, '').trim();

    if (!name || !qty || !refKey) continue;
    items.push({
      name,
      icon,
      qty,
      ref: refKey,
      refCn: REF_CN[refKey] || refKey,
      trendPct,
      trendUp,
      spark,
      volume,
    });
  }
  return items;
}

async function fetchCat(cat) {
  const url = `https://poe2db.tw/cn/Economy_${cat}`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok) throw new Error(`upstream HTTP ${resp.status}`);
  const html = await resp.text();
  const items = parseRows(html);
  if (!items.length) throw new Error('解析结果为空，可能上游改版');
  return {
    cat,
    label: CATS[cat] || cat,
    items,
    fetched_at: Math.floor(Date.now() / 1000),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const cat = (req.query.cat || 'Currency').trim();
  if (!CATS[cat]) {
    return res.status(400).json({ error: `暂不支持的分类: ${cat}`, supported: Object.keys(CATS) });
  }

  try {
    const cached = memCache[cat];
    if (!cached || Date.now() - cached.at > MEM_TTL) {
      const payload = await fetchCat(cat);
      memCache[cat] = { payload, at: Date.now() };
    }
    // 浏览器 5 分钟 + CDN 30 分钟 + 1 小时 SWR
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json(memCache[cat].payload);
  } catch (e) {
    console.error('[economy]', cat, e);
    // 兜底：有旧缓存则过期也返回
    if (memCache[cat]) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.status(200).json({ ...memCache[cat].payload, stale: true, error: e.message });
    }
    return res.status(500).json({ error: e.message });
  }
}
