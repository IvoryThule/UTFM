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

# ── 参数配置 ─────────────────────────────────────────────────
SERVER="${1:-root@1.14.207.212}"
REMOTE_PATH="${2:-/var/www/UTFM}"
IMAGE_NAME="university-food-map"
TAR_FILE="${IMAGE_NAME}.tar.gz"

hr
log_info "目标服务器: ${SERVER}:${REMOTE_PATH}"

# ── 0. 检查本地依赖 ──────────────────────────────────────────
hr
log_info "检查本地环境..."
for cmd in docker scp ssh; do
  if ! command -v "$cmd" &>/dev/null; then
    log_error "未找到命令: $cmd，请先安装"
    exit 1
  fi
done
log_ok "本地环境检查通过"

# ── 1. 本地构建 Docker 镜像 ─────────────────────────────────
hr
log_info "本地构建 Docker 镜像..."
docker build -t "$IMAGE_NAME" .
log_ok "镜像构建成功"

# ── 2. 导出镜像为压缩包 ──────────────────────────────────────
hr
log_info "导出镜像（可能需要约 1 分钟）..."
docker save "$IMAGE_NAME" | gzip > "/tmp/${TAR_FILE}"
SIZE=$(du -sh "/tmp/${TAR_FILE}" | cut -f1)
log_ok "镜像打包完成，大小: ${SIZE}"

# ── 3. 上传到服务器 ──────────────────────────────────────────
hr
log_info "上传镜像到服务器..."
scp "/tmp/${TAR_FILE}" "${SERVER}:${REMOTE_PATH}/${TAR_FILE}"
rm "/tmp/${TAR_FILE}"
log_ok "上传完成"

# ── 4. 远程执行部署 ──────────────────────────────────────────
hr
log_info "触发服务器部署..."
ssh "$SERVER" "cd ${REMOTE_PATH} && bash deploy.sh"
