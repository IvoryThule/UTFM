import { restaurants } from "@backend/data/restaurants";
import type { RestaurantEntity } from "@backend/types";

export interface RestaurantQuery {
	university: string;
	category?: string;
	maxPrice?: number;
	maxWalk?: number;
	sortBy?: "rating" | "price" | "distance" | "popularity";
	limit?: number;
	offset?: number;
}

export interface RestaurantListResult {
	list: Array<RestaurantEntity & { walkMinutes: number }>;
	total: number;
	hasMore: boolean;
}

function getWalkMinutes(restaurant: RestaurantEntity, university: string): number {
	return restaurant.distances.find((item) => item.universityId === university)?.walkMinutes ?? 999;
}

export function getRestaurantList(query: RestaurantQuery): RestaurantListResult {
	const {
		university,
		category,
		maxPrice,
		maxWalk,
		sortBy = "popularity",
		limit = 20,
		offset = 0
	} = query;

	let filtered = restaurants.filter((restaurant) => {
		if (category && restaurant.category !== category) {
			return false;
		}
		if (typeof maxPrice === "number" && restaurant.avgPrice > maxPrice) {
			return false;
		}
		if (typeof maxWalk === "number" && getWalkMinutes(restaurant, university) > maxWalk) {
			return false;
		}
		return true;
	});

	filtered = filtered.sort((a, b) => {
		if (sortBy === "rating") {
			return b.rating - a.rating;
		}
		if (sortBy === "price") {
			return a.avgPrice - b.avgPrice;
		}
		if (sortBy === "distance") {
			return getWalkMinutes(a, university) - getWalkMinutes(b, university);
		}
		return b.studentCount - a.studentCount;
	});

	const total = filtered.length;
	const list = filtered.slice(offset, offset + limit).map((restaurant) => ({
		...restaurant,
		walkMinutes: getWalkMinutes(restaurant, university)
	}));

	return {
		list,
		total,
		hasMore: offset + limit < total
	};
}

export function getRestaurantDetail(id: string): RestaurantEntity | null {
	return restaurants.find((restaurant) => restaurant.id === id) ?? null;
}
