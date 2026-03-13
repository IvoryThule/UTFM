# Workflow: 项目初始化
## 触发条件
项目启动时执行一次。
## 前置条件
- Node.js 18+
- Git 可用
- 已阅读 docs/product/PRD.md
## 执行步骤
### Step 1: 初始化项目
```bash
npx create-next-app@latest university-food-map --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```
### Step 2: 调整目录到当前结构
```bash
mkdir -p src/frontend src/backend
mkdir -p src/frontend/{app,components/{ui,business,layout},hooks,lib,styles,types,data}
mkdir -p src/backend/{api,data,utils,mocks,services}
mkdir -p docs/{product,design,tech,deliverables}
mkdir -p agents/{prompts,workflows,skills,tools}
```
### Step 3: 配置别名
在 tsconfig.json 中补充：
- @frontend/* -> src/frontend/*
- @backend/* -> src/backend/*
### Step 4: 安装依赖
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge input tabs dialog sheet skeleton select
npm install lucide-react clsx tailwind-merge class-variance-authority
npm install @amap/amap-jsapi-loader
```
### Step 5: 配置样式与动画
- 在 src/frontend/styles/globals.css 加入基础样式
- 在 tailwind.config.ts 添加品牌色与常用动画
### Step 6: 建立基础布局
创建：
- AppShell
- BottomNav
- TopBar
- PageContainer
### Step 7: 建立类型与Mock数据骨架
- src/frontend/types/*
- src/backend/data/*
### Step 8: 建立基础API
先打通 GET /api/universities 或 GET /api/restaurants。
### Step 9: 启动验证
```bash
npm run dev
```
## 完成标准
- [ ] 本地可启动
- [ ] 路由可访问
- [ ] 目录与规范一致
- [ ] 至少一个API端点可返回数据
