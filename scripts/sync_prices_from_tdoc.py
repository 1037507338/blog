#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从腾讯文档读取 POE2 物价数据，生成 prices-data.json
只保留国服相关内容（名称+价格），不包含国际服数据。
"""
import subprocess, json, csv, io, sys
from datetime import datetime

FILE_ID = "DRnNidnZ5cXp3R2F0"

def mcporter_call(tool_name, args):
    r = subprocess.run(
        ["mcporter","call","tencent-docs",tool_name,"--args",json.dumps(args,ensure_ascii=False)],
        capture_output=True, text=True, timeout=60
    )
    if r.returncode != 0:
        print(f"mcporter 失败: {r.stderr[:200]}", file=sys.stderr)
        return None
    try:
        return json.loads(r.stdout)
    except Exception as e:
        print(f"JSON解析失败: {e}", file=sys.stderr)
        return None

def get_rows(sheet_id, end_col, end_row):
    resp = mcporter_call("sheet.get_cell_data", {
        "file_id": FILE_ID, "sheet_id": sheet_id,
        "end_col": end_col, "end_row": end_row, "return_csv": True
    })
    if not resp or not resp.get("csv_data"):
        return []
    return list(csv.reader(io.StringIO(resp["csv_data"])))

def clean(v):
    v = (v or "").strip()
    return "" if v in ("''", '""', "") else v

# ── 血脉宝石 ──────────────────────────────────────────────────────────────
import re

def is_chinese(s):
    """检查字符串是否包含中文字符"""
    return bool(re.search(r'[\u4e00-\u9fff]', s))

def read_gems():
    """
    宝石表 g60x1m：左5列=血脉宝石(col0-4)，右5列=限定掉落(col5-9)
    表头在第7行，数据从第8行开始。
    合并为统一列表，每个条目带 type 字段区分血脉/限定。
    col2/col7=国服名称, col3/col8=国服价格, col4/col9=出处
    """
    rows = get_rows("g60x1m", 10, 50)
    gems = []
    in_data = False
    for row in rows:
        if not in_data:
            if any("国际服名称" in clean(c) for c in row):
                in_data = True; continue
        # 左区：血脉宝石
        cn = clean(row[2] if len(row)>2 else "")
        if cn and is_chinese(cn) and not cn.startswith("国服统计"):
            gems.append({
                "type": "血脉",
                "cn": cn,
                "price_cn": clean(row[3] if len(row)>3 else ""),
                "source": clean(row[4] if len(row)>4 else "")
            })
        # 右区：限定掉落
        cn2 = clean(row[7] if len(row)>7 else "")
        if cn2 and is_chinese(cn2) and not cn2.startswith("国服统计"):
            gems.append({
                "type": "限定",
                "cn": cn2,
                "price_cn": clean(row[8] if len(row)>8 else ""),
                "source": clean(row[9] if len(row)>9 else "")
            })
    return gems

# ── 高价值白板底材 ─────────────────────────────────────────────────────────
def read_bases():
    """
    底材表 mrwz2n：左右双区，每区有独立的分类标记和物品数据。
    左区: col0=分类标记, col2=物品名称, col4=国际服价, col6=国服价, col8=等级
    右区: col9=分类标记, col11=物品名称, col14=国际服价, col16=国服价, col18=等级
    
    分类标记规则：只有包含中文字符的标记才是有效分类（红色底色）。
    英文标记如 Guardian Spear, Skullcrusher Quarterstaff 等为无效分类，应忽略。
    """
    rows = get_rows("mrwz2n", 27, 300)
    bases = {}
    cat_left, cat_right = None, None
    in_data = False
    
    for row in rows:
        # 检测数据开始行（表头含“物品名称”）
        if not in_data:
            if any("物品名称" in clean(c) for c in row):
                in_data = True
            continue
        
        # 左区分类检测
        c0 = clean(row[0] if len(row)>0 else "")
        if c0 == "基础分类":
            cat_left = None; continue
        if c0 and is_chinese(c0) and c0 not in ("物品名称", "国际服价格", "国服价格", "物品等级", "0.5新加"):
            cat_left = c0
        
        # 右区分类检测
        c9 = clean(row[9] if len(row)>9 else "")
        if c9 == "基础分类":
            cat_right = None; continue
        if c9 and is_chinese(c9) and c9 not in ("物品名称", "国际服价格", "国服价格", "物品等级", "0.5新加"):
            cat_right = c9
        # 右区也有些分类在 col10
        c10 = clean(row[10] if len(row)>10 else "")
        if c10 and is_chinese(c10) and c10 not in ("物品名称", "0.5新加"):
            cat_right = c10
        
        # 左区物品
        if cat_left:
            cn = clean(row[2] if len(row)>2 else "")
            if cn and is_chinese(cn):
                if cat_left not in bases: bases[cat_left] = []
                bases[cat_left].append({
                    "cn": cn,
                    "price_cn": clean(row[6] if len(row)>6 else ""),
                    "level": clean(row[8] if len(row)>8 else "")
                })
        
        # 右区物品
        if cat_right:
            cn2 = clean(row[11] if len(row)>11 else "")
            if cn2 and is_chinese(cn2):
                if cat_right not in bases: bases[cat_right] = []
                bases[cat_right].append({
                    "cn": cn2,
                    "price_cn": clean(row[15] if len(row)>15 else ""),
                    "level": clean(row[17] if len(row)>17 else "")
                })
    
    return bases

# ── 暗金装备 ──────────────────────────────────────────────────────────────
def read_uniques():
    """
    暗金表 omvvcy：左右双区，表头行6，数据从行7起。
    左区(col1-6): col1=基础分类, col2=物品名称, col3=出处, col4=国际服价格, col6=国服价格(当前为空)
    右区(col7-11): col7=基础分类, col8=物品名称, col9=出处, col10=国际服价格, col11=国服价格(当前为空)
    """
    rows = get_rows("omvvcy", 21, 206)
    result = []
    cat_left, cat_right = "-", "-"
    in_data = False
    CATS2 = ("珠宝","腰带","武器","戒指","药剂","项链","手套","衣服",
              "头盔","鞋子","盾牌","箭袋","咒符")
    for row in rows:
        if not in_data:
            if any("物品名称" in clean(c) for c in row):
                in_data = True; continue
        c1 = clean(row[1] if len(row)>1 else "")
        if c1 in CATS2: cat_left = c1
        c7 = clean(row[7] if len(row)>7 else "")
        if c7 in CATS2: cat_right = c7
        en = clean(row[2] if len(row)>2 else "")
        if en:
            result.append({
                "category": cat_left,
                "cn": en,
                "source": clean(row[3] if len(row)>3 else ""),
                "price_cn": clean(row[6] if len(row)>6 else "")
            })
        en2 = clean(row[8] if len(row)>8 else "")
        if en2:
            result.append({
                "category": cat_right,
                "cn": en2,
                "source": clean(row[9] if len(row)>9 else ""),
                "price_cn": clean(row[11] if len(row)>11 else "")
            })
    return result

# ── 配方 ─────────────────────────────────────────────────────────────────
def read_recipes():
    """
    配方表 pavqpg：7组，全在同一页
    Row 8: 4符文(col0-10) | 5符文(col11-21) | 6符文(col22-32)
    Row 65: 7符文(col0-10) | 8符文(col11-21) | 9符文(col22-32)
    Row 73: 10符文(col22-32)
    
    每组11列：
    col(base+0)=类型标记, col(base+2)=国际服名称, col(base+4)=国际服价值,
    col(base+6)=国服名称, col(base+8)=国服价格, col(base+10)=最低等级
    """
    rows = get_rows("pavqpg", 45, 204)
    TYPES = ("合金","通货","宝石","符文")
    # 每个符文组的 (符文数, base_col, header_row)
    rune_groups = [
        (4, 0, 8),
        (5, 11, 8),
        (6, 22, 8),
        (7, 0, 65),
        (8, 11, 65),
        (9, 22, 65),
        (10, 22, 73),
    ]
    result = {k: {t: [] for t in TYPES} for k, _, _ in rune_groups}

    # 收集所有类型标记: {符文组名: {row_idx: type}}
    row_type = {}
    for key, base, hdr_row in rune_groups:
        row_type[key] = {}
        for ri in range(hdr_row, min(204, len(rows))):
            row = rows[ri] if ri < len(rows) else []
            v = clean(row[base] if len(row)>base else "")
            if v in TYPES:
                row_type[key][ri] = v

    # 扫描所有行收集数据
    for ri in range(min(204, len(rows))):
        row = rows[ri]
        for key, base, hdr_row in rune_groups:
            # 找到当前行之前最近的类型标记
            active_type = None
            for r in range(ri, hdr_row - 1, -1):
                if r in row_type[key]:
                    active_type = row_type[key][r]; break
            if not active_type: continue
            cn = clean(row[base + 6] if len(row)>base+6 else "")
            if not cn: continue
            result[key][active_type].append({
                "cn": cn,
                "price_cn": clean(row[base + 8] if len(row)>base+8 else ""),
                "min_level": clean(row[base + 10] if len(row)>base+10 else "")
            })
    return result

# ── 主程序 ────────────────────────────────────────────────────────────────
def main():
    print("从腾讯文档同步 POE2 物价数据（仅国服）...")
    g = read_gems()
    gems_blood = [x for x in g if x['type'] == '血脉']
    gems_limited = [x for x in g if x['type'] == '限定']
    print(f"血脉宝石: 血脉{len(gems_blood)}条, 限定{len(gems_limited)}条")
    b = read_bases()
    print(f"底材: " + " ".join(f"{k}={len(v)}" for k,v in b.items()))
    u = read_uniques()
    print(f"暗金: {len(u)}条")
    r = read_recipes()
    for k in sorted(r.keys()):
        n = sum(len(v) for v in r[k].values())
        parts = " ".join(f"{t}={len(v)}" for t,v in r[k].items() if v)
        print(f"{k}符文配方: {n}条 " + parts)

    meta = {"update_time": datetime.now().isoformat(timespec="seconds"), "source": "腾讯文档"}
    rows = get_rows("g60x1m", 10, 10)
    for row in rows:
        for c in row:
            if "国服统计" in clean(c):
                meta["note_cn"] = clean(c); break
        if "note_cn" in meta: break

    data = {
        "metadata": meta,
        "gems": g,
        "bases": b,
        "uniques": u,
        "recipes": r
    }
    out = "/Users/saisi/.qclaw/workspace-54nuktoh8cd83kjj/poe2-guide/data/prices-data.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    size = len(json.dumps(data, ensure_ascii=False))
    print(f"已保存: {out} ({size} 字节)")

if __name__ == "__main__":
    main()
