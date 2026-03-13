export interface StructuredRating {
  costPerformance: number;
  speed: number;
  taste: number;
  ambiance: number;
  photoWorthy: number;
}

export interface Review {
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
