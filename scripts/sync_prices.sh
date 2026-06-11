#!/bin/bash
# POE2 物价数据定时同步脚本
# 每小时从腾讯文档同步数据并推送到 GitHub

set -e  # 遇到错误立即退出

# 切换到项目目录
cd /Users/saisi/.qclaw/workspace-54nuktoh8cd83kjj/poe2-guide

echo "🔄 开始同步 POE2 物价数据..."
echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"

# 拉取最新代码（避免冲突）
git fetch origin
git reset --hard origin/master

# 调用 Python 脚本生成 JSON（通过 OpenClay agent）
# 注意：实际执行时需要通过 OpenClaw 调度
python3 scripts/generate_prices_data.py

# 检查是否有变更
if git diff --quiet data/prices-data.json; then
    echo "ℹ️  数据无变化，跳过提交"
    exit 0
fi

# 提交并推送
git add data/prices-data.json
git commit -m "chore: 自动更新物价数据 $(date '+%Y-%m-%d %H:%M')"
git push origin master

echo "✅ 物价数据已同步并推送到 GitHub"
