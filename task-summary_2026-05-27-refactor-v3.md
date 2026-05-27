# POE2 导航站 - 参照宝藏导航重构

## 目标
完全参照 https://poe2.baozangdh.com 重构，以外部导航为主，浅色默认 + 夜间模式切换。

## 完成的核心变化

### 1. 首页完全参照宝藏导航
- 相同的链接数据（7大分类 30+ 链接，照搬 links.txt）
- 相同的卡片网格布局（6列→5→4→3→2→1 响应式）
- 相同的 favicon 自动加载（Yandex favicon API）
- 去掉必应搜索，改为站内链接搜索

### 2. 默认色调与宝藏导航一致
- 浅色主题（白底灰字）为默认
- 夜间模式通过 🌗 按钮切换
- 主题偏好保存 localStorage
- 遵循系统 prefers-color-scheme

### 3. 顶部导航栏
- 固定在顶部，切换到自有子页面
- 8个入口：首页/职业/BD/指南/地图/技能/资讯/工具
- 当前页面自动高亮（JS 检测路径名）
- 移动端汉堡菜单

### 4. 外部链接分类（照搬宝藏导航）
| 分类 | 链接数 |
|------|--------|
| 官方相关 | 7 |
| poe2社区 | 6 |
| 攻略站、数据库 | 2 |
| BD、抄作业 | 5 |
| 过滤器、查价器 | 7 |
| 小工具 | 8 |
| 网盘文件 | 2 |

### 5. 子页面统一新风格
- 浅色默认 + 夜间模式切换
- 顶部导航栏 + 当前页面高亮
- 子页面逻辑内联（减少文件依赖）
- 删除了旧的独立 JS 文件（app.js/classes.js/builds.js 等）

## 提交
- `663d878` refactor: 参照宝藏导航重构为浅色导航站+夜间模式

## 文件清单
- index.html - 导航首页（外部链接为主）
- css/style.css - 首页样式（变量+布局+响应式）
- css/pages.css - 子页面样式
- js/nav.js - 首页导航逻辑+链接数据+搜索+favicon
- js/data.js - 子页面共用数据（职业/BD/地图/资讯）
- classes.html / builds.html / guides.html / maps.html / news.html / tools.html - 可用子页面
- skills.html / tree.html / items.html / trade-calc.html / league.html - 开发中占位页