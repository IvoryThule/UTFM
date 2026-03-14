/**
 * Agent Runner
 * Implements a real tool-calling loop:
 * 1) Understand intent from natural language
 * 2) Decide whether to call tools
 * 3) Iterate with ToolMessage observations
 * 4) Return final answer + structured recommendations
 */

import { AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

import { createTools, type RestaurantContext } from "./tools";

const MAX_ITERATIONS = 6;
const MAX_HISTORY = 10;

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface RecommendationItem {
  restaurantId: string;
  reasons: string[];
}

interface ToolObservation {
  tool: string;
  args: Record<string, unknown>;
  result: string;
}

interface ConversationContext {
  mealScene?: "dinner" | "lunch" | "late-night";
  maxPrice?: number;
  taste?: "light" | "spicy";
  maxDistanceMeters?: number;
  prioritizeFast: boolean;
  needMoreOptions: boolean;
  rejectedPrevious: boolean;
}

type MealType = "breakfast" | "lunch" | "dinner";

const MEAL_CATEGORY_MAP: Record<MealType, string[]> = {
  breakfast: ["粥", "包子", "豆浆", "面包", "三明治", "轻食", "早餐", "面食", "快餐"],
  lunch: ["盖饭", "面", "米线", "炒菜", "快餐", "中餐", "简餐", "小吃", "面食"],
  dinner: ["火锅", "烤肉", "炒菜", "日料", "烧烤", "中餐", "日韩", "面食"],
};

const MEAL_FORBIDDEN_MAP: Record<MealType, string[]> = {
  breakfast: ["火锅", "烤肉", "寿喜烧", "奶茶", "甜品", "咖啡", "冷饮", "饮品"],
  lunch: ["奶茶", "甜品", "冰淇淋", "冷饮", "咖啡", "饮品"],
  dinner: ["奶茶", "甜品", "冰淇淋", "冷饮", "饮品"],
};

function inferMealType(text: string): MealType | undefined {
  if (/早餐|早饭|早上/.test(text)) return "breakfast";
  if (/午餐|午饭|中午|午觉|午休/.test(text)) return "lunch";
  if (/晚餐|晚饭|晚上/.test(text)) return "dinner";
  return undefined;
}

function parseDistancePreference(text: string): number | undefined {
  const meterMatch = text.match(/(\d+)\s*米/);
  if (meterMatch) return Number(meterMatch[1]);

  const kmMatch = text.match(/(\d+(?:\.\d+)?)\s*(公里|km)/i);
  if (kmMatch) return Math.round(Number(kmMatch[1]) * 1000);

  if (/近一点|离我近|不想走远|附近/.test(text)) return 800;
  return undefined;
}

function isOpenNow(openHours?: string): boolean {
  if (!openHours || !openHours.trim()) return true;

  // Supports common formats such as: 09:00-22:00, 10:00-14:00 17:00-21:00
  const ranges = openHours.match(/(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})/g);
  if (!ranges || ranges.length === 0) return true;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  for (const r of ranges) {
    const pair = r.match(/(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})/);
    if (!pair) continue;
    const [sh, sm] = pair[1].split(":").map(Number);
    const [eh, em] = pair[2].split(":").map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    if (end >= start) {
      if (nowMin >= start && nowMin <= end) return true;
    } else {
      // Overnight range, e.g. 18:00-02:00
      if (nowMin >= start || nowMin <= end) return true;
    }
  }

  return false;
}

function categoryMatchesMeal(r: RestaurantContext, meal: MealType): boolean {
  const category = (r.category || "").toLowerCase();
  const tags = (r.tags || []).join(" ").toLowerCase();

  const forbidden = MEAL_FORBIDDEN_MAP[meal];
  if (forbidden.some((x) => category.includes(x.toLowerCase()) || tags.includes(x.toLowerCase()))) {
    return false;
  }

  const allowed = MEAL_CATEGORY_MAP[meal];
  return allowed.some((x) => category.includes(x.toLowerCase()) || tags.includes(x.toLowerCase()));
}

