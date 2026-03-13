# Workflow: 部署上线
## 触发条件
完成打磨迭代后执行。
## 前置条件
- 构建通过
- 关键链路可跑
- 已确定部署平台（腾讯云优先）
## 执行步骤
### Step 1: 预发布检查
```bash
npm run build
npm run start
```
检查：
- 路由直达可用
- API正常
- 图片资源可加载
### Step 2: 代码提交
```bash
git add .
git commit -m "feat: release demo"
git push origin main
```
### Step 3: 平台部署
按 agents/tools/deploy-vercel.md 的腾讯云方案执行。
### Step 4: 部署后验收
- 首页、AI页、详情页、地图页、榜单页、个人页可访问
- 手机浏览器可用
- 推荐主链路可演示
### Step 5: 文档回填
更新：
- README.md
- docs/deliverables/presentation.md
- docs/deliverables/ai-usage-log.md
## 完成标准
- [ ] 线上URL可公开访问
- [ ] 核心功能可演示
- [ ] 交付文档已更新
