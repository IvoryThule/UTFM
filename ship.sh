#!/bin/bash
set -e

# ============================================================
# University Food Map - 本地构建 & 上传脚本
# 用法: bash ship.sh [user@host] [远程路径]
# 示例: bash ship.sh root@1.14.207.212
# ============================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
hr() { echo -e "${BLUE}────────────────────────────────────────${NC}"; }

SERVER="${1:-root@1.14.207.212}"
REMOTE_PATH="${2:-/var/www/UTFM}"
TAR_FILE="dist.tar.gz"

hr
log_info "目标服务器: ${SERVER}:${REMOTE_PATH}"

# ── 0. 检查本地依赖 ──────────────────────────────────────────
hr
log_info "检查本地环境..."
for cmd in node npm scp ssh; do
  if ! command -v "$cmd" &>/dev/null; then
    log_error "未找到命令: $cmd，请先安装"
    exit 1
  fi
done
log_ok "本地环境检查通过"

# ── 1. 安装依赖（如有变更）──────────────────────────────────
hr
log_info "检查依赖..."
npm install
log_ok "依赖已就绪"

# ── 2. 本地构建 ──────────────────────────────────────────────
hr
log_info "本地构建 Next.js（含 Linux Prisma 二进制）..."
npm run build
log_ok "构建成功"

# ── 3. 打包 standalone 产物 ──────────────────────────────────
hr
log_info "打包产物..."

DIST_WORK=$(mktemp -d)

# 将 standalone 输出解压到临时目录（作为根目录）
cp -r .next/standalone/. "$DIST_WORK/"

# 静态资源必须放在这个位置
mkdir -p "$DIST_WORK/.next"
cp -r .next/static "$DIST_WORK/.next/static"

# public 目录
cp -r public "$DIST_WORK/public"

# prisma 迁移文件（服务器启动时需要）
cp -r prisma "$DIST_WORK/prisma"

tar -czf "$TAR_FILE" -C "$DIST_WORK" .
rm -rf "$DIST_WORK"

SIZE=$(du -sh "$TAR_FILE" | cut -f1)
log_ok "打包完成，大小: ${SIZE}"

# ── 4. 上传到服务器 ──────────────────────────────────────────
hr
log_info "上传产物到服务器..."
scp "$TAR_FILE" "${SERVER}:${REMOTE_PATH}/${TAR_FILE}"
rm -f "$TAR_FILE"
log_ok "上传完成"

# ── 5. 远程执行部署 ──────────────────────────────────────────
hr
log_info "触发服务器部署..."
ssh "$SERVER" "cd ${REMOTE_PATH} && bash deploy.sh"
