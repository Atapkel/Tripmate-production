import api from "./api";
import type { Trip, CreateTripPayload, UpdateTripPayload, TripFilters } from "@/types/trip";
import type { TripPlan } from "@/types/chat";
import type { MessageResponse } from "@/types/common";

export const tripService = {
  getAll: (filters: TripFilters, skip = 0, limit = 20) =>
    api.get<Trip[]>("/trips", {
      params: { ...filters, skip, limit },
    }),

  getById: (id: number | string) =>
    api.get<Trip>(`/trips/${id}`),

  getMine: (skip = 0, limit = 100) =>
    api.get<Trip[]>("/trips/me", { params: { skip, limit } }),

  create: (data: CreateTripPayload) =>
    api.post<Trip>("/trips", data),

  update: (id: number | string, data: UpdateTripPayload) =>
    api.put<Trip>(`/trips/${id}`, data),

  delete: (id: number | string) =>
    api.delete<MessageResponse>(`/trips/${id}`),

  updateStatus: (id: number | string, status: string) =>
    api.patch<Trip>(`/trips/${id}/status`, null, { params: { status } }),

  generatePlan: (id: number | string) =>
    api.post<TripPlan>(`/trips/${id}/generate-plan`),

  getPlan: (id: number | string) =>
    api.get<TripPlan>(`/trips/${id}/plan`),

  getMyPlans: () =>
    api.get<TripPlan[]>("/trips/me/plans"),
};
