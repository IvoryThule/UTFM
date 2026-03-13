import type { RecommendItem } from "./chat";
import type { Restaurant, RestaurantBrief, Scene } from "./restaurant";
import type { Review, StructuredRating } from "./review";
import type { University } from "./university";

export interface ApiSuccess<T> {
  code: 0;
  data: T;
}

export interface ApiError {
  code: -1;
  message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface RestaurantListQuery {
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

export interface RestaurantListData {
  list: RestaurantBrief[];
  total: number;
  hasMore: boolean;
}

export interface RecommendRequest {
  input: string;
  university: string;
  history?: string[];
}

export interface ParsedIntent {
  budget?: { min?: number; max?: number };
  category?: string;
  scene?: Scene;
  partySize?: number;
  nearUniversity?: string;
  confidence: number;
}

export interface RecommendData {
  intent: ParsedIntent;
  recommendations: RecommendItem[];
  fallbackSuggestions?: string[];
}

export interface RankingData {
  title: string;
  description: string;
  list: Array<RestaurantBrief & { rank: number }>;
}

export interface ReviewListData {
  list: Review[];
  total: number;
  averageRating: StructuredRating;
}

export interface UniversityListData {
  list: University[];
}

export interface RestaurantDetailData {
  restaurant: Restaurant;
}
