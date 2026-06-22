# 方案B：构建工具迁移规划

## 目标
将 POE2 Hub 从纯静态 HTML 站迁移到构建工具驱动，实现导航栏、页头页脚等组件化复用。

## 技术选型对比

| 工具 | 构建速度 | 学习成本 | 模板语法 | 生态 | 推荐度 |
|------|---------|---------|---------|------|--------|
| Vite + vite-plugin-html | ⚡ 极快 | 低 | 普通HTML+partial | 丰富 | ★★★★★ |
| 11ty (Eleventy) | 快 | 低 | 多模板引擎 | 成熟 | ★★★★ |
| Astro | 快 | 中 | .astro组件 | 新兴 | ★★★ |

**推荐：Vite + vite-plugin-html**
- 保留现有 HTML 文件结构，改动最小
- HTML partial 用简单的 `include` 即可
- Vite 内置 HMR 开发体验好
- Vercel 原生支持 Vite 项目

## 迁移步骤

### Phase 1：项目初始化（~30分钟）
1. `npm init -y` 初始化 package.json
2. `npm install vite vite-plugin-html --save-dev`
3. 创建 `vite.config.js`，配置：
   - 输入：根目录下的 `*.html`
   - 输出：`dist/`
   - `vite-plugin-html` 处理 HTML include
   - `build.emptyOutDir: true`
4. 创建 `.gitignore` 添加 `node_modules/`、`dist/`
5. 创建 `vercel.json` 指定 build command：
   ```json
   { "buildCommand": "npx vite build", "outputDirectory": "dist" }
   ```

### Phase 2：组件抽取（~1小时）
1. 创建 `src/partials/nav.html` — 导航栏
2. 创建 `src/partials/footer.html` — 页脚（如果有）
3. 创建 `src/partials/head-common.html` — 公共 head 内容（CSS、字体）
4. 每个页面用 `<!-- include:src/partials/nav.html -->` 替换导航 HTML

### Phase 3：页面迁移（~1-2小时）
1. 将所有 HTML 移入 `src/pages/` 或保持在根目录
2. 配置 Vite 的 multi-page 入口
3. 调整所有 `fetch()` 路径（开发时 Vite 有 base path）
4. 调整 CSS/JS 引用路径

### Phase 4：数据文件处理（~30分钟）
1. `data/*.json` — Vite 会自动拷贝到 dist
2. `builds/*.html` — 需配置 `vite-plugin-static-copy` 或放 public/
3. `scripts/*.py` — 不受影响，保持原位

### Phase 5：部署切换（~15分钟）
1. Vercel settings → Build Command: `npx vite build`
2. Output Directory: `dist`
3. 清除旧缓存，测试部署

## 影响范围

| 项目 | 当前状态 | 迁移后 |
|------|---------|--------|
| 部署方式 | git push → 直接静态 | git push → Vercel build → 静态 |
| 部署耗时 | ~5秒 | ~30-60秒（含 install + build） |
| 页面结构 | 8个独立HTML | 8个HTML + partials |
| 导航修改 | 改8个文件 | 改1个partial |
| CSS | 内联 + 外链 | 统一外链（可选移除内联） |
| JS | 页面内script + common.js | 不变 |
| 数据文件 | 直接在根目录 | public/ 或自动拷贝 |
| 开发体验 | 刷新浏览器 | HMR 热更新 |

## 风险与注意事项

1. **路径问题**：Vite dev server 的 base path 可能与生产不同
2. **JSON 数据加载**：开发时 fetch 路径可能需要调整
3. **构建依赖**：`node_modules` 增加仓库体积（可通过 .gitignore 排除）
4. **Python 脚本**：完全不受影响，但在 Vercel 上不执行（仅在 cron serverless 中运行）
5. **回退方案**：保留当前纯静态文件在 git history，随时可回退

## 何时执行

当以下任一条件满足时，建议启动迁移：
- 导航栏频繁变更（新增/调整页面）
- 需要抽取更多共享组件（footer、header、侧边栏）
- 需要引入 SASS/PostCSS 等预处理
- 团队协作需要模板化

## 替代方案

如果只需要共享导航栏且不想引入构建工具，已完成方案A（common.js 动态注入）作为轻量替代。
