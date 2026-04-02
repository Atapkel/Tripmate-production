import api from "./api";
import type { ChatGroup, ChatMember, ChatMessage, SendMessagePayload } from "@/types/chat";
import type { MessageResponse } from "@/types/common";

export const chatService = {
  getMine: (skip = 0, limit = 100) =>
    api.get<ChatGroup[]>("/chats/me", { params: { skip, limit } }),

  getById: (id: number | string) =>
    api.get<ChatGroup>(`/chats/${id}`),

  getByTrip: (tripId: number | string) =>
    api.get<ChatGroup>(`/chats/trip/${tripId}`),

  getMembers: (chatId: number | string) =>
    api.get<ChatMember[]>(`/chats/${chatId}/members`),

  sendMessage: (chatId: number | string, data: SendMessagePayload) =>
    api.post<ChatMessage>(`/chats/${chatId}/messages`, data),

  getMessages: (chatId: number | string, skip = 0, limit = 50) =>
    api.get<ChatMessage[]>(`/chats/${chatId}/messages`, { params: { skip, limit } }),

  getRecentMessages: (chatId: number | string, limit = 50) =>
    api.get<ChatMessage[]>(`/chats/${chatId}/messages/recent`, { params: { limit } }),

  deleteMessage: (chatId: number | string, messageId: number) =>
    api.delete<MessageResponse>(`/chats/${chatId}/messages/${messageId}`),

  getActiveUsers: (chatId: number | string) =>
    api.get<number[]>(`/chats/${chatId}/active-users`),
};
