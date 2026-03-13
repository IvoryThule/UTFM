import { getReviewSummary } from "@backend/api/summary";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const restaurantId = request.nextUrl.searchParams.get("restaurantId");

	if (!restaurantId) {
		return NextResponse.json(
			{
				code: -1,
				message: "missing query param: restaurantId"
			},
			{ status: 400 }
		);
	}

	const result = getReviewSummary(restaurantId);

	return NextResponse.json({
		code: 0,
		data: result
	});
}
