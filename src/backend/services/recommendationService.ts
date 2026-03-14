import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
// import { prisma } from "@/lib/prisma"; // Removed to avoid dependency on DB if not set up

export async function getRecommendations(
    userInput: string, 
    universityId: string, 
    location?: { lat: number, lng: number }, 
    contextData?: any[]
) {
  try {
    let restaurantData: any[] = [];

    // 1. Prepare Data Context
    // If context data is provided (from Client-side map/list), use it.
    if (contextData && contextData.length > 0) {
        restaurantData = contextData.map(r => ({
            id: r.id || r.amapId,
            name: r.name,
            category: r.category || r.type,
            price: r.avgPrice || r.biz_ext?.cost || 0,
            rating: r.rating || r.biz_ext?.rating || 0,
            distance: r.distance,
            tags: r.tags || []
        }));
    } else {
        // Fallback: Use empty or hardcoded mock if no client context
        // Without DB, we can't fetch persistent data. 
        // Relying on Client Context is best for this "Map-based" app.
        console.warn("No context data provided to recommendation service");
        restaurantData = [];
    }

    if (!restaurantData || restaurantData.length === 0) {
        return [];
    }

    const apiKey = process.env.zhipu_api_key;
    const shouldUseMock = !apiKey || apiKey === "dummy_key";

    // Mock Fallback Logic (If no key or API error)
    if (shouldUseMock) {
        console.warn("Using Mock AI Recommendation due to missing API Key");
        
        // Simple word matching logic
        const keywords = userInput.split(/[,，\s]+/);
        const scored = restaurantData.map(r => {
            let score = 0;
            if (keywords.some(k => r.name.includes(k))) score += 5;
            if (keywords.some(k => r.category.includes(k))) score += 3;
            // high rating boost
            score += (r.rating || 0); 
            // low price boost if "cheap" mentioned
            if ((userInput.includes("便宜") || userInput.includes("穷")) && (r.price < 30)) score += 5;
            return { r, score };
        });

        // Top 3
        const top3 = scored.sort((a,b) => b.score - a.score).slice(0, 3).map(item => ({
            restaurantId: item.r.id,
            reasons: [`系统自动推荐：综合评分 ${item.r.rating}，符合您的"${userInput}"偏好`]
        }));
        
        return top3;
    }

    // 2. Initialize LangChain Model (GLM-4 via OpenAI-compatible API)
    try {
        const model = new ChatOpenAI({
            openAIApiKey: apiKey, 
            configuration: {
                baseURL: "https://open.bigmodel.cn/api/paas/v4/"
            },
            modelName: process.env.zhipu_model_name || "glm-4",
            temperature: 0.7,
        });

        // 3. Define Output Parser
        // We want a structured JSON array
        const parser = new JsonOutputParser();

        // 4. Create Prompt Template
        const prompt = PromptTemplate.fromTemplate(
            `你是一个资深的大学城美食推荐助手。请基于提供的【候选餐厅数据】，根据【用户需求】推荐最合适的3家餐厅。

【候选餐厅数据】:
{context}

【用户需求】:
{input}

【推导规则】:
1. 必须只从候选列表中选择，不能编造。
2. 如果用户关注价格，优先推荐性价比高的。
3. 如果用户关注距离，优先推荐距离近的。
4. 如果用户没有明确需求（如"随便"），推荐综合评分最高的。
5. 每个推荐必须包含具体的推荐理由（reasons字段，数组格式）。

{format_instructions}

请直接返回JSON数组结果。`
        );

        // 5. Build Chain
        const chain = RunnableSequence.from([
            prompt,
            model,
            parser
        ]);

        // 6. Execute Chain
        const result = await chain.invoke({
            context: JSON.stringify(restaurantData.slice(0, 40)), // Context limit
            input: userInput,
            format_instructions: parser.getFormatInstructions()
        });

        return result;

    } catch (langchainError) {
        console.error("LangChain Error, falling back to simple logic:", langchainError);
        // Fallback same as above simplified
         const top3 = restaurantData
            .sort((a,b) => b.rating - a.rating)
            .slice(0, 3)
            .map(r => ({
                restaurantId: r.id,
                reasons: ["AI服务暂时繁忙，为您推荐高分精选商户"]
            }));
        return top3;
    }

  } catch (error) {
    console.error("General Recommendation Error:", error);
    return [];
  }
}
