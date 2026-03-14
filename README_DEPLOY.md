# University Food Map 部署指南 (腾讯云)

本指南介绍如何在腾讯云轻量应用服务器 (Lighthouse) 或云服务器 (CVM) 上部署该项目。建议使用 **Lighthouse (轻量应用服务器)**，因为它配置简单且包含应用镜像。

## 准备工作

1.  **购买服务器**:
    *   推荐购买 **Docker CE** 应用镜像的轻量应用服务器 (Lighthouse)。
    *   操作系统推荐: **Ubuntu 20.04/22.04 LTS** 或 **Debian 11**。
    *   地域: 选择离你目标用户最近的地域 (如上海/北京)。
    *   建议配置: 2核 4G 以上 (Next.js 编译和运行需要一定内存)。

2.  **本地环境**:
    *   安装 Docker 和 Docker Compose (如果本地构建)。
    *   或者安装 Node.js 18+ (如果本地跑)。

## 部署方案一：Docker 容器化部署 (推荐)

此方案最稳定，环境一致性好。

### 1. 修改配置
确保 `next.config.js` 中包含 `output: 'standalone'` (已自动添加)。

### 2. 构建镜像 (在本地或服务器上)

**在服务器上构建:**
1.  将代码上传到服务器 (使用 Git 或 SCP)。
2.  进入项目目录。
3.  运行构建命令:
    ```bash
    docker build -t university-food-map .
    ```

**或者在本地构建并推送:**
1.  `docker build -t your-registry/university-food-map:latest .`
2.  `docker push your-registry/university-food-map:latest`
3.  在服务器上 `docker pull your-registry/university-food-map:latest`

### 3. 启动服务

### 3. 配置环境变量与端口

如果您的服务器 3000 端口已被占用，或希望使用其他端口：

1.  复制环境变量示例文件：
    ```bash
    cp .env.example .env
    ```

2.  修改 `.env` 文件：
    ```ini
    # 设置应用监听的宿主机端口（例如改为 3001）
    APP_PORT=3001
    
    # 设置您的域名或 IP（NextAuth 需要知道对外访问地址）
    NEXTAUTH_URL=http://your-server-ip:3001
    
    # 生成随机密钥
    NEXTAUTH_SECRET=changeme
    ```

### 4. 启动服务

运行:
```bash
docker-compose up -d
```

查看日志:
```bash
docker-compose logs -f
```

### 5. 配置 Nginx 反向代理 (可选但推荐)

为了使用 HTTPS 和域名，建议在 Docker 容器前配置 Nginx。
**注意**：如果您在 `.env` 中更改了 `APP_PORT` (例如 3001)，请同步修改 Nginx 中的 `proxy_pass`。

简易 Nginx 配置 (`/etc/nginx/sites-available/food-map`):

```nginx
server {
    listen 80;
    server_name your-domain.com; # 替换为你的域名或 IP

    location / {
        proxy_pass http://localhost:3001; # 这里填写您配置的 APP_PORT
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置: `ln -s /etc/nginx/sites-available/food-map /etc/nginx/sites-enabled/` 并重启 Nginx。

---

## 部署方案二：PM2 传统部署

适合不熟悉 Docker 的用户。

1.  **环境安装**:
    ```bash
    # 安装 Node.js 18+
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # 安装 PM2
    sudo npm install -g pm2
    ```

2.  **上传代码**:
    将项目上传此服务器。

3.  **安装依赖与构建**:
    ```bash
    npm install
    npx prisma generate
    npm run build
    ```

4.  **启动服务**:
    ```bash
    pm2 start npm --name "food-map" -- start
    pm2 save
    pm2 startup
    ```

## 数据库说明
本项目使用 **SQLite**。
*   Docker 部署时，数据库文件会持久化在 `db_data` 卷中。
*   PM2 部署时，数据库文件位于项目根目录 `dev.db` (或 `prisma/dev.db`)。

## CI/CD (进阶)
可以使用 GitHub Actions 自动构建 Docker 镜像并部署到腾讯云。
需要在 Secrets 中配置 `TENCENT_CLOUD_IP`, `SSH_KEY` 等。
