import { restaurants } from "@backend/data/restaurants";
import type { ParsedIntent, RecommendItem, Scene } from "@backend/types";

const SCENE_KEYWORDS: Array<{ scene: Scene; words: string[] }> = [
	{ scene: "solo", words: ["一个人", "自己", "独食"] },
	{ scene: "date", words: ["约会", "情侣", "纪念日"] },
	{ scene: "group", words: ["聚餐", "团建", "室友", "同学"] },
	{ scene: "late-night", words: ["夜宵", "深夜", "半夜"] },
	{ scene: "budget", words: ["便宜", "省钱", "穷"] }
];

const CATEGORY_KEYWORDS: Array<{ category: string; words: string[] }> = [
	{ category: "面食", words: ["面", "拉面", "小面"] },
	{ category: "火锅", words: ["火锅", "锅"] },
	{ category: "中餐", words: ["中餐", "炒菜", "盖饭"] },
	{ category: "日韩", words: ["日料", "韩餐", "寿司"] },
	{ category: "烧烤", words: ["烧烤", "烤肉", "串"] },
	{ category: "奶茶", words: ["奶茶", "咖啡", "饮品"] }
];

function parseIntent(input: string, university: string): ParsedIntent {
	const parsed: ParsedIntent = {
		nearUniversity: university,
		confidence: 0.4
	};

	const budgetMatch = input.match(/(\d+)\s*(元|块)?\s*(以内|以下|左右)?/);
	if (budgetMatch) {
		parsed.budget = { max: Number(budgetMatch[1]) };
		parsed.confidence += 0.2;
	}

	for (const item of CATEGORY_KEYWORDS) {
		if (item.words.some((word) => input.includes(word))) {
			parsed.category = item.category;
			parsed.confidence += 0.2;
			break;
		}
	}

	for (const item of SCENE_KEYWORDS) {
		if (item.words.some((word) => input.includes(word))) {
			parsed.scene = item.scene;
			parsed.confidence += 0.2;
			break;
		}
	}

	parsed.confidence = Math.min(1, parsed.confidence);
	return parsed;
}

function buildReasons(avgPrice: number, walkMinutes: number, studentCount: number, rating: number): string[] {
	const reasons = [
		`人均${avgPrice}元，预算友好`,
		`步行约${walkMinutes}分钟可达`,
		`${studentCount}位同学推荐，评分${rating.toFixed(1)}`
	];
	return reasons.slice(0, 2);
}

export function recommendRestaurants(input: string, university: string, history: string[] = []): {
	intent: ParsedIntent;
	recommendations: RecommendItem[];
	fallbackSuggestions?: string[];
} {
	const intent = parseIntent(input, university);

	const candidates = restaurants
		.filter((restaurant) => !history.includes(restaurant.id))
		.filter((restaurant) => {
			if (intent.category && restaurant.category !== intent.category) {
				return false;
			}
			if (intent.budget?.max && restaurant.avgPrice > intent.budget.max * 1.2) {
				return false;
			}
			if (intent.scene && !restaurant.scenes.includes(intent.scene)) {
				return false;
			}
			return true;
		})
		.map((restaurant) => {
			const walkMinutes = restaurant.distances.find((item) => item.universityId === university)?.walkMinutes ?? 18;
			const score =
				restaurant.rating * 15 +
				restaurant.studentCount / 120 +
				Math.max(0, 20 - walkMinutes) +
				(intent.budget?.max ? Math.max(0, intent.budget.max - restaurant.avgPrice) : 0);

			return {
				restaurantId: restaurant.id,
				score,
				reasons: buildReasons(restaurant.avgPrice, walkMinutes, restaurant.studentCount, restaurant.rating)
			};
		})
		.sort((a, b) => b.score - a.score)
		.slice(0, 3);

	if (!candidates.length) {
		return {
			intent,
			recommendations: [],
			fallbackSuggestions: ["放宽预算条件", "扩大步行范围", "尝试其他品类"]
		};
	}

	return {
		intent,
		recommendations: candidates
	};
}
