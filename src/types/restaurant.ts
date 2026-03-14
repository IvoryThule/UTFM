export interface WalkDistance {
  universityId: string;
  walkMinutes: number;
  distanceMeters: number;
}

export interface Restaurant {
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
  distances: WalkDistance[];
  coverImage?: string;
  address?: string;
  phone?: string;
}

export type Scene = "solo" | "date" | "group" | "late-night" | "budget";

export interface RestaurantBrief {
  id: string;
  name: string;
  category: string;
  avgPrice: number;
  rating: number;
  studentCount: number;
  tags: string[];
  walkMinutes: number;
  coverImage?: string;
}
