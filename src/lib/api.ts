import type {
  RecommendData,
  RecommendRequest,
  RestaurantDetailData,
  RestaurantListData,
  RestaurantListQuery,
  UniversityListData
} from "@/types";

interface ApiEnvelope<T> {
  code: number;
  data?: T;
  message?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const result = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || result.code !== 0 || !result.data) {
    throw new Error(result.message ?? "request failed");
  }
  return result.data;
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

export const api = {
  getUniversities: () => request<UniversityListData>("/api/universities"),

  getRestaurants: (query: RestaurantListQuery) =>
    request<RestaurantListData>(`/api/restaurants?${toQuery({
      university: query.university,
      category: query.category,
      maxPrice: query.maxPrice,
      maxWalk: query.maxWalk,
      sortBy: query.sortBy,
      limit: query.limit,
      offset: query.offset
    })}`),

  getRestaurantDetail: (id: string) => request<RestaurantDetailData>(`/api/restaurants/${id}`),

  getRecommend: (payload: RecommendRequest) =>
    request<RecommendData>("/api/recommend", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
