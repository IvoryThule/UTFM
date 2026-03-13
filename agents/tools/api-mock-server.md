# Tool: Mock API 服务
## 工具概述
为 Demo 提供标准HTTP接口，前端通过统一 API 层访问，模拟真实后端行为。
## 目录约定（按当前项目）
- src/backend/api/
- src/backend/data/
- src/backend/utils/
- src/frontend/lib/api.ts
## 推荐端点
- GET /api/universities
- GET /api/restaurants
- GET /api/restaurants/[id]
- GET /api/rankings
- GET /api/reviews
- POST /api/recommend
## 通用响应格式
成功：
```json
{ "code": 0, "data": {} }
```
失败：
```json
{ "code": -1, "message": "error message" }
```
## 行为规范
1. 支持筛选、排序、分页（列表接口）
2. 支持模拟延迟 100-300ms
3. 错误格式统一
4. 不做写入（V1只读）
## 前端调用规范
- 禁止页面直接 fetch
- 统一走 src/frontend/lib/api.ts
- 请求失败必须有 UI 兜底（empty/error）
## 验收标准
- [ ] 所有端点可访问并返回统一格式
- [ ] restaurants 支持筛选排序分页
- [ ] recommend 可返回 intent 与 recommendations
- [ ] 前端统一使用 api.ts 封装
- [ ] 错误场景可被前端正确展示