export interface AgentResponse {
  reply: string;
  recommendations: RecommendationItem[];
  toolCalls: string[];
}

const SYSTEM_PROMPT = `你是“AI选餐助手”，服务大学城学生。你必须遵守以下流程：

1. 先理解用户意图（预算、口味、场景、人数、距离、营业时间）。
2. 自主判断是否需要调用工具：
- 信息不足或需要客观数据时，调用工具。
- 闲聊或纯解释类问题，可直接回答，不必强行调工具。
3. 可以多轮调用工具，直到信息足够。
4. 最终回复必须给出：
- 简短自然中文回复（1-3句）
- 推荐餐厅列表（通常1-3家，除非用户要求更多）

最终回答请尽量用以下JSON结构（若无法严格JSON，也要包含同等信息）：
{
  "reply": "...",
  "recommendations": [
    { "restaurantId": "...", "reasons": ["...", "..."] }
  ]
}

规则：
- 不编造餐厅、价格、评分。
- 不要臆造用户未表达的预算或口味；缺失信息请先追问或给出“默认策略”。
- 用户提到“赶时间/马上上课/早点吃完/午休”等信号时，优先推荐上餐快、步行近、适合快吃完的正餐。
- 如果无匹配结果，先尝试放宽条件再回答。
- 与美食无关时，礼貌引导回选餐。`;

function stringifyContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item) {
          return String((item as { text?: unknown }).text ?? "");
        }
        return JSON.stringify(item);
      })
      .join("\n");
  }
  return JSON.stringify(content);
}

function tryParseJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = codeBlock ? codeBlock[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeRecommendations(
  raw: unknown,
  restaurantIndex: Map<string, RestaurantContext>
): RecommendationItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const byName = new Map<string, RestaurantContext>();
  for (const r of restaurantIndex.values()) {
    byName.set(r.name.toLowerCase(), r);
  }

  const normalized: RecommendationItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;

    const maybeId = (item as { restaurantId?: unknown }).restaurantId;
    const maybeName = (item as { restaurantName?: unknown; name?: unknown }).restaurantName
      ?? (item as { name?: unknown }).name;

    let restaurantId = typeof maybeId === "string" ? maybeId : "";
    if (!restaurantId && typeof maybeName === "string") {
      const hit = byName.get(maybeName.toLowerCase());
      if (hit) restaurantId = hit.id;
    }

    if (!restaurantId || !restaurantIndex.has(restaurantId)) {
      continue;
    }

    const reasonsRaw = (item as { reasons?: unknown }).reasons;
    const reasons = Array.isArray(reasonsRaw)
      ? reasonsRaw.filter((x): x is string => typeof x === "string" && x.trim().length > 0).slice(0, 3)
      : [];

    if (reasons.length === 0) {
      const r = restaurantIndex.get(restaurantId)!;
      reasons.push(`评分 ${r.rating}，人均 ${r.avgPrice} 元`);
    }

    normalized.push({ restaurantId, reasons });
  }

  return normalized.slice(0, 3);
}

function parseFinalAnswer(
  rawText: string,
  restaurantIndex: Map<string, RestaurantContext>
): { reply: string; recommendations: RecommendationItem[] } {
  const parsed = tryParseJson(rawText);
  if (parsed && typeof parsed === "object") {
    const obj = parsed as {
      reply?: unknown;
      recommendations?: unknown;
      answer?: { reply?: unknown; recommendations?: unknown };
    };

    if (obj.answer && typeof obj.answer === "object") {
      const reply = typeof obj.answer.reply === "string" ? obj.answer.reply : "";
      const recommendations = normalizeRecommendations(obj.answer.recommendations, restaurantIndex);
      if (reply || recommendations.length > 0) {
        return {
          reply: reply || "给你整理好了几家可选餐厅。",
          recommendations,
        };
      }
    }

    const reply = typeof obj.reply === "string" ? obj.reply : "";
    const recommendations = normalizeRecommendations(obj.recommendations, restaurantIndex);
    if (reply || recommendations.length > 0) {
      return {
        reply: reply || "给你整理好了几家可选餐厅。",
        recommendations,
      };
    }
  }

  const plain = rawText.trim();
  return {
    reply: plain || "我已经为你分析好了。",
    recommendations: [],
  };
}

