#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从腾讯文档读取 POE2 物价数据，生成 prices-data.json"""
import json, csv, io, subprocess, sys
from datetime import datetime

FILE_ID = "DRnNidnZ5cXp3R2F0"

def mcporter_call(tool_name, args):
    r = subprocess.run(
        ["mcporter", "call", "tencent-docs", tool_name, "--args", json.dumps(args, ensure_ascii=False)],
        capture_output=True, text=True, timeout=60
    )
    if r.returncode != 0:
        print(f"❌ mcporter 失败: {r.stderr[:200]}", file=sys.stderr)
        return None
    try:
        return json.loads(r.stdout)
    except Exception as e:
        print(f"⚠️ JSON解析失败: {e}", file=sys.stderr)
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
    return "-" if v in ("", "-") else v

def read_gems():
    rows = get_rows("g60x1m", 26, 200)
    global_, limited = [], []
    in_data = False
    for row in rows:
        if not in_data:
            if any("国际服名称" in c for c in row):
                in_data = True
            continue
        # 左列：col0=国际服名 col1=国际服价 col2=国服名 col3=国服价 col4=出处
        en = clean(row[0] if len(row) > 0 else "")
        if en and en != "-":
            global_.append({"en": en, "cn": clean(row[2] if len(row)>2 else ""),
                            "price_int": clean(row[1] if len(row)>1 else ""),
                            "price_cn": clean(row[3] if len(row)>3 else "")})
        # 右列：col5=国际服名 col6=国际服价 col7=国服名 col8=国服价 col9=出处
        en2 = clean(row[5] if len(row) > 5 else "")
        if en2 and en2 != "-":
            limited.append({"en": en2, "cn": clean(row[7] if len(row)>7 else ""),
                            "source": clean(row[9] if len(row)>9 else ""),
                            "price_int": clean(row[6] if len(row)>6 else ""),
                            "price_cn": clean(row[8] if len(row)>8 else "")})
    return global_, limited

def read_bases():
    rows = get_rows("mrwz2n", 27, 211)
    bases = {"shoes": [], "helmets": [], "shields": [], "quivers": [],
             "bows": [], "crossbows": [], "sceptres": [], "staves": [],
             "spears": [], "maces_1h": [], "maces_2h": []}
    cat_map = {
        "鞋子": "shoes", "头盔": "helmets", "盾": "shields", "箭袋": "quivers",
        "弓": "bows", "弩": "crossbows", "法器": "sceptres", "法杖": "staves",
        "长杖": "staves", "长矛": "spears", "单手锤": "maces_1h", "双手锤": "maces_2h"
    }
    cat = None
    for row in rows:
        c0 = clean(row[0] if len(row) > 0 else "")
        if c0 in cat_map:
            cat = cat_map[c0]
            continue
        if not cat:
            continue
        # 跳过表头行
        if c0 in ("基础分类",) or clean(row[2] if len(row)>2 else "") in ("物品名称",):
            continue
        en = clean(row[2] if len(row) > 2 else "")
        if not en or en == "-":
            continue
        bases[cat].append({"en": en,
                             "cn": clean(row[3] if len(row)>3 else ""),
                             "price_int": clean(row[4] if len(row)>4 else ""),
                             "price_cn": clean(row[6] if len(row)>6 else ""),
                             "level": clean(row[5] if len(row)>5 else "")})
    return {k: v for k, v in bases.items() if v}

def read_uniques():
    rows = get_rows("omvvcy", 21, 206)
    result = []
    cat_left, cat_right = "-", "-"
    in_data = False
    for row in rows:
        if not in_data:
            if any("物品名称" in c for c in row):
                in_data = True
            continue
        # 左列分类 col1
        c1 = clean(row[1] if len(row) > 1 else "")
        if c1 in ("珠宝","腰带","武器","戒指","药剂","项链","手套","衣服","头盔","鞋子","盾牌","箭袋","咒符"):
            cat_left = c1
        # 右列分类 col7
        c7 = clean(row[7] if len(row) > 7 else "")
        if c7 in ("珠宝","腰带","武器","戒指","药剂","项链","手套","衣服","头盔","鞋子","盾牌","箭袋","咒符"):
            cat_right = c7
        # 左列数据：col2=名称 col3=出处 col4=国际服价 col6=国服价
        en = clean(row[2] if len(row) > 2 else "")
        if en and en != "-":
            result.append({"category": cat_left,
                           "en": en,
                           "cn": clean(row[1] if len(row)>1 else ""),
                           "source": clean(row[3] if len(row)>3 else ""),
                           "price_int": clean(row[4] if len(row)>4 else ""),
                           "price_cn": clean(row[6] if len(row)>6 else "")})
        # 右列数据：col8=名称 col9=出处 col10=国际服价 col11=国服价
        en2 = clean(row[8] if len(row) > 8 else "")
        if en2 and en2 != "-":
            result.append({"category": cat_right,
                           "en": en2,
                           "cn": clean(row[7] if len(row)>7 else ""),
                           "source": clean(row[9] if len(row)>9 else ""),
                           "price_int": clean(row[10] if len(row)>10 else ""),
                           "price_cn": clean(row[11] if len(row)>11 else "")})
    return result

def read_recipes():
    rows = get_rows("pavqpg", 33, 204)
    r4 = {"合金":[], "通货":[], "宝石":[], "符文":[]}
    r7 = {"合金":[], "通货":[], "宝石":[], "符文":[]}
    rune, typ = None, None
    for row in rows:
        j = ",".join(row)
        if "4符文" in j: rune = "4"; continue
        if "7符文" in j: rune = "7"; continue
        c0 = clean(row[0] if len(row)>0 else "")
        if c0 in ("合金","通货","宝石","符文"):
            typ = c0; continue
        if not rune or not typ:
            continue
        # col2=国际服名 col4=国际服价 col6=国服名 col8=国服价 col10=最低等级
        en = clean(row[2] if len(row)>2 else "")
        if not en or en == "-":
            continue
        target = r4 if rune == "4" else r7
        target[typ].append({"en": en,
                             "cn": clean(row[6] if len(row)>6 else ""),
                             "price_int": clean(row[4] if len(row)>4 else ""),
                             "price_cn": clean(row[8] if len(row)>8 else ""),
                             "min_level": clean(row[10] if len(row)>10 else "")})
    return {"4": r4, "7": r7}

def main():
    print("🔄 从腾讯文档同步 POE2 物价数据...")
    g, l = read_gems()
    print(f"✅ 宝石: 全局{len(g)}条, 限定{len(l)}条")
    b = read_bases()
    print(f"✅ 底材: " + " ".join(f"{k}={len(v)}" for k,v in b.items()))
    u = read_uniques()
    print(f"✅ 暗金: {len(u)}条")
    r = read_recipes()
    r4n = sum(len(v) for v in r["4"].values())
    r7n = sum(len(v) for v in r["7"].values())
    print(f"✅ 配方: 4符文{r4n}条, 7符文{r7n}条")
    data = {
        "metadata": {
            "update_time": datetime.now().isoformat(timespec="seconds"),
            "source": "腾讯文档",
            "note_int": "1D ≈ 88E",
            "note_cn": "1D ≈ 86E"
        },
        "gems_global": g,
        "gems_limited": l,
        "bases": b,
        "uniques": u,
        "recipes": r
    }
    out = "/Users/saisi/.qclaw/workspace-54nuktoh8cd83kjj/poe2-guide/data/prices-data.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    size = len(json.dumps(data, ensure_ascii=False))
    print(f"✅ 已保存: {out} ({size} 字节)")

if __name__ == "__main__":
    main()
