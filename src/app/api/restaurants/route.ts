import { getRestaurantList } from "@backend/api/restaurants";
import { NextRequest, NextResponse } from "next/server";

function toNumber(value: string | null): number | undefined {
	if (!value) {
		return undefined;
	}
	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const university = searchParams.get("university");

	if (!university) {
		return NextResponse.json(
			{
				code: -1,
				message: "missing query param: university"
			},
			{ status: 400 }
		);
	}

	const result = getRestaurantList({
		university,
		category: searchParams.get("category") ?? undefined,
		maxPrice: toNumber(searchParams.get("maxPrice")),
		maxWalk: toNumber(searchParams.get("maxWalk")),
		sortBy: (searchParams.get("sortBy") as "rating" | "price" | "distance" | "popularity" | null) ?? undefined,
		limit: toNumber(searchParams.get("limit")),
		offset: toNumber(searchParams.get("offset"))
	});

	return NextResponse.json({
		code: 0,
		data: result
	});
}