function buildFallbackFromToolResults(
  observations: ToolObservation[],
  restaurantIndex: Map<string, RestaurantContext>
): AgentResponse {
  for (let i = observations.length - 1; i >= 0; i--) {
    const obs = observations[i];
    const parsed = tryParseJson(obs.result);
    if (!parsed || typeof parsed !== "object") continue;

    const restaurantsRaw = (parsed as { restaurants?: unknown }).restaurants;
    if (!Array.isArray(restaurantsRaw) || restaurantsRaw.length === 0) continue;

    const recommendations: RecommendationItem[] = [];
    for (const entry of restaurantsRaw) {
      if (!entry || typeof entry !== "object") continue;
      const rid = (entry as { id?: unknown }).id;
      if (typeof rid !== "string" || !restaurantIndex.has(rid)) continue;

      const r = restaurantIndex.get(rid)!;
      const reason2 = r.studentDiscount || `${r.studentCount || 0} 位同学推荐`;
      const reason3 = r.distance ? `距离约 ${Math.round(r.distance)} 米` : "综合匹配当前需求";
      recommendations.push({
        restaurantId: rid,
        reasons: [
          `评分 ${r.rating}，人均 ${r.avgPrice} 元`,
          reason2,
          reason3,
        ],
      });

      if (recommendations.length >= 3) break;
    }

    if (recommendations.length > 0) {
      return {
        reply: `我先根据你的需求筛了 ${recommendations.length} 家，你可以先看看这几家。`,
        recommendations,
        toolCalls: observations.map((o) => `${o.tool}(${JSON.stringify(o.args)})`),
      };
    }
  }

  return {
    reply: "我暂时没有拿到足够数据，换个描述方式我再帮你找。",
    recommendations: [],
    toolCalls: observations.map((o) => `${o.tool}(${JSON.stringify(o.args)})`),
  };
}

