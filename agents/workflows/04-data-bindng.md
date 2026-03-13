# Workflow: 数据接入与绑定
## 触发条件
页面与组件基础可用后执行。
## 前置检查
- src/backend/data/universities.ts
- src/backend/data/restaurants.ts
- src/backend/data/reviews.ts
- src/backend/data/categories.ts
## 执行步骤
### Step 1: API可用性检查
确保端点可返回数据：
- GET /api/universities
- GET /api/restaurants
- GET /api/restaurants/[id]
- GET /api/rankings
- GET /api/reviews
- POST /api/recommend
### Step 2: 前端请求统一
统一走 src/frontend/lib/api.ts，禁止页面直接fetch。
### Step 3: 状态管理
V1可用 React Context + useReducer 管理：
- currentUniversity
- favorites
- preference
### Step 4: 联动验证
- 切校后列表和距离变化
- AI推荐基于当前学校
- 收藏状态跨页面一致
### Step 5: 异常状态
所有请求必须有 loading/empty/error 展示。
## 完成标准
- [ ] 页面不再依赖硬编码假数据
- [ ] 高校切换联动正确
- [ ] 错误状态可见可恢复
- [ ] 推荐链路数据闭环可演示
