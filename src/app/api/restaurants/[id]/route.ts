import { getRestaurantDetail } from "@backend/api/restaurants";
import { NextResponse } from "next/server";

interface RouteContext {
	params: {
		id: string;
	};
}

export async function GET(_request: Request, context: RouteContext) {
	const restaurant = getRestaurantDetail(context.params.id);

	if (!restaurant) {
		return NextResponse.json(
			{
				code: -1,
				message: "restaurant not found"
			},
			{ status: 404 }
		);
	}

	return NextResponse.json({
		code: 0,
		data: {
			restaurant
		}
	});
}