function buildMockRecommendation(
  userInput: string,
  restaurants: RestaurantContext[],
  context: ConversationContext
): AgentResponse {
  const lower = userInput.toLowerCase();
  const inferredMeal = inferMealType(lower);

  const greetingPattern = /你好|您好|hello|hi|嗨|在吗|你是|你叫什么/;
  if (greetingPattern.test(lower)) {
    return {
      reply: "你好，我是你的 AI 选餐助手。你可以告诉我预算、口味或场景，我来帮你筛餐厅。",
      recommendations: [],
      toolCalls: ["mock_chitchat"],
    };
  }

  const foodIntentPattern = /吃|餐|饭|店|推荐|火锅|烧烤|面|奶茶|咖啡|夜宵|聚餐|约会|便宜|预算|评分|距离/;
  if (!foodIntentPattern.test(lower)) {
    return {
      reply: "我更擅长帮你选餐。比如你可以说：人均 40 以内、想吃辣、适合两人聚餐。",
      recommendations: [],
      toolCalls: ["mock_redirect"],
    };
  }

  let candidates = [...restaurants];

  // Hard constraint 1: currently open
  candidates = candidates.filter((r) => isOpenNow(r.openHours));

  // Hard constraint 2: meal suitability
  if (inferredMeal) {
    candidates = candidates.filter((r) => categoryMatchesMeal(r, inferredMeal));
  }

  const budgetMatch = userInput.match(/(\d+)\s*(元|块)?\s*(以内|以下|左右)?/);
  if (budgetMatch) {
    const maxPrice = Number(budgetMatch[1]);
    candidates = candidates.filter((r) => r.avgPrice <= maxPrice * 1.2);
  }

  const categoryKeywords: Array<[string, string]> = [
    ["火锅", "火锅"],
    ["烧烤", "烧烤"],
    ["烤肉", "烧烤"],
    ["面", "面食"],
    ["拉面", "面食"],
    ["奶茶", "奶茶"],
    ["咖啡", "奶茶"],
    ["日料", "日韩"],
    ["韩", "日韩"],
  ];
  const hitCategory = categoryKeywords.find(([kw]) => lower.includes(kw));
  if (hitCategory) {
    const cat = hitCategory[1].toLowerCase();
    candidates = candidates.filter((r) => r.category.toLowerCase().includes(cat));
  }

  if (lower.includes("夜宵") || lower.includes("深夜") || lower.includes("还开门")) {
    candidates = candidates.filter((r) => r.isOpenLateNight);
  }

  if (context.mealScene === "dinner" || lower.includes("晚饭") || lower.includes("晚餐")) {
    const dinnerPositive = ["中餐", "火锅", "烧烤", "日韩", "面食", "快餐"];
    const dinnerNegative = ["奶茶", "冷饮", "甜品", "咖啡", "冰淇淋"];
    candidates = candidates.filter((r) => {
      const c = (r.category || "").toLowerCase();
      if (dinnerNegative.some((x) => c.includes(x.toLowerCase()))) return false;
      return dinnerPositive.some((x) => c.includes(x.toLowerCase()));
    });

    // 晚饭场景优先4分以上
    const highRated = candidates.filter((r) => r.rating >= 4);
    if (highRated.length >= 3) {
      candidates = highRated;
    }
  }

  if (context.mealScene === "lunch") {
    const lunchPositive = ["中餐", "面食", "快餐", "盖饭", "简餐", "小吃"];
    candidates = candidates.filter((r) => {
      const c = (r.category || "").toLowerCase();
      if (["奶茶", "冷饮", "甜品", "咖啡", "冰淇淋"].some((x) => c.includes(x.toLowerCase()))) return false;
      return lunchPositive.some((x) => c.includes(x.toLowerCase()));
    });
  }

  if (typeof context.maxPrice === "number" && context.maxPrice > 0) {
    const maxPrice = context.maxPrice;
    candidates = candidates.filter((r) => r.avgPrice <= maxPrice * 1.2);
  }

  if (typeof context.maxDistanceMeters === "number" && context.maxDistanceMeters > 0) {
    const maxDistanceMeters = context.maxDistanceMeters;
    candidates = candidates.filter((r) => (r.distance ?? Number.MAX_SAFE_INTEGER) <= maxDistanceMeters);
  }

  if (context.taste === "light") {
    candidates = candidates.filter((r) => {
      const tags = (r.tags || []).join(" ").toLowerCase();
      const dishes = (r.mustOrderDishes || []).join(" ").toLowerCase();
      return !/麻辣|重辣|爆辣|重口/.test(`${tags} ${dishes}`);
    });
  }
  if (context.taste === "spicy") {
    candidates = candidates.filter((r) => {
      const tags = (r.tags || []).join(" ").toLowerCase();
      const dishes = (r.mustOrderDishes || []).join(" ").toLowerCase();
      return /辣|香锅|麻辣|川味|湘/.test(`${tags} ${dishes}`);
    });
  }

  candidates.sort((a, b) => {
    const fastA = context.prioritizeFast
      ? (["面食", "快餐", "盖饭", "简餐", "小吃", "中餐"].some((x) => (a.category || "").toLowerCase().includes(x.toLowerCase())) ? 8 : -2)
      : 0;
    const fastB = context.prioritizeFast
      ? (["面食", "快餐", "盖饭", "简餐", "小吃", "中餐"].some((x) => (b.category || "").toLowerCase().includes(x.toLowerCase())) ? 8 : -2)
      : 0;
    const aScore = a.rating * 12 + (a.studentCount || 0) / 250 - (a.distance || 0) / 90 + fastA;
    const bScore = b.rating * 12 + (b.studentCount || 0) / 250 - (b.distance || 0) / 90 + fastB;
    return bScore - aScore;
  });

  const baseTop = candidates.slice(0, 8);
  const top = context.needMoreOptions ? baseTop.slice(0, 5) : baseTop.slice(0, 3);
  if (top.length === 0) {
    const noOpen = restaurants.filter((r) => isOpenNow(r.openHours)).length === 0;
    const mealReason = inferredMeal ? `目前没有正在营业且适合${inferredMeal === "breakfast" ? "早餐" : inferredMeal === "lunch" ? "午餐" : "晚餐"}的店` : "当前筛选条件下暂无匹配";
    const fallback = [...restaurants]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
      .map((r) => ({
        restaurantId: r.id,
        reasons: [`评分 ${r.rating}，人均 ${r.avgPrice} 元`],
      }));

    return {
      reply: noOpen
        ? "附近目前没有正在营业的餐厅，建议考虑食堂、便利店或面包店。"
        : `${mealReason}。我先给你几家口碑更好的备选。`,
      recommendations: fallback,
      toolCalls: ["mock_local_search"],
    };
  }

  return {
    reply: context.needMoreOptions
      ? `当然可以，这次给你多一些晚饭备选，一共 ${top.length} 家。`
      : (context.prioritizeFast
        ? `按你“想快点吃完”的需求，优先挑了 ${top.length} 家上餐更快、更近的。`
        : `按你的要求先筛出了 ${top.length} 家，可以从这些开始选。`),
    recommendations: top.map((r) => ({
      restaurantId: r.id,
      reasons: [
        `评分 ${r.rating}，人均 ${r.avgPrice} 元`,
        r.studentDiscount || `${r.studentCount || 0} 位同学推荐`,
        context.prioritizeFast
          ? (r.distance ? `距离约 ${Math.round(r.distance)} 米，通勤和就餐更省时` : "适合快速就餐")
          : (r.distance ? `距离约 ${Math.round(r.distance)} 米` : "适合当前用餐场景"),
      ],
    })),
    toolCalls: ["mock_local_search"],
  };
}

