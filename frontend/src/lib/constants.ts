export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";
export const WS_BASE = import.meta.env.VITE_WS_BASE_URL || `ws://${window.location.host}/api/v1`;
export const APP_NAME = import.meta.env.VITE_APP_NAME || "TripMate";

export const ROUTES = {
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  GOOGLE_CALLBACK: "/auth/google/callback",
  TRIPS: "/trips",
  CREATE_TRIP: "/trips/new",
  MY_TRIPS: "/trips/me",
  TRIP_DETAIL: (id: number | string) => `/trips/${id}`,
  TRIP_EDIT: (id: number | string) => `/trips/${id}/edit`,
  TRIP_OFFERS: (id: number | string) => `/trips/${id}/offers`,
  TRIP_PLAN: (id: number | string) => `/trips/${id}/plan`,
  CHATS: "/chats",
  CHAT_ROOM: (id: number | string) => `/chats/${id}`,
  OFFERS: "/offers",
  RECOMMENDATIONS: "/recommendations",
  PROFILE: "/profile",
  PROFILE_VIEW: (id: number | string) => `/profile/${id}`,
  PROFILE_EDIT: "/profile/edit",
  SETTINGS: "/settings",
  SETTINGS_PASSWORD: "/settings/password",
  ONBOARDING_PROFILE: "/onboarding/profile",
  ONBOARDING_PREFERENCES: "/onboarding/preferences",
} as const;

export const LIMITS = {
  BIO_MAX: 500,
  DESCRIPTION_MIN: 20,
  DESCRIPTION_MAX: 2000,
  MESSAGE_MAX: 5000,
  OFFER_MESSAGE_MIN: 10,
  OFFER_MESSAGE_MAX: 1000,
  PHOTO_MAX_MB: 5,
  PASSWORD_MIN: 8,
  AGE_MIN: 16,
  AGE_MAX: 100,
  BUDGET_MAX: 1_000_000,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;
