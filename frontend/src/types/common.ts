export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  next_page: number | null;
}

export interface MessageResponse {
  message: string;
}

export interface CountryResponse {
  id: number;
  name: string;
}

export interface CityResponse {
  id: number;
  name: string;
  country_id: number;
}

export interface LanguageResponse {
  id: number;
  name: string;
}

export interface InterestResponse {
  id: number;
  name: string;
}

export interface TravelStyleResponse {
  id: number;
  name: string;
}
