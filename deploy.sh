#!/bin/bash
set -e

# ============================================================
# University Food Map - 一键部署脚本
# 用法: bash deploy.sh
# ============================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
hr() { echo -e "${BLUE}────────────────────────────────────────${NC}"; }

# ── 0. 检查运行环境 ──────────────────────────────────────────
hr
log_info "检查运行环境..."

if [ "$(id -u)" -ne 0 ]; then
  log_error "请使用 root 用户运行此脚本 (或 sudo bash deploy.sh)"
  exit 1
fi

for cmd in docker git openssl; do
  if ! command -v "$cmd" &>/dev/null; then
    log_error "未找到命令: $cmd，请先安装"
    exit 1
  fi
done

# 兼容 docker compose (V2) 和 docker-compose (V1)
if docker compose version &>/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE="docker-compose"
else
  log_error "未找到 docker compose / docker-compose，请先安装"
  exit 1
fi

log_ok "环境检查通过 (compose: $COMPOSE)"

# ── 1. 拉取最新代码 ──────────────────────────────────────────
hr
log_info "拉取最新代码..."
git fetch --all
git reset --hard origin/$(git rev-parse --abbrev-ref HEAD)
log_ok "代码已更新"

# ── 2. 配置 .env ─────────────────────────────────────────────
hr
log_info "检查 .env 配置..."

if [ ! -f .env ]; then
  log_warn ".env 不存在，从 .env.example 创建..."
  cp .env.example .env
fi

# 读取当前 .env 中的值
APP_PORT=$(grep -E '^APP_PORT=' .env | cut -d= -f2 | tr -d '"' || echo "")
NEXTAUTH_URL_VAL=$(grep -E '^NEXTAUTH_URL=' .env | cut -d= -f2 | tr -d '"' || echo "")
NEXTAUTH_SECRET_VAL=$(grep -E '^NEXTAUTH_SECRET=' .env | cut -d= -f2 | tr -d '"' || echo "")

# 配置端口
if [ -z "$APP_PORT" ] || [ "$APP_PORT" = "8081" ]; then
  echo ""
  read -rp "  应用端口 [默认 8081]: " input_port
  APP_PORT="${input_port:-8081}"
  sed -i "s|^APP_PORT=.*|APP_PORT=${APP_PORT}|" .env
fi

# 配置 NEXTAUTH_URL
if [ -z "$NEXTAUTH_URL_VAL" ] || echo "$NEXTAUTH_URL_VAL" | grep -q "localhost"; then
  echo ""
  # 尝试自动获取公网IP
  SERVER_IP=$(curl -s --max-time 3 ifconfig.me 2>/dev/null || curl -s --max-time 3 api.ipify.org 2>/dev/null || echo "")
  if [ -n "$SERVER_IP" ]; then
    DEFAULT_URL="http://${SERVER_IP}:${APP_PORT}"
  else
    DEFAULT_URL="http://localhost:${APP_PORT}"
  fi
  read -rp "  NEXTAUTH_URL [默认 ${DEFAULT_URL}]: " input_url
  NEXTAUTH_URL_VAL="${input_url:-$DEFAULT_URL}"
  sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=${NEXTAUTH_URL_VAL}|" .env
fi

# 自动生成 NEXTAUTH_SECRET（如果是默认值 changeme）
if [ -z "$NEXTAUTH_SECRET_VAL" ] || [ "$NEXTAUTH_SECRET_VAL" = "changeme" ]; then
  log_info "自动生成 NEXTAUTH_SECRET..."
  NEW_SECRET=$(openssl rand -base64 32)
  sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${NEW_SECRET}|" .env
  log_ok "NEXTAUTH_SECRET 已生成"
fi

# 确保 DATABASE_URL 存在（migrate 步骤需要）
if ! grep -q '^DATABASE_URL=' .env; then
  echo "DATABASE_URL=file:/app/db/prod.db" >> .env
fi

log_ok ".env 配置完成"
echo ""
cat .env
echo ""

# ── 3. 构建 Docker 镜像 ───────────────────────────────────────
hr
log_info "构建 Docker 镜像（首次可能需要 3-5 分钟）..."
docker build -t university-food-map .
log_ok "镜像构建成功"

# ── 4. 停止旧容器 ────────────────────────────────────────────
hr
log_info "停止旧容器..."
$COMPOSE down --remove-orphans 2>/dev/null || true
log_ok "旧容器已停止"

# ── 5. 数据库迁移 ────────────────────────────────────────────
hr
log_info "执行 Prisma 数据库迁移..."
mkdir -p ./db_data

docker run --rm \
  -v "$(pwd)/db_data:/app/db" \
  -e DATABASE_URL=file:/app/db/prod.db \
  university-food-map \
  npx prisma migrate deploy

log_ok "数据库迁移完成"

# ── 6. 启动服务 ──────────────────────────────────────────────
hr
log_info "启动服务..."
$COMPOSE up -d
log_ok "服务已启动"

# ── 7. 等待并检查健康状态 ────────────────────────────────────
hr
log_info "等待服务就绪（最多 30 秒）..."
APP_PORT_NUM=$(grep -E '^APP_PORT=' .env | cut -d= -f2 | tr -d '"')
APP_PORT_NUM="${APP_PORT_NUM:-8081}"

for i in $(seq 1 15); do
  if curl -sf "http://localhost:${APP_PORT_NUM}" >/dev/null 2>&1; then
    log_ok "服务已就绪！"
    break
  fi
  echo -n "."
  sleep 2
done
echo ""

# ── 8. 完成 ──────────────────────────────────────────────────
hr
FINAL_URL=$(grep -E '^NEXTAUTH_URL=' .env | cut -d= -f2 | tr -d '"')
echo -e "${GREEN}"
echo "  ✓ 部署成功！"
echo "  ✓ 访问地址: ${FINAL_URL}"
echo -e "${NC}"
hr
log_info "查看实时日志: $COMPOSE logs -f"
log_info "停止服务:     $COMPOSE down"
log_info "重启服务:     $COMPOSE restart"
hr
