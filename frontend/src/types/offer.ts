import type { Trip } from "./trip";

export interface Offer {
  id: number;
  trip_vacancy_id: number;
  offerer_id: number;
  message?: string;
  proposed_budget?: number;
  status: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  trip_vacancy?: Trip;
}

export interface CreateOfferPayload {
  trip_vacancy_id: number;
  message?: string;
  proposed_budget?: number;
}

export interface UpdateOfferStatusPayload {
  status: "accepted" | "rejected" | "cancelled";
}