function inferConversationContext(
  userInput: string,
  history: ConversationMessage[]
): ConversationContext {
  const merged = `${history.map((h) => h.content).join("\n")}\n${userInput}`.toLowerCase();

  const budgetMatch = merged.match(/(\d+)\s*(元|块)?\s*(以内|以下|左右)?/);
  const maxPrice = budgetMatch ? Number(budgetMatch[1]) : undefined;

  let mealScene: ConversationContext["mealScene"];
  if (/夜宵|深夜|还开门/.test(merged)) {
    mealScene = "late-night";
  } else if (/晚饭|晚餐/.test(merged)) {
    mealScene = "dinner";
  } else if (/午饭|午餐|中午/.test(merged)) {
    mealScene = "lunch";
  }

  const prioritizeFast = /马上|赶时间|快点|早点吃完|快吃完|午觉|午休|上课前|下课/.test(merged);
  const maxDistanceMeters = parseDistancePreference(merged);
  const taste: ConversationContext["taste"] = /清淡|不辣|少辣/.test(merged)
    ? "light"
    : (/辣|重口|麻辣|川味/.test(merged) ? "spicy" : undefined);

  const rejectedPrevious = /其他|别的|换|不想|不要|不能|不太行|不满意/.test(userInput.toLowerCase());
  const needMoreOptions = rejectedPrevious || /随便|都行|再来|多推荐|还有吗/.test(userInput.toLowerCase());

  return {
    mealScene,
    maxPrice,
    taste,
    maxDistanceMeters,
    prioritizeFast,
    needMoreOptions,
    rejectedPrevious,
  };
}

