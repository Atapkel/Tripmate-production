import api from "./api";
import type { Profile, ProfileDetail, CreateProfilePayload, UpdateProfilePayload } from "@/types/profile";
import type { MessageResponse } from "@/types/common";

export const profileService = {
  create: (data: CreateProfilePayload) =>
    api.post<Profile>("/profiles", data),

  getMe: () =>
    api.get<ProfileDetail>("/me"),

  getById: (id: number | string) =>
    api.get<ProfileDetail>(`/profiles/${id}`),

  update: (data: UpdateProfilePayload) =>
    api.put<Profile>("/me", data),

  delete: () =>
    api.delete<MessageResponse>("/me"),

  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Profile>("/me/photo", formData);
  },

  deletePhoto: () =>
    api.delete<Profile>("/me/photo"),

  setLanguages: (languageIds: number[]) =>
    api.put<MessageResponse>("/me/languages", languageIds),

  setInterests: (interestIds: number[]) =>
    api.put<MessageResponse>("/me/interests", interestIds),

  setTravelStyles: (travelStyleIds: number[]) =>
    api.put<MessageResponse>("/me/travel-styles", travelStyleIds),
};
