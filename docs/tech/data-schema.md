# 数据结构定义（Data Schema）

## 1. 设计目标

- 满足V1核心链路所需最小字段集。
- 字段命名清晰，便于前后端和AI推荐逻辑复用。
- 可平滑扩展到真实数据库模型。

## 2. 核心实体

### 2.1 University（高校）

```ts
type University = {
	id: string;
	name: string;
	city: string;
	lat: number;
	lng: number;
	campusTags: string[];
};
```

说明：用于学校切换、地图中心点定位、步行时间计算参考。

### 2.2 Restaurant（餐厅）

```ts
type Restaurant = {
	id: string;
	name: string;
	category: string;
	subCategory?: string;
	avgPrice: number;
	rating: number;
	reviewCount: number;
	studentHeat: number;
	tags: string[];
	address: string;
	lat: number;
	lng: number;
	openHours: string;
	isOpenNow?: boolean;
	discounts?: string[];
	mustOrder?: string[];
	imageUrl?: string;
	schoolDistance: Record<string, number>; // key: universityId, value: walkMinutes
};
```

说明：V1决策展示主实体，覆盖预算、距离、口碑、场景标签等关键决策信息。

### 2.3 Review（评价）

```ts
type Review = {
	id: string;
	restaurantId: string;
	universityId: string;
	authorType: "student" | "alumni";
	rating: number;
	content: string;
	sceneTags: string[];
	sentiment: "positive" | "neutral" | "negative";
	createdAt: string;
};
```

说明：用于详情页展示与摘要生成，V1不做复杂审核与反作弊机制。

### 2.4 RecommendationQuery（推荐请求）

```ts
type RecommendationQuery = {
	universityId: string;
	peopleCount?: number;
	budgetMax?: number;
	preferredTaste?: string[];
	preferredCategory?: string[];
	maxWalkMinutes?: number;
	scene?: "solo" | "date" | "group" | "night" | "budget";
	userInput?: string;
};
```

### 2.5 RecommendationItem（推荐结果项）

```ts
type RecommendationItem = {
	restaurantId: string;
	score: number;
	reasons: string[];
	matchedRules: string[];
};
```

## 3. 页面数据映射

| 页面 | 依赖实体 | 核心字段 |
|---|---|---|
| 首页 | University, Restaurant | name, avgPrice, studentHeat, schoolDistance |
| AI推荐页 | RecommendationQuery, RecommendationItem | budgetMax, scene, reasons |
| 地图页 | University, Restaurant | lat/lng, schoolDistance, category |
| 详情页 | Restaurant, Review | mustOrder, discounts, content, sceneTags |

## 4. 数据校验规则（V1）

- rating 取值范围：0-5
- avgPrice 必须大于0
- schoolDistance 至少包含一个学校键值
- 推荐结果 reasons 至少2条

## 5. Mock数据规模建议

- 高校：3-5所
- 餐厅：每校周边15-20家（总计50-80家）
- 评价：每家5-10条摘要源数据

## 6. 扩展预留

- UserPreference（用户偏好）
- Favorite（收藏关系）
- ShareVote（分享投票）
- MerchantCampaign（商户活动）

---

更新记录

- V1.0（2026-03-13）：首版数据结构定义。
