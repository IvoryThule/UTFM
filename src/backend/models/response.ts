import type { ParsedIntent, RecommendItem, RestaurantEntity, ReviewEntity, UniversityEntity } from "../types";

export interface ApiSuccess<T> {
	code: 0;
	data: T;
}

export interface ApiError {
	code: -1;
	message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface RestaurantListData {
	list: RestaurantEntity[];
	total: number;
	hasMore: boolean;
}

export interface RestaurantDetailData {
	restaurant: RestaurantEntity;
}

export interface RecommendData {
	intent: ParsedIntent;
	recommendations: RecommendItem[];
	fallbackSuggestions?: string[];
}

export interface RankingData {
	title: string;
	description: string;
	list: Array<RestaurantEntity & { rank: number }>;
}

export interface ReviewListData {
	list: ReviewEntity[];
	total: number;
	averageRating: {
		costPerformance: number;
		speed: number;
		taste: number;
		ambiance: number;
		photoWorthy: number;
	};
}

export interface UniversityListData {
	list: UniversityEntity[];
}
