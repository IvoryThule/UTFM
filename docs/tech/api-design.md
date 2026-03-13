# API 接口设计（API Design）

## 1. 设计原则

- 面向Demo：接口简单、可解释、易Mock。
- 面向扩展：字段与数据模型对齐，便于后续接真实服务。
- 面向体验：失败可恢复，返回信息可用于前端友好提示。

## 2. 接口列表（V1）

1. `GET /api/restaurants`
2. `POST /api/recommend`
3. `POST /api/summary`

## 3. 接口详情

### 3.1 获取餐厅列表

`GET /api/restaurants`

Query参数：

- `universityId`（必填）
- `category`（可选）
- `priceMin`（可选）
- `priceMax`（可选）
- `maxWalkMinutes`（可选）
- `scene`（可选）

成功响应示例：

```json
{
	"code": 0,
	"message": "ok",
	"data": {
		"total": 2,
		"items": [
			{
				"id": "r_001",
				"name": "张妈妈特色小面",
				"category": "川渝面食",
				"avgPrice": 18,
				"rating": 4.7,
				"studentHeat": 2847,
				"schoolDistance": { "u_pk": 8 },
				"tags": ["#穷鬼快乐餐", "#一个人也不尴尬"]
			}
		]
	}
}
```

### 3.2 AI推荐接口

`POST /api/recommend`

请求体示例：

```json
{
	"universityId": "u_pk",
	"peopleCount": 2,
	"budgetMax": 40,
	"preferredTaste": ["spicy"],
	"maxWalkMinutes": 12,
	"scene": "date",
	"userInput": "两个人约会，人均40以内，想吃辣的"
}
```

成功响应示例：

```json
{
	"code": 0,
	"message": "ok",
	"data": {
		"queryEcho": {
			"scene": "date",
			"budgetMax": 40,
			"maxWalkMinutes": 12
		},
		"items": [
			{
				"restaurantId": "r_101",
				"score": 0.91,
				"reasons": [
					"人均38元，符合预算",
					"距学校步行10分钟",
					"同校热度高，约会场景评价好"
				],
				"matchedRules": ["budget_match", "distance_match", "scene_match"]
			}
		]
	}
}
```

### 3.3 评价摘要接口

`POST /api/summary`

请求体示例：

```json
{
	"restaurantId": "r_101",
	"mode": "student_review"
}
```

成功响应示例：

```json
{
	"code": 0,
	"message": "ok",
	"data": {
		"summary": "学生普遍认为这家店氛围好、出片率高，周末排队较长，建议错峰到店。",
		"highlights": ["约会友好", "环境加分", "价格中等"],
		"riskNotes": ["高峰期等位20分钟+"]
	}
}
```

## 4. 统一错误码

| code | 含义 | 前端处理建议 |
|---|---|---|
| 0 | 成功 | 正常渲染 |
| 4001 | 参数缺失/格式错误 | 提示用户补充条件 |
| 4004 | 数据不存在 | 提示并返回推荐兜底列表 |
| 5000 | 服务异常 | 提供重试按钮 |

## 5. 性能与稳定性约束（Demo）

- 餐厅列表接口：期望响应 < 500ms（本地Mock）
- 推荐接口：期望响应 < 1500ms
- 失败重试：最多1次，避免重复请求风暴

## 6. 安全与边界（V1）

- V1不涉及用户登录，不返回敏感个人信息。
- 输入内容做基础长度与关键词校验，防止异常请求。
- 仅开放演示所需字段，避免过度暴露内部评分细节。

---

更新记录

- V1.0（2026-03-13）：首版API设计文档，覆盖V1三大核心接口。
