-- 用户收藏表（大盘行情）—— 与 Supabase Auth 用户绑定
-- 在 Supabase SQL Editor 执行一次即可
--
-- 另需在 Supabase 控制台配置（一期）：
--   1) Authentication → Providers → Email：保持开启
--   2) Authentication → 邮箱验证（Confirm email）：一期建议关闭以降低注册摩擦，后续可开
--   3) Vercel 环境变量新增 SUPABASE_ANON_KEY（项目 Settings → API 的 anon public key）

create table if not exists user_favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_name  text not null,
  created_at timestamptz default now(),
  primary key (user_id, item_name)
);

-- 行级安全：每个登录用户只能读写自己的收藏
alter table user_favorites enable row level security;

drop policy if exists "own_select" on user_favorites;
drop policy if exists "own_insert" on user_favorites;
drop policy if exists "own_delete" on user_favorites;

create policy "own_select" on user_favorites
  for select using (auth.uid() = user_id);

create policy "own_insert" on user_favorites
  for insert with check (auth.uid() = user_id);

create policy "own_delete" on user_favorites
  for delete using (auth.uid() = user_id);
