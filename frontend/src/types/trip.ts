import type { CountryResponse, CityResponse } from "./common";

export interface Trip {
  id: number;
  requester_id: number;
  destination_country_id: number;
  destination_city_id: number;
  destination_country?: CountryResponse;
  destination_city?: CityResponse;
  start_date: string;
  end_date: string;
  min_budget?: number;
  max_budget?: number;
  people_needed: number;
  people_joined: number;
  description?: string;
  min_age?: number;
  max_age?: number;
  gender_preference?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTripPayload {
  destination_country_id: number;
  destination_city_id: number;
  start_date: string;
  end_date: string;
  min_budget?: number;
  max_budget?: number;
  people_needed: number;
  description?: string;
  min_age?: number;
  max_age?: number;
  gender_preference?: string;
}

export interface UpdateTripPayload extends Partial<CreateTripPayload> {}

export interface TripFilters {
  destination_city?: string;
  destination_country?: string;
  status?: string;
  start_date_from?: string;
  start_date_to?: string;
  min_age?: number;
  max_age?: number;
  min_budget?: number;
  max_budget?: number;
  gender_preference?: string;
  from_city?: string;
  from_country?: string;
}
