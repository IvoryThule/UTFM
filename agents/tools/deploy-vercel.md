# Tool: 腾讯云部署
## 工具概述
将项目部署到腾讯云，生成可公网访问演示链接。
## 推荐方案
### CloudBase Webify（推荐）
- 支持 Next.js
- 可接入Git自动部署
- 国内访问稳定
### 备选方案
- 腾讯云轻量应用服务器（手工运维）
- COS静态托管（仅静态，不含API/SSR）
## 方案A：CloudBase Webify
1. 准备
```bash
npm install -g @cloudbase/cli
tcb login
```
2. 配置 cloudbaserc.json
3. 构建并部署
```bash
npm run build
tcb framework deploy
```
## 方案B：轻量服务器
1. 安装 Node、Nginx、PM2
2. 拉取仓库并构建
3. PM2 启动服务
4. Nginx 反向代理到 3000
## 部署前检查
- [ ] npm run build 成功
- [ ] npm run start 本地可跑
- [ ] 关键路由可直接访问
- [ ] /api/* 端点可用
## 部署后检查
- [ ] 首页可访问
- [ ] AI推荐链路可跑通
- [ ] 地图/详情/榜单页面正常
- [ ] 手机浏览器可用
## 文档回填
部署完成后更新：
- README.md
- docs/deliverables/presentation.md
