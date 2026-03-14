#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# University Food Map - 服务器部署脚本
# 由 ship.sh 自动触发，或手动执行: bash deploy.sh
# 前置条件: dist.tar.gz 已上传到本目录
# ============================================================

# === 配置区 ===
PROJECT_DIR="/var/www/UTFM"
CURRENT_DIR="$PROJECT_DIR/current"
DB_DIR="$PROJECT_DIR/db_data"
TAR="$PROJECT_DIR/dist.tar.gz"
APP_NAME="university-food-map"
LOGFILE="/var/log/utfm_deploy.log"
NGINX_CONF_SRC="$CURRENT_DIR/deploy/nginx.conf"
NGINX_CONF_DEST="/etc/nginx/sites-enabled/utfm.conf"

echo -e "\033[0;32m=== 开始部署 University Food Map $(date) ===\033[0m" | tee -a "$LOGFILE"

# ── Step 1: 检查产物包 ────────────────────────────────────────
echo ">>> Step 1: 检查产物包..." | tee -a "$LOGFILE"
if [ ! -f "$TAR" ]; then
  echo "❌ 未找到 $TAR，请先在本地执行 bash ship.sh" | tee -a "$LOGFILE"
  exit 1
fi
echo "✅ 找到产物包 $(du -sh "$TAR" | cut -f1)" | tee -a "$LOGFILE"

# ── Step 2: 检查 Node.js 20+ ──────────────────────────────────
echo ">>> Step 2: 检查 Node.js..." | tee -a "$LOGFILE"
NODE_MAJOR=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Node.js 版本不足 (当前: $(node -v 2>/dev/null || echo '未安装'))，安装 Node.js 20..." | tee -a "$LOGFILE"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "✅ Node.js $(node -v)" | tee -a "$LOGFILE"

# ── Step 3: 检查 PM2 ──────────────────────────────────────────
echo ">>> Step 3: 检查 PM2..." | tee -a "$LOGFILE"
if ! command -v pm2 >/dev/null; then
  echo "安装 PM2..." | tee -a "$LOGFILE"
  npm install -g pm2
fi
echo "✅ PM2 $(pm2 -v)" | tee -a "$LOGFILE"

# ── Step 4: 检查 .env ─────────────────────────────────────────
echo ">>> Step 4: 检查 .env..." | tee -a "$LOGFILE"
if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo "⚠️  $PROJECT_DIR/.env 不存在，请创建后重试" | tee -a "$LOGFILE"
  echo ""
  echo "最小配置示例:"
  echo "  APP_PORT=8081"
  echo "  NEXTAUTH_URL=http://<服务器IP>:8081"
  echo "  NEXTAUTH_SECRET=$(openssl rand -base64 32)"
  exit 1
fi
# 确保 DATABASE_URL 指向持久目录（current/ 每次部署都会被覆盖）
if grep -q '^DATABASE_URL=' "$PROJECT_DIR/.env"; then
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=file:$DB_DIR/prod.db|" "$PROJECT_DIR/.env"
else
  echo "DATABASE_URL=file:$DB_DIR/prod.db" >> "$PROJECT_DIR/.env"
fi
echo "✅ .env 已就绪" | tee -a "$LOGFILE"

# ── Step 5: 解压产物 ──────────────────────────────────────────
echo ">>> Step 5: 解压产物到 $CURRENT_DIR ..." | tee -a "$LOGFILE"
mkdir -p "$DB_DIR"
rm -rf "$CURRENT_DIR"
mkdir -p "$CURRENT_DIR"
tar -xzf "$TAR" -C "$CURRENT_DIR"
rm -f "$TAR"
echo "✅ 产物已解压" | tee -a "$LOGFILE"

# ── Step 6: 数据库迁移 ────────────────────────────────────────
echo ">>> Step 6: 数据库迁移..." | tee -a "$LOGFILE"
cd "$CURRENT_DIR"
DATABASE_URL="file:$DB_DIR/prod.db" npx --yes prisma@5 migrate deploy
cd "$PROJECT_DIR"
echo "✅ 数据库迁移完成" | tee -a "$LOGFILE"

# ── Step 7: PM2 重启 ──────────────────────────────────────────
echo ">>> Step 7: 重启服务 (PM2)..." | tee -a "$LOGFILE"
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 reload "$PROJECT_DIR/ecosystem.config.js" --update-env
else
  pm2 start "$PROJECT_DIR/ecosystem.config.js"
  pm2 startup systemd -u root --hp /root 2>/dev/null || true
fi
pm2 save
echo "✅ 服务已启动" | tee -a "$LOGFILE"

# ── Step 8: Nginx 配置（可选）────────────────────────────────
echo ">>> Step 8: Nginx 配置..." | tee -a "$LOGFILE"
if [ -f "$NGINX_CONF_SRC" ]; then
  ln -sf "$NGINX_CONF_SRC" "$NGINX_CONF_DEST"
  if nginx -t 2>/dev/null; then
    systemctl reload nginx
    echo "✅ Nginx 已更新" | tee -a "$LOGFILE"
  else
    echo "⚠️  Nginx 配置有误，跳过重载（服务仍在 PM2 上运行）" | tee -a "$LOGFILE"
  fi
else
  echo "⚠️  未找到 deploy/nginx.conf，跳过（直接通过端口访问亦可）" | tee -a "$LOGFILE"
fi

# ── 完成 ──────────────────────────────────────────────────────
APP_PORT=$(grep -E '^APP_PORT=' "$PROJECT_DIR/.env" | cut -d= -f2 | tr -d '"' || echo "3000")
echo -e "\033[0;32m=== 部署完成 $(date) ===\033[0m" | tee -a "$LOGFILE"
echo ""
pm2 status "$APP_NAME"
echo ""
echo "访问地址: http://$(curl -s --max-time 3 ifconfig.me 2>/dev/null || echo 'localhost'):${APP_PORT}"
echo "查看日志: pm2 logs $APP_NAME"
echo "重启服务: pm2 restart $APP_NAME"
