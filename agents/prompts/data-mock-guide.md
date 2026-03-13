# Data Mock Guide - 模拟数据生成规范

## 1. 目标与适用范围
本规范用于生成可演示、可联调、可扩展的模拟数据。
适用目录：

- src/frontend/data
- src/backend/mocks
- src/backend/services

核心目标：

1. 真实性：看起来像真实大学城数据。
2. 一致性：字段结构稳定，跨页面可复用。
3. 可解释性：推荐结果能追溯到明确字段。

## 2. 数据规模基线

- 高校：3-5 所
- 餐厅：每校 15-20 家
- 评价：每店 5-10 条
- 榜单：每类 >= 10 条
- 推荐样例：每场景 >= 6 组

说明：Demo 阶段优先保证“每校核心商圈”覆盖，不追求全量。

## 3. 真实性与一致性原则

### 3.1 必须真实

- 高校名称、基础地理坐标
- 菜系与价格区间匹配关系
- 步行时长相对合理

### 3.2 可模拟但要合理

- 餐厅名、优惠文案、学生标签
- 同校热度、推荐理由、评论文本

### 3.3 严禁问题

- 明显不合理定价（如简餐人均 200）
- 全部高分或评分过于整齐
- 不同学校出现同一店但距离冲突
- 评价高度模板化、无细节

## 4. 统一 Schema 规范

### 4.1 University

```ts
type University = {
	id: string;
	name: string;
	city: string;
	lat: number;
	lng: number;
	businessAreas: string[];
};
```

### 4.2 Restaurant

```ts
type Restaurant = {
	id: string;
	name: string;
	category: string;
	avgPrice: number;
	rating: number;
	reviewCount: number;
	studentHeat: number;
	universitiesNearby: Array<{
		universityId: string;
		walkMinutes: number;
		distanceMeters: number;
	}>;
	tags: string[];
	mustOrder: string[];
	discountText?: string;
	openHours: string;
	isOpenLateNight: boolean;
	coordinates: { lat: number; lng: number };
};
```

### 4.3 Review

```ts
type Review = {
	id: string;
	restaurantId: string;
	universityId: string;
	authorType: "undergrad" | "postgrad";
	rating: number;
	content: string;
	spendPerHead?: number;
	queueMinutes?: number;
	sceneTags: string[];
	createdAt: string;
};
```

### 4.4 RecommendationResult

```ts
type RecommendationResult = {
	requestId: string;
	inputs: {
		universityId: string;
		budget?: number;
		peopleCount?: number;
		preferredCategory?: string[];
		maxWalkMinutes?: number;
		scene?: string;
	};
	items: Array<{
		restaurantId: string;
		score: number;
		reasons: string[];
	}>;
};
```

## 5. 分布建议（防止数据失真）

### 5.1 评分分布

- 4.7-5.0: 10-15%
- 4.3-4.6: 45-55%
- 3.8-4.2: 25-30%
- 3.5-3.7: 8-12%

### 5.2 热度分布

- 2000+: 头部店（不超过 10%）
- 500-2000: 主流店（约 60%）
- <500: 长尾或新店（约 30%）

### 5.3 价格分布（参考）

- 10-20: 高性价比快餐
- 21-40: 主流正餐
- 41-80: 聚餐/约会场景
- 80+: 少量特色店

## 6. 标签与文案库建议

### 6.1 标签池

- 价格：#穷鬼快乐餐 #性价比之王
- 场景：#一个人不尴尬 #宿舍聚餐首选 #约会氛围感 #深夜食堂
- 体验：#出餐巨快 #排队半小时起 #外卖不翻车
- 口味：#辣到飞起 #清淡养胃 #重口快乐

### 6.2 评价文案规则

1. 使用学生语境，避免模板句。
2. 混合长短评，短评占比约 60%。
3. 至少 30% 评价含细节字段（价格/排队/分量）。
4. 保留中差评，提升可信度。

## 7. 生成流程（可执行）

1. 生成 University 列表。
2. 生成 Restaurant 列表并建立与高校关系。
3. 生成 Review 列表并校验引用完整性。
4. 生成榜单数据（热门、低价、新店）。
5. 生成 RecommendationResult 样例数据。
6. 运行一致性校验。

## 8. 一致性校验清单

- 每条 review.restaurantId 在 restaurant 中存在。
- 每家 restaurant 至少关联 1 所高校。
- 推荐结果 reasons 数量 >= 2。
- walkMinutes 与 distanceMeters 近似匹配。
- 数据总量满足第 2 节基线。

## 9. 输出文件建议

- src/frontend/data/universities.ts
- src/frontend/data/restaurants.ts
- src/frontend/data/reviews.ts
- src/frontend/data/categories.ts
- src/backend/mocks/recommendation-result.ts

## 10. 可复用 Prompt 模板

```text
请按 Data Mock Guide 生成 TypeScript 模拟数据，输出到以下模块：
1) universities.ts
2) restaurants.ts
3) reviews.ts
4) recommendation-result.ts

约束：
- 4 所高校，每校 18 家餐厅
- 每家 6-8 条评价
- 推荐结果每条含 >=2 条 reasons
- 保持评分/热度/价格分布合理

输出格式：
- 先给类型定义
- 再给数据常量
- 最后给校验结论（5条）
```
