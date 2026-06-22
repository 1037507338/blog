// Vercel Serverless - 抓取 poe2db.tw/cn/Economy_* 国服大盘行情
// 返回: { cat, label, items:[{name,icon,price,priceDivine,trendPct,trendUp,spark,volume}], rates, fetched_at }
// 价格统一折算为「神圣石」单价(priceDivine)，避免不同计价货币混排导致排序误解
// 数据来源: poe2db.tw (CC BY-NC-SA 3.0) —— 非商用，需署名
// 抓取套路与 api/poe2-time.js 一致：服务端正则解析 + 三层缓存兜底

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// 分类清单（key 对应 poe2db Economy_<key> 页面，值为中文标签）
const CATS = {
  Currency: '通货',
  Fragments: '碎片',
  Ritual: '驱灵仪式',
  Essences: '精华',
  Breach: '裂隙',
  Delirium: '惊悸迷雾',
  Expedition: '先祖秘藏',
  Runes: '符文',
  Soul_Cores: '灵核',
  Idols: '雕像',
  Uncut_Gems: '未切割宝石',
  Abyss: '深渊',
  Gems: '宝石',
  Atziris_Temple: '阿兹里神庙',
};

// 基准货币英文 key → 中文名
const REF_CN = {
  divine: '神圣石',
  chaos: '混沌石',
  exalted: '崇高石',
};

let memCache = {};   // { [cat]: { payload, at } }
let rateCache = null; // { rates:{divine:1,exalted:..,chaos:..}, at }
const MEM_TTL = 30 * 60 * 1000; // 30 分钟

// 拆分价格列两侧（以 fa-left-right 图标为界），每侧返回 {qty, key}
// poe2db 价格列结构：<数量A><货币A图标> ⟷ <数量B><货币B图标>
// 物品自身那侧的货币 key 等于名称列的 item_key，取「对侧」为计价货币
function parseSide(s) {
  const noImg = s.replace(/<img[^>]*>/g, '');
  const numM = noImg.match(/\d[\d,\.]*/);
  const qty = numM ? parseFloat(numM[0].replace(/,/g, '')) : null;
  // 货币 key：优先 Economy_xxx 锚点；否则取末尾文字 key（物品自身可能是无锚点的文字）
  const ecoM = s.match(/Economy_([a-z_]+)/);
  let key = ecoM ? ecoM[1] : null;
  if (!key) {
    const txt = s.replace(/<[^>]+>/g, ' ');
    const tk = txt.match(/[a-z][a-z\-]+[a-z0-9]/g);
    key = tk ? tk[tk.length - 1] : null;
  }
  return { qty, key };
}

// 解析价格列 → { unitQty, baseKey }：买 1 个该物品需要 unitQty 个 baseKey 货币
function parsePrice(priceTd, itemKey) {
  const parts = priceTd.split(/fa-left-right/);
  if (parts.length < 2) return null;
  const L = parseSide(parts[0]);
  const R = parseSide(parts[1]);
  if (!L.qty || !R.qty) return null;
  // 物品自身在哪侧 → 取对侧为计价
  let itemQty, baseQty, baseKey;
  if (L.key === itemKey) { itemQty = L.qty; baseQty = R.qty; baseKey = R.key; }
  else { itemQty = R.qty; baseQty = L.qty; baseKey = L.key; }
  if (!itemQty || !baseQty || !baseKey) return null;
  return { unitQty: baseQty / itemQty, baseKey }; // 1 个物品 = unitQty 个 baseKey
}

function parseRows(html) {
  const tbodyM = html.match(/<tbody[\s\S]*?>([\s\S]*?)<\/tbody>/);
  if (!tbodyM) return [];
  const rows = tbodyM[1].match(/<tr[\s\S]*?<\/tr>/g) || [];
  const items = [];

  for (const tr of rows) {
    const tds = tr.match(/<td[\s\S]*?<\/td>/g);
    if (!tds || tds.length !== 4) continue;

    // 列1 名称 + 物品 key + 图标
    const nameA = tds[0].match(/<a href="Economy_[^"]*">[\s\S]*?<\/a>/);
    const name = nameA ? nameA[0].replace(/<[^>]+>/g, '').trim() : '';
    const itemKeyM = tds[0].match(/Economy_([a-z_]+)/);
    const itemKey = itemKeyM ? itemKeyM[1] : null;
    const iconM = tds[0].match(/<img[^>]*src="([^"]+)"/);
    const icon = iconM ? iconM[1] : '';

    // 列2 价格（正确取物品对侧货币）
    const priced = parsePrice(tds[1], itemKey);

    // 列3 趋势
    const pathM = tds[2].match(/<path d="([^"]+)"[^>]*stroke="(green|red)"/);
    const spark = pathM ? pathM[1] : '';
    const pctM = tds[2].match(/color:\s*(green|red)[^>]*>\s*([+\-][\d\.]+%)/);
    const trendPct = pctM ? pctM[2] : '';
    const trendUp = pctM ? pctM[1] === 'green' : null;

    // 列4 成交量
    const volume = tds[3].replace(/<[^>]+>/g, '').replace(/\s+/g, '').trim();

    if (!name || !priced) continue;
    items.push({
      name,
      icon,
      itemKey,
      unitQty: priced.unitQty,   // 1 个物品 = unitQty 个 baseKey
      baseKey: priced.baseKey,
      baseCn: REF_CN[priced.baseKey] || priced.baseKey,
      trendPct,
      trendUp,
      spark,
      volume,
    });
  }
  return items;
}

