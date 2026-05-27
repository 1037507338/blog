# POE2 国服攻略站 - 导航门户重构

## 目标
参照 poe2.baozangdh.com 导航站风格，将网站从单页滚动站重构为真正的多页面导航门户。

## 核心原则
1. **首页作为导航集散地**：外部链接 + 内部工具入口
2. **每个板块有独立页面**：不再使用锚点假入口
3. **开发中页面真实存在**：有页面、有说明、有替代链接
4. **所有链接可点击**：要么跳外部站，要么跳内部真实页

## 页面结构

### 首页（index.html）
**外部资源导航**（5大类 28+ 个真实外部链接）：
- 🏛️ 官方渠道：国服官网、国际服、POE2 Wiki、POE Wiki、国服公告
- 📊 百科攻略：Maxroll、POE2 Ninja、POE2 Dev、POE Builds、POEDB、POE Skill
- 💰 交易平台：官方交易、poe2.trade、POE XYZ、Sellerings、POE2 Market、POE2.CC
- 👥 社区论坛：Reddit、Discord、官方论坛、国服论坛、POE2 Map Info、POE2 Guide
- 📺 媒体视频：B站、YouTube、Twitch、国服视频、Liquipedia、Blessing Fitness

**站内工具入口**（10个入口）：
- ✅ 可用：职业详解、热门BD、新手指南、地图大全、资讯动态、工具总览
- 🚧 开发中：技能数据库、天赋模拟器、物品百科、交易计算器、联赛专题

### 内部页面
| 页面 | 状态 | 内容 |
|------|------|------|
| classes.html | ✅ 可用 | 职业详解、36进阶、天赋概览、武器专精、属性系统 |
| builds.html | ✅ 可用 | BD推荐、T0/T1分级、职业筛选、评级说明 |
| guides.html | ✅ 可用 | 8大系统新手指南、侧边目录、滚动高亮 |
| maps.html | ✅ 可用 | Waystone系统、T1-T10地图、8种生物群落 |
| news.html | ✅ 可用 | 5条资讯、分类筛选、官方渠道链接 |
| tools.html | ✅ 可用 | 所有工具一览（已上线/开发中对比） |
| skills.html | 🚧 开发中 | 技能数据库预览 + 外部Wiki替代 |
| tree.html | 🚧 开发中 | 天赋模拟器预告 + 外部数据替代 |
| items.html | 🚧 开发中 | 物品百科预告 + POEDB替代 |
| trade-calc.html | 🚧 开发中 | 交易计算器预告 + 官方交易替代 |
| league.html | 🚧 开发中 | 联赛专题预告 + 国服/国际服赛季页替代 |

## 提交记录
- `ee6e26c` refactor: 全面重构为导航门户站

## 下一步
1. 替换占位图片为真实 POE2 游戏截图
2. 开发天赋模拟器（需要大量节点数据）
3. 开发物品百科（需逐一整理词缀）
4. SEO meta 标签优化
5. Vercel 部署验证