# POE2 Hub - Bug修复 + 管理后台

## Bug 修复 (f4fab34)

### 主题切换按钮不显示
- **原因**: top:5px 导致被导航栏(z-index:1000)遮挡, 且自身z-index只有100
- **修复**: z-index提升到1100, top改为6px, 尺寸34x34px圆角17px

### 搜索框位置异常
- **原因**: .search-container.compact 的 margin-top:60px(为旧header留的空间) + 强制height:40px与内部44px元素冲突
- **修复**: margin-top改为16px, 去掉强制高度限制

## 新增管理后台 (admin.html)

### 架构设计
```
data/links.json (Git管理的默认数据)
    ↓ fetch (nav.js 首次加载)
localStorage['poe2_links'] (管理员编辑后的数据, 优先读取)
    ↓ CRUD操作
admin.html (管理界面)
```

### 核心功能
1. **CRUD**: 新增/编辑/删除导航链接
2. **筛选**: 分类标签 + 关键词搜索
3. **导入导出**: JSON格式, 支持跨设备同步
4. **重置**: 一键恢复默认数据
5. **统计面板**: 总链接数/分类数/国服相关数/数据状态

### 数据流
- 默认数据: data/links.json (37条链接, 7个分类)
- 用户编辑: 存入 localStorage
- 加载优先级: localStorage > JSON文件
- 重置: 删除 localStorage, 重新fetch JSON

### 入口
- 导航栏右侧半透明"管理"链接 → admin.html

## 文件变更
- index.html: 修复+添加管理入口
- css/style.css: 修复theme-toggle和search位置
- css/pages.css: 同步theme-toggle z-index修复
- js/nav.js: 重写为从JSON加载+localStorage覆盖
- data/links.json: 新建, 从硬编码JS迁移出来的默认数据
- admin.html: 新建, 完整管理后台