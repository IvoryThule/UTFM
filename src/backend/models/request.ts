import type { Scene } from "../types";

export interface RecommendRequest {
	input: string;
	university: string;
	history?: string[];
}

export interface RestaurantListRequest {
	university: string;
	category?: string;
	scene?: Scene;
	minPrice?: number;
	maxPrice?: number;
	maxWalk?: number;
	sortBy?: "rating" | "price" | "distance" | "popularity";
	limit?: number;
	offset?: number;
}

export interface RankingRequest {
	university?: string;
	type: "hot" | "value" | "new";
}

export interface ReviewListRequest {
	restaurantId: string;
	sortBy?: "latest" | "likes";
	limit?: number;
	offset?: number;
}
