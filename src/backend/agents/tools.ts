/**
 * Agent Tools — DynamicStructuredTool definitions for the AI agent.
 * Uses zod schemas (like EasyStay) so that LLM can natively decide tool calls via bindTools().
 * Tools receive restaurant data from a closure at creation time.
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export interface RestaurantContext {
  id: string;
  name: string;
  category: string;
  avgPrice: number;
  rating: number;
  distance?: number;
  tags?: string[];
  scenes?: string[];
  isOpenLateNight?: boolean;
  mustOrderDishes?: string[];
  studentCount?: number;
  studentDiscount?: string;
  openHours?: string;
}

/**
 * Create tool instances bound to the given restaurant data.
 * Each request creates new tool instances with the current data context.
 */
export function createTools(restaurants: RestaurantContext[]): DynamicStructuredTool[] {
  const dinnerCategories = ["中餐", "火锅", "烧烤", "日韩", "面食", "快餐"];
  const lowDinnerCategories = ["奶茶", "冷饮", "甜品", "冰淇淋", "咖啡"];
  const fastMealCategories = ["面食", "快餐", "中餐", "盖饭", "简餐", "小吃"];

  function isDrinkLikeCategory(category: string): boolean {
    const c = category.toLowerCase();
    return ["奶茶", "冷饮", "甜品", "冰淇淋", "咖啡", "饮品"].some((x) => c.includes(x.toLowerCase()));
  }

  function dinnerSuitability(r: RestaurantContext): number {
    const category = (r.category || "").toLowerCase();
    const tags = (r.tags || []).map((t) => t.toLowerCase());

    let score = 0;
    if (dinnerCategories.some((c) => category.includes(c.toLowerCase()))) score += 8;
    if (lowDinnerCategories.some((c) => category.includes(c.toLowerCase()))) score -= 10;
    if (tags.some((t) => ["晚饭", "晚餐", "正餐", "主食", "米饭", "面", "肉"].some((kw) => t.includes(kw)))) {
      score += 4;
    }
    return score;
  }

  const searchRestaurantsTool = new DynamicStructuredTool({
    name: "search_restaurants",
    description: "按条件搜索和筛选餐厅。当用户想找餐厅、想吃东西、问推荐时使用此工具。",
    schema: z.object({
      category: z.string().optional().describe("品类，如'火锅'、'面食'、'烧烤'、'中餐'、'日韩'、'奶茶'"),
      maxPrice: z.number().optional().describe("人均预算上限（元）"),
      minRating: z.number().optional().describe("最低评分（如 4.5）"),
      scene: z.string().optional().describe("用餐场景，可选: 'solo'(一个人)/'date'(约会)/'group'(聚餐)/'late-night'(夜宵)/'budget'(省钱)/'dinner'(晚饭正餐)"),
      mealType: z.string().optional().describe("餐次类型: 'lunch'(午餐)/'dinner'(晚餐)/'snack'(小吃)/'drink'(饮品)"),
      prioritizeFast: z.boolean().optional().describe("是否优先推荐出餐快、方便快速吃完的餐厅"),
      lateNight: z.boolean().optional().describe("是否需要深夜营业"),
      keyword: z.string().optional().describe("关键词搜索（名称、标签、菜品名）"),
      excludeCategories: z.array(z.string()).optional().describe("需要排除的品类列表，例如 [奶茶, 甜品]"),
      limit: z.number().optional().describe("返回数量限制，默认5"),
    }),
    func: async ({ category, maxPrice, minRating, scene, mealType, prioritizeFast, lateNight, keyword, excludeCategories, limit }) => {
      console.log(`🔍 search_restaurants:`, { category, maxPrice, minRating, scene, mealType, prioritizeFast, lateNight, keyword, excludeCategories });

      let results = [...restaurants];

      if (category) {
        const cat = category.toLowerCase();
        results = results.filter(
          (r) => r.category.toLowerCase().includes(cat) ||
            (r.tags && r.tags.some((t) => t.toLowerCase().includes(cat)))
        );
      }
      if (maxPrice !== undefined) {
        results = results.filter((r) => r.avgPrice <= maxPrice * 1.2);
      }
      if (minRating !== undefined) {
        results = results.filter((r) => r.rating >= minRating);
      }
      if (scene) {
        if (scene === "dinner") {
          results = results.filter((r) => dinnerSuitability(r) > -4);
        } else {
          results = results.filter((r) => r.scenes && r.scenes.includes(scene));
        }
      }

      if (mealType === "lunch" || mealType === "dinner") {
        results = results.filter((r) => !isDrinkLikeCategory(r.category));
      }
      if (mealType === "drink") {
        results = results.filter((r) => isDrinkLikeCategory(r.category));
      }

      if (excludeCategories && excludeCategories.length > 0) {
        const excluded = excludeCategories.map((x) => x.toLowerCase());
        results = results.filter((r) => !excluded.some((ec) => r.category.toLowerCase().includes(ec)));
      }

      if (lateNight) {
        results = results.filter((r) => r.isOpenLateNight);
      }
      if (keyword) {
        const kw = keyword.toLowerCase();
        results = results.filter(
          (r) => r.name.toLowerCase().includes(kw) ||
            r.category.toLowerCase().includes(kw) ||
            (r.tags && r.tags.some((t) => t.toLowerCase().includes(kw))) ||
            (r.mustOrderDishes && r.mustOrderDishes.some((d) => d.toLowerCase().includes(kw)))
        );
      }

      results.sort((a, b) => {
        const fastBoostA = prioritizeFast
          ? (fastMealCategories.some((c) => a.category.toLowerCase().includes(c.toLowerCase())) ? 6 : -2)
          : 0;
        const fastBoostB = prioritizeFast
          ? (fastMealCategories.some((c) => b.category.toLowerCase().includes(c.toLowerCase())) ? 6 : -2)
          : 0;

        const scoreA =
          a.rating * 12 +
          (a.studentCount || 0) / 180 -
          (a.distance || 0) / 120 +
          (scene === "dinner" ? dinnerSuitability(a) : 0) +
          fastBoostA +
          (a.rating < 4 ? -8 : 0);
        const scoreB =
          b.rating * 12 +
          (b.studentCount || 0) / 180 -
          (b.distance || 0) / 120 +
          (scene === "dinner" ? dinnerSuitability(b) : 0) +
          fastBoostB +
          (b.rating < 4 ? -8 : 0);
        return scoreB - scoreA;
      });

      const top = results.slice(0, limit || 5);
      if (top.length === 0) {
        return JSON.stringify({ count: 0, restaurants: [], hint: "没有找到符合条件的餐厅，建议放宽筛选条件" });
      }
      return JSON.stringify({
        count: top.length,
        totalMatched: results.length,
        restaurants: top.map((r) => ({
          id: r.id, name: r.name, category: r.category,
          avgPrice: r.avgPrice, rating: r.rating, distance: r.distance,
          tags: r.tags, mustOrderDishes: r.mustOrderDishes,
          studentCount: r.studentCount, studentDiscount: r.studentDiscount,
          openHours: r.openHours,
        })),
      });
    },
  });

  const getRestaurantDetailTool = new DynamicStructuredTool({
    name: "get_restaurant_detail",
    description: "查看某家餐厅的详细信息。当用户想了解某个具体餐厅时使用此工具。",
    schema: z.object({
      restaurantId: z.string().describe("餐厅ID"),
    }),
    func: async ({ restaurantId }) => {
      console.log(`📋 get_restaurant_detail:`, restaurantId);
      const r = restaurants.find((r) => r.id === restaurantId);
      if (!r) return JSON.stringify({ error: "未找到该餐厅" });
      return JSON.stringify(r);
    },
  });

  const compareRestaurantsTool = new DynamicStructuredTool({
    name: "compare_restaurants",
    description: "对比多家餐厅的价格、评分等信息。当用户需要比较时使用此工具。",
    schema: z.object({
      restaurantIds: z.array(z.string()).describe("要对比的餐厅ID数组（2-3个）"),
    }),
    func: async ({ restaurantIds }) => {
      console.log(`⚖️ compare_restaurants:`, restaurantIds);
      const found = restaurantIds
        .map((id) => restaurants.find((r) => r.id === id))
        .filter(Boolean);
      if (found.length === 0) return JSON.stringify({ error: "未找到要对比的餐厅" });
      return JSON.stringify({
        comparison: found.map((r) => ({
          id: r!.id, name: r!.name, category: r!.category,
          avgPrice: r!.avgPrice, rating: r!.rating, distance: r!.distance,
          mustOrderDishes: r!.mustOrderDishes, studentDiscount: r!.studentDiscount,
        })),
      });
    },
  });

  return [searchRestaurantsTool, getRestaurantDetailTool, compareRestaurantsTool];
}