function resolveAgentConfig(): { apiKey: string; modelName: string } | null {
  const rawApiKey =
    process.env.zhipu_api_key ||
    process.env.ZHIPU_API_KEY ||
    process.env.GLM_API_KEY ||
    "";
  const apiKey = rawApiKey.trim().replace(/^['\"]|['\"]$/g, "");

  if (!apiKey || apiKey === "dummy_key") {
    return null;
  }

  const rawModelName =
    process.env.zhipu_model_name ||
    process.env.ZHIPU_MODEL_NAME ||
    process.env.GLM_MODEL ||
    "glm-4-flash";
  const modelName = rawModelName.trim().replace(/^['\"]|['\"]$/g, "");

  return { apiKey, modelName };
}

function toHistoryMessages(history: ConversationMessage[]): BaseMessage[] {
  return history.slice(-MAX_HISTORY).map((msg) => {
    if (msg.role === "assistant") {
      return new AIMessage(msg.content);
    }
    return new HumanMessage(msg.content);
  });
}

export async function runAgent(
  userInput: string,
  restaurants: RestaurantContext[],
  conversationHistory: ConversationMessage[] = []
): Promise<AgentResponse> {
  if (!restaurants || restaurants.length === 0) {
    return {
      reply: "我还没有拿到附近餐厅数据，请稍后重试。",
      recommendations: [],
      toolCalls: [],
    };
  }

  const convContext = inferConversationContext(userInput, conversationHistory);

  const restaurantIndex = new Map(restaurants.map((r) => [r.id, r]));
  const config = resolveAgentConfig();
  if (!config) {
    console.warn("[Agent] API key not found, fallback to local mock.");
    return buildMockRecommendation(userInput, restaurants, convContext);
  }

  const model = new ChatOpenAI({
    // Keep both for compatibility across @langchain/openai versions.
    apiKey: config.apiKey,
    openAIApiKey: config.apiKey,
    configuration: {
      baseURL: "https://open.bigmodel.cn/api/paas/v4/",
    },
    model: config.modelName,
    modelName: config.modelName,
    temperature: 0.4,
  });

  const tools = createTools(restaurants);
  const toolMap = new Map(tools.map((tool) => [tool.name, tool]));
  const modelWithTools = model.bindTools(tools);

  const messages: BaseMessage[] = [
    new SystemMessage(SYSTEM_PROMPT),
    new SystemMessage(`当前会话上下文：${JSON.stringify(convContext)}`),
    ...toHistoryMessages(conversationHistory),
    new HumanMessage(userInput),
  ];

  const toolCalls: string[] = [];
  const observations: ToolObservation[] = [];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    try {
      const response = await modelWithTools.invoke(messages);
      messages.push(response);

      const ai = response as AIMessage & {
        tool_calls?: Array<{
          id: string;
          name: string;
          args: Record<string, unknown>;
        }>;
      };

      const pendingCalls = ai.tool_calls || [];
      if (pendingCalls.length === 0) {
        const parsed = parseFinalAnswer(stringifyContent(ai.content), restaurantIndex);
        if (parsed.recommendations.length > 0 || observations.length === 0) {
          return {
            reply: parsed.reply,
            recommendations: parsed.recommendations,
            toolCalls,
          };
        }
        const fallback = buildFallbackFromToolResults(observations, restaurantIndex);
        return {
          reply: parsed.reply || fallback.reply,
          recommendations: parsed.recommendations.length > 0 ? parsed.recommendations : fallback.recommendations,
          toolCalls,
        };
      }

      for (const call of pendingCalls) {
        const tool = toolMap.get(call.name);
        if (!tool) {
          const missing = `未找到工具 ${call.name}`;
          messages.push(
            new ToolMessage({
              tool_call_id: call.id,
              content: missing,
            })
          );
          observations.push({ tool: call.name, args: call.args || {}, result: missing });
          toolCalls.push(`${call.name}(${JSON.stringify(call.args || {})})`);
          continue;
        }

        const result = await tool.invoke(call.args || {});
        const resultText = typeof result === "string" ? result : JSON.stringify(result);

        messages.push(
          new ToolMessage({
            tool_call_id: call.id,
            content: resultText,
          })
        );

        observations.push({
          tool: call.name,
          args: call.args || {},
          result: resultText,
        });
        toolCalls.push(`${call.name}(${JSON.stringify(call.args || {})})`);
      }
    } catch (error) {
      console.error(`[Agent] Iteration ${i + 1} failed:`, error);
      if (observations.length > 0) {
        return buildFallbackFromToolResults(observations, restaurantIndex);
      }
      return buildMockRecommendation(userInput, restaurants, convContext);
    }
  }

  console.warn("[Agent] Max iterations reached, using fallback summary.");
  if (observations.length > 0) {
    return buildFallbackFromToolResults(observations, restaurantIndex);
  }
  return buildMockRecommendation(userInput, restaurants, convContext);
}
