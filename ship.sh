#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# University Food Map - 本地打包上传脚本
# 前置条件: 已执行 npm run build（.next/standalone 存在）
# 用法: bash ship.sh [user@host] [远程路径]
# ============================================================

# === 配置区 ===
SERVER="${1:-root@1.14.207.212}"
REMOTE_PATH="${2:-/var/www/UTFM}"
TAR="dist.tar.gz"

echo -e "\033[0;34m=== 打包上传 University Food Map $(date) ===\033[0m"

# ── 检查产物是否存在 ─────────────────────────────────────────
if [ ! -d ".next/standalone" ]; then
  echo "❌ 未找到 .next/standalone，请先执行 npm run build"
  exit 1
fi
if [ ! -d ".next/static" ]; then
  echo "❌ 未找到 .next/static，请先执行 npm run build"
  exit 1
fi

# ── 打包产物 ─────────────────────────────────────────────────
echo ">>> 打包产物..."

DIST_WORK=$(mktemp -d)
trap 'rm -rf "$DIST_WORK" "$TAR" 2>/dev/null' EXIT

# standalone 作为运行根目录
cp -r .next/standalone/. "$DIST_WORK/"

# 静态资源（放到 standalone 内部对应位置）
mkdir -p "$DIST_WORK/.next"
cp -r .next/static "$DIST_WORK/.next/static"

# public 目录
cp -r public "$DIST_WORK/public"

# prisma 迁移文件（服务器启动前执行 migrate）
cp -r prisma "$DIST_WORK/prisma"

tar -czf "$TAR" -C "$DIST_WORK" .

SIZE=$(du -sh "$TAR" | cut -f1)
echo "✅ 打包完成，大小: ${SIZE}"

# ── 上传到服务器 ──────────────────────────────────────────────
echo ">>> 上传到服务器 ${SERVER}:${REMOTE_PATH} ..."
scp "$TAR" "${SERVER}:${REMOTE_PATH}/${TAR}"
scp ecosystem.config.js "${SERVER}:${REMOTE_PATH}/ecosystem.config.js"
echo "✅ 上传完成"

# ── 触发服务器部署 ────────────────────────────────────────────
echo ">>> 触发部署..."
ssh "$SERVER" "cd ${REMOTE_PATH} && bash deploy.sh"

trap - EXIT
rm -f "$TAR"