// 从通货页 items 提取汇率：1 个 <货币> = ? 神圣石
function extractRates(currencyItems) {
  const rates = { divine: 1 };
  for (const it of currencyItems) {
    if ((it.itemKey === 'exalted' || it.itemKey === 'chaos') && it.baseKey === 'divine') {
      // 1 个该货币 = unitQty 个 divine
      rates[it.itemKey] = it.unitQty;
    }
  }
  return rates;
}

async function fetchHtml(cat) {
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
  return resp.text();
}

// 获取汇率（缓存 30min）；折算所有分类价格都依赖它
async function getRates() {
  if (rateCache && Date.now() - rateCache.at <= MEM_TTL) return rateCache.rates;
  const html = await fetchHtml('Currency');
  const items = parseRows(html);
  const rates = extractRates(items);
  // 兜底：缺失汇率时用合理默认，避免 NaN
  if (!rates.exalted) rates.exalted = null;
  if (!rates.chaos) rates.chaos = null;
  rateCache = { rates, at: Date.now() };
  return rates;
}

async function fetchCat(cat) {
  const rates = await getRates();
  const html = await fetchHtml(cat);
  const raw = parseRows(html);
  if (!raw.length) throw new Error('解析结果为空，可能上游改版');

  const items = raw.map(it => {
    const rate = rates[it.baseKey];          // 1 个 baseKey 货币 = rate 神圣石
    const priceDivine = (rate != null) ? it.unitQty * rate : null; // 神圣石单价
    return {
      name: it.name,
      icon: it.icon,
      unitQty: Math.round(it.unitQty * 10000) / 10000, // 原始：1物品=N base货币
      baseKey: it.baseKey,
      baseCn: it.baseCn,
      priceDivine: priceDivine != null ? Math.round(priceDivine * 10000) / 10000 : null,
      trendPct: it.trendPct,
      trendUp: it.trendUp,
      spark: it.spark,
      volume: it.volume,
    };
  });

  return {
    cat,
    label: CATS[cat] || cat,
    rates,
    items,
    fetched_at: Math.floor(Date.now() / 1000),
  };
}

// 取单分类（带内存缓存），供「全部」聚合复用
async function getCat(cat) {
  const c = memCache[cat];
  if (c && Date.now() - c.at <= MEM_TTL) return c.payload;
  const payload = await fetchCat(cat);
  memCache[cat] = { payload, at: Date.now() };
  return payload;
}

// 聚合全部分类（并发，附带分类中文名）
async function fetchAll() {
  const keys = Object.keys(CATS);
  const results = await Promise.all(keys.map(c =>
    getCat(c).then(d => ({ c, d })).catch(() => null)
  ));
  const items = [];
  let rates = null, fetched = 0;
  for (const r of results) {
    if (!r || !r.d) continue;
    if (!rates && r.d.rates) rates = r.d.rates;
    if (r.d.fetched_at) fetched = Math.max(fetched, r.d.fetched_at);
    for (const it of (r.d.items || [])) items.push({ ...it, catCn: CATS[r.c] || r.c });
  }
  if (!items.length) throw new Error('聚合结果为空');
  return { cat: 'All', label: '全部', rates, items, fetched_at: fetched || Math.floor(Date.now() / 1000) };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const cat = (req.query.cat || 'Currency').trim();
  if (cat !== 'All' && !CATS[cat]) {
    return res.status(400).json({ error: `暂不支持的分类: ${cat}`, supported: ['All', ...Object.keys(CATS)] });
  }

  try {
    const cached = memCache[cat];
    if (!cached || Date.now() - cached.at > MEM_TTL) {
      const payload = cat === 'All' ? await fetchAll() : await fetchCat(cat);
      memCache[cat] = { payload, at: Date.now() };
    }
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json(memCache[cat].payload);
  } catch (e) {
    console.error('[economy]', cat, e);
    if (memCache[cat]) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.status(200).json({ ...memCache[cat].payload, stale: true, error: e.message });
    }
    return res.status(500).json({ error: e.message });
  }
}
