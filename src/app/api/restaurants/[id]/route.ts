import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getRestaurantDetail } from "@backend/api/restaurants";

interface RouteContext {
	params: {
		id: string;
	};
}

export async function GET(_request: Request, context: RouteContext) {
	const id = context.params.id;
	const localRestaurant = getRestaurantDetail(id);

	if (localRestaurant) {
		return NextResponse.json({
			code: 0,
			data: {
				restaurant: localRestaurant
			}
		});
	}

	// Fallback: support AMap IDs persisted in Prisma (amapId)
	const dbRestaurant = await prisma.restaurant.findFirst({
		where: {
			OR: [{ id }, { amapId: id }]
		}
	});

	if (dbRestaurant) {
		return NextResponse.json({
			code: 0,
			data: {
				restaurant: {
					id: dbRestaurant.amapId || dbRestaurant.id,
					name: dbRestaurant.name,
					category: dbRestaurant.category || "餐饮",
					subcategory: dbRestaurant.subcategory || "",
					avgPrice: Math.round(dbRestaurant.avgPrice || 0),
					rating: dbRestaurant.rating || 0,
					reviewCount: dbRestaurant.reviewCount || 0,
					studentCount: 0,
					tags: dbRestaurant.tags ? dbRestaurant.tags.split(",") : [],
					scenes: dbRestaurant.scenes ? dbRestaurant.scenes.split(",") : [],
					mustOrderDishes: [],
					openHours: "10:00-22:00",
					isOpenLateNight: false,
					lat: dbRestaurant.latitude,
					lng: dbRestaurant.longitude,
					distances: [],
					address: dbRestaurant.address || "",
				}
			}
		});
	}

	if (!localRestaurant) {
		return NextResponse.json(
			{
				code: -1,
				message: "restaurant not found"
			},
			{ status: 404 }
		);
	}

}
