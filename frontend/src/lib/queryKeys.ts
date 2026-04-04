import type { TripFilters } from "@/types/trip";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  profiles: {
    me: ["profiles", "me"] as const,
    detail: (id: number | string) => ["profiles", id] as const,
  },
  trips: {
    all: ["trips"] as const,
    list: (filters: TripFilters) => ["trips", "list", filters] as const,
    mine: ["trips", "mine"] as const,
    detail: (id: number | string) => ["trips", id] as const,
    plan: (id: number | string) => ["trips", id, "plan"] as const,
    myPlans: ["trips", "my-plans"] as const,
  },
  offers: {
    mine: ["offers", "mine"] as const,
    attention: ["offers", "attention"] as const,
    received: ["offers", "received"] as const,
    forTrip: (tripId: number | string) => ["offers", "trip", tripId] as const,
    detail: (id: number | string) => ["offers", id] as const,
  },
  chats: {
    mine: ["chats", "mine"] as const,
    detail: (chatId: number | string) => ["chats", chatId] as const,
    messages: (chatId: number | string) => ["chats", chatId, "messages"] as const,
    members: (chatId: number | string) => ["chats", chatId, "members"] as const,
  },
  options: {
    countries: ["options", "countries"] as const,
    cities: (countryId: number) => ["options", "cities", countryId] as const,
    languages: ["options", "languages"] as const,
    interests: ["options", "interests"] as const,
    travelStyles: ["options", "travel-styles"] as const,
  },
};
