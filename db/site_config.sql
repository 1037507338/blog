-- 站点全局配置 KV 表
-- 在 Supabase SQL Editor 执行一次即可

create table if not exists site_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- 初始化国服倒计时开关（默认关闭）
insert into site_config (key, value)
values ('poe2_cn_countdown', 'false'::jsonb)
on conflict (key) do nothing;
