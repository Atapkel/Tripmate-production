export interface ChatGroup {
  id: number;
  trip_vacancy_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  /** From GET /chats/me; omitted on older API versions. */
  unread_count?: number;
}

export interface ChatMember {
  id: number;
  chat_group_id: number;
  user_id: number;
  joined_at: string;
}

export interface ChatMessage {
  id: number;
  chat_group_id: number;
  /** Absent for TripMate system messages */
  sender_id?: number | null;
  sender_name?: string;
  content: string;
  created_at: string;
}

export interface SendMessagePayload {
  content: string;
}

export interface RecommendedPlace {
  id: number;
  place_id: string;
  name: string;
  category?: string;
  short_description?: string;
  why_people_go?: string;
  why_recommended?: string;
  best_season?: string[];
  audience?: string[];
  best_time_of_day?: string;
  image_url?: string;
  query_to_search?: string;
  created_at: string;
}

export interface TripPlan {
  id: number;
  trip_vacancy_id: number;
  generation_requested_at?: string;
  generated_at?: string;
  created_at: string;
  updated_at: string;
  recommended_places: RecommendedPlace[];
}
