import { NextRequest, NextResponse } from "next/server";

import { runAgent } from "@/backend/agents/runner";
import type { RestaurantContext } from "@/backend/agents/tools";

export async function POST(req: NextRequest) {
  try {
    const { input, university, location, restaurants, history } = await req.json();

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    // Map client restaurant data to agent-compatible format
    const restaurantContext: RestaurantContext[] = (restaurants || []).map(
      (r: Partial<RestaurantContext> & Record<string, unknown>) => ({
        id: r.id || (r as Record<string, unknown>).amapId || "",
        name: r.name || "",
        category: r.category || "",
        avgPrice: r.avgPrice || 0,
        rating: r.rating || 0,
        distance: r.distance,
        tags: r.tags || [],
        scenes: r.scenes || [],
        isOpenLateNight: r.isOpenLateNight || false,
        mustOrderDishes: r.mustOrderDishes || [],
        studentCount: r.studentCount || 0,
        studentDiscount: r.studentDiscount,
        openHours: r.openHours,
      })
    );

    // Convert conversation history from frontend format
    const conversationHistory = (history || []).map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })
    );

    // Run the agent
    const agentResult = await runAgent(input, restaurantContext, conversationHistory);

    return NextResponse.json({
      reply: agentResult.reply,
      recommendations: agentResult.recommendations,
      meta: {
        total: agentResult.recommendations.length,
        source: "agent",
        toolCalls: agentResult.toolCalls,
      }
    });

  } catch (error) {
    console.error("AI Agent Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
