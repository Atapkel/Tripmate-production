import type { CountryResponse, CityResponse, LanguageResponse, InterestResponse, TravelStyleResponse } from "./common";

export interface UserLanguage {
  id: number;
  profile_id: number;
  language_id: number;
  language?: LanguageResponse;
}

export interface UserInterest {
  id: number;
  profile_id: number;
  interest_id: number;
  interest?: InterestResponse;
}

export interface UserTravelStyle {
  id: number;
  profile_id: number;
  travel_style_id: number;
  travel_style?: TravelStyleResponse;
}

export interface Profile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  country_id?: number;
  city_id?: number;
  country?: CountryResponse;
  city?: CityResponse;
  nationality?: string;
  phone?: string;
  instagram_handle?: string;
  telegram_handle?: string;
  bio?: string;
  profile_photo?: string;
}

export interface ProfileDetail extends Profile {
  languages: UserLanguage[];
  interests: UserInterest[];
  travel_styles: UserTravelStyle[];
}

export interface CreateProfilePayload {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  nationality?: string;
  country_id?: number;
  city_id?: number;
  bio?: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  country_id?: number;
  city_id?: number;
  bio?: string;
  nationality?: string;
  phone?: string;
  instagram_handle?: string;
  telegram_handle?: string;
  language_ids?: number[];
  interest_ids?: number[];
  travel_style_ids?: number[];
}
