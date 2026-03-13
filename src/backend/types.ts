export type Scene = "solo" | "date" | "group" | "late-night" | "budget";

export interface UniversityEntity {
	id: string;
	name: string;
	city: string;
	lat: number;
	lng: number;
	aliases: string[];
}

export interface RestaurantEntity {
	id: string;
	name: string;
	category: string;
	subcategory?: string;
	avgPrice: number;
	rating: number;
	reviewCount: number;
	studentCount: number;
	tags: string[];
	scenes: Scene[];
	mustOrderDishes: string[];
	studentDiscount?: string;
	openHours: string;
	isOpenLateNight: boolean;
	lat: number;
	lng: number;
	distances: Array<{
		universityId: string;
		walkMinutes: number;
		distanceMeters: number;
	}>;
	coverImage?: string;
}

export interface ReviewEntity {
	id: string;
	restaurantId: string;
	universityId: string;
	authorName: string;
	authorDepartment: string;
	rating: number;
	content: string;
	spendPerHead?: number;
	queueMinutes?: number;
	likes: number;
	tags: string[];
	createdAt: string;
}

export interface ParsedIntent {
	budget?: { min?: number; max?: number };
	category?: string;
	scene?: Scene;
	partySize?: number;
	nearUniversity?: string;
	confidence: number;
}

export interface RecommendItem {
	restaurantId: string;
	score: number;
	reasons: string[];
}
