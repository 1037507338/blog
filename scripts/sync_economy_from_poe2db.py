#!/usr/bin/env python3
"""
定时同步 poe2db.tw 大盘行情数据 → data/economy-data.json
供 economy.html 前端页面直接读取，废弃原 api/economy.js 实时抓取逻辑
"""

import json, os, re, sys
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

# 分类清单（key 对应 poe2db Economy_<key> 页面，值为中文标签）
CATS = {
    'Currency': '通货',
    'Fragments': '碎片',
    'Ritual': '驱灵仪式',
    'Essences': '精华',
    'Breach': '裂隙',
    'Delirium': '惊悸迷雾',
    'Expedition': '先祖秘藏',
    'Runes': '符文',
    'Soul_Cores': '灵核',
    'Idols': '雕像',
    'Uncut_Gems': '未切割宝石',
    'Abyss': '深渊',
    'Gems': '宝石',
    'Atziris_Temple': '阿兹里神庙',
}

# 基准货币英文 key → 中文名
REF_CN = {
    'divine': '神圣石',
    'chaos': '混沌石',
    'exalted': '崇高石',
}

def fetch_html(cat):
    url = f'https://poe2db.tw/cn/Economy_{cat}'
    req = Request(url, headers={
        'User-Agent': UA,
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml',
    })
    with urlopen(req, timeout=15) as resp:
        return resp.read().decode('utf-8')

def parse_side(s):
    """拆分价格列一侧：返回 (qty, key)"""
    no_img = re.sub(r'<img[^>]*>', '', s)
    m = re.search(r'\d[\d,\.]*', no_img)
    qty = float(m.group(0).replace(',', '')) if m else None
    eco_m = re.search(r'Economy_([a-z_]+)', s)
    key = eco_m.group(1) if eco_m else None
    if not key:
        txt = re.sub(r'<[^>]+>', ' ', s)
        tk = re.findall(r'[a-z][a-z\-]+[a-z0-9]', txt)
        key = tk[-1] if tk else None
    return qty, key

def parse_price(price_td, item_key):
    """解析价格列 → (unitQty, baseKey)：1物品需要 unitQty 个 baseKey"""
    parts = price_td.split('fa-left-right')
    if len(parts) < 2:
        return None, None
    l_qty, l_key = parse_side(parts[0])
    r_qty, r_key = parse_side(parts[1])
    if not l_qty or not r_qty:
        return None, None
    # 物品自身在哪侧 → 取对侧为计价货币
    if l_key == item_key:
        return r_qty / l_qty, r_key
    else:
        return l_qty / r_qty, l_key

def parse_rows(html):
    tbody_m = re.search(r'<tbody[\s\S]*?>([\s\S]*?)</tbody>', html)
    if not tbody_m:
        return []
    rows = re.findall(r'<tr[\s\S]*?</tr>', tbody_m.group(1))
    items = []
    for tr in rows:
        tds = re.findall(r'<td[\s\S]*?</td>', tr)
        if len(tds) != 4:
            continue
        # 名称 + item_key + icon
        name_a = re.search(r'<a href="Economy_[^"]*">[\s\S]*?</a>', tds[0])
        name = re.sub(r'<[^>]+>', '', name_a.group(0)).strip() if name_a else ''
        item_key_m = re.search(r'Economy_([a-z_]+)', tds[0])
        item_key = item_key_m.group(1) if item_key_m else None
        icon_m = re.search(r'<img[^>]*src="([^"]+)"', tds[0])
        icon = icon_m.group(1) if icon_m else ''
        # 价格
        unit_qty, base_key = parse_price(tds[1], item_key)
        # 趋势
        path_m = re.search(r'<path d="([^"]+)"[^>]*stroke="(green|red)"', tds[2])
        spark = path_m.group(1) if path_m else ''
        pct_m = re.search(r'color:\s*(green|red)[^>]*>\s*([+\-][\d\.]+%)', tds[2])
        trend_pct = pct_m.group(2) if pct_m else ''
        trend_up = (pct_m.group(1) == 'green') if pct_m else None
        # 成交量
        volume = re.sub(r'<[^>]+>', '', tds[3]).strip()
        if name and unit_qty:
            items.append({
                'name': name,
                'icon': icon,
                'itemKey': item_key,
                'unitQty': round(unit_qty, 4),
                'baseKey': base_key,
                'baseCn': REF_CN.get(base_key, base_key),
                'trendPct': trend_pct,
                'trendUp': trend_up,
                'spark': spark,
                'volume': volume,
            })
    return items

def extract_rates(currency_items):
    """从通货页提取汇率：1 个货币 = ? 神圣石"""
    rates = {'divine': 1}
    for it in currency_items:
        if it['itemKey'] in ('exalted', 'chaos') and it['baseKey'] == 'divine':
            rates[it['itemKey']] = it['unitQty']
    return rates

def fetch_cat(cat, rates):
    """抓取单分类，折算神圣石单价"""
    html = fetch_html(cat)
    raw = parse_rows(html)
    if not raw:
        raise ValueError(f'{cat} 解析结果为空')
    items = []
    for it in raw:
        rate = rates.get(it['baseKey'])
        price_divine = round(it['unitQty'] * rate, 4) if rate else None
        items.append({
            'name': it['name'],
            'icon': it['icon'],
            'unitQty': it['unitQty'],
            'baseKey': it['baseKey'],
            'baseCn': it['baseCn'],
            'priceDivine': price_divine,
            'trendPct': it['trendPct'],
            'trendUp': it['trendUp'],
            'spark': it['spark'],
            'volume': it['volume'],
        })
    return {
        'cat': cat,
        'label': CATS.get(cat, cat),
        'items': items,
    }

def main():
    print('从 poe2db.tw 同步大盘行情数据...')
    # 先抓通货页拿汇率
    currency_html = fetch_html('Currency')
    currency_items = parse_rows(currency_html)
    rates = extract_rates(currency_items)
    print(f'汇率: {rates}')

    all_items = []
    fetched_at = int(datetime.now().timestamp())

    for cat in CATS:
        try:
            data = fetch_cat(cat, rates)
            n = len(data['items'])
            print(f'{cat}: {n} 条')
            # 注入分类中文名（用于「全部」聚合）
            for it in data['items']:
                it['catCn'] = CATS[cat]
            all_items.extend(data['items'])
        except Exception as e:
            print(f'{cat}: ⚠️ {e}', file=sys.stderr)

    payload = {
        'cat': 'All',
        'label': '全部',
        'rates': rates,
        'items': all_items,
        'fetched_at': fetched_at,
    }

    out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'economy-data.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    size = len(json.dumps(payload, ensure_ascii=False))
    print(f'已保存: {out_path} ({size} 字节, {len(all_items)} 条)')

if __name__ == '__main__':
    main()
