import type { RestaurantBrief } from "./restaurant";

export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "sending" | "typing" | "done";

export interface RecommendItem {
  restaurantId: string;
  score: number;
  reasons: string[];
  restaurant?: RestaurantBrief;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  recommendations?: RecommendItem[];
  status: MessageStatus;
  timestamp: number;
}
