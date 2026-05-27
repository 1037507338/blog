# POE2 Hub - Supabase 后端集成完成

## 架构

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   前端      │─────▶│  Vercel API      │─────▶│  Supabase   │
│  (静态文件)  │      │  /api/links.js   │      │  PostgreSQL │
└─────────────┘      └──────────────────┘      └─────────────┘
                            │
                    使用 SUPABASE_SERVICE_KEY
                    (环境变量，不暴露前端)
```

## 数据库表结构

```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,          -- 改名避免保留字冲突
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '未分类',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API 端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/links` | 获取所有链接 |
| POST | `/api/links` | 新增链接 |
| PUT | `/api/links?id=xxx` | 更新链接 |
| DELETE | `/api/links?id=xxx` | 删除链接 |

## 环境变量 (Vercel)

- `SUPABASE_URL` - Supabase 项目 URL
- `SUPABASE_SERVICE_KEY` - service_role 密钥 (服务端专用)

## 已完成

- [x] Supabase 表创建 + 默认数据插入
- [x] Vercel Serverless API (`api/links.js`)
- [x] 前端 `nav.js` 从 API 加载数据
- [x] 管理后台 `admin.html` 完整 CRUD
- [x] 修复 `desc` → `description` (PostgreSQL 保留字)

## 待验证

- [ ] Vercel 重新部署后测试 API 响应
- [ ] 首页数据加载正常
- [ ] 管理后台增删改查正常