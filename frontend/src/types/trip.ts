import type { CountryResponse, CityResponse, NationalityResponse } from "./common";

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
  male_needed?: number | null;
  female_needed?: number | null;
  male_joined: number;
  female_joined: number;
  description?: string;
  destination_description?: string | null;
  destination_photo_url?: string | null;
  destination_wiki_url?: string | null;
  min_age?: number;
  max_age?: number;
  nationality_preference_id?: number | null;
  nationality_preference?: NationalityResponse | null;
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
  male_needed?: number | null;
  female_needed?: number | null;
  nationality_preference_id?: number | null;
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
  gender?: string;
  nationality_preference_id?: number;
  from_city?: string;
  from_country?: string;
}
