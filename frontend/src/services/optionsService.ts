import api from "./api";
import type { CountryResponse, CityResponse, LanguageResponse, InterestResponse, TravelStyleResponse, NationalityResponse } from "@/types/common";

export const optionsService = {
  getCountries: () =>
    api.get<CountryResponse[]>("/options/countries"),

  getCities: (countryId: number) =>
    api.get<CityResponse[]>(`/options/countries/${countryId}/cities`),

  getLanguages: () =>
    api.get<LanguageResponse[]>("/options/languages"),

  getInterests: () =>
    api.get<InterestResponse[]>("/options/interests"),

  getTravelStyles: () =>
    api.get<TravelStyleResponse[]>("/options/travel-styles"),

  getNationalities: () =>
    api.get<NationalityResponse[]>("/options/nationalities"),
};
