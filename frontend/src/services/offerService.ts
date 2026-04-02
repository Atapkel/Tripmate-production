import api from "./api";
import type { Offer, CreateOfferPayload, UpdateOfferStatusPayload } from "@/types/offer";
import type { MessageResponse } from "@/types/common";

export const offerService = {
  create: (data: CreateOfferPayload) =>
    api.post<Offer>("/offers", data),

  getMine: (skip = 0, limit = 100) =>
    api.get<Offer[]>("/offers/me", { params: { skip, limit } }),

  getReceived: (skip = 0, limit = 100) =>
    api.get<Offer[]>("/offers/received", { params: { skip, limit } }),

  getForTrip: (tripId: number | string, status?: string) =>
    api.get<Offer[]>(`/offers/trip/${tripId}`, {
      params: status ? { status } : undefined,
    }),

  getById: (id: number | string) =>
    api.get<Offer>(`/offers/${id}`),

  updateStatus: (id: number | string, data: UpdateOfferStatusPayload) =>
    api.patch<Offer>(`/offers/${id}/status`, data),

  cancel: (id: number | string) =>
    api.post<Offer>(`/offers/${id}/cancel`),

  delete: (id: number | string) =>
    api.delete<MessageResponse>(`/offers/${id}`),
};
