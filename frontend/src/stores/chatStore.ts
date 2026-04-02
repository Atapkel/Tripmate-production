import { create } from "zustand";
import type { ChatMessage } from "@/types/chat";

interface ChatState {
  activeChatId: number | null;
  messagesByChat: Record<number, ChatMessage[]>;
  unreadCounts: Record<number, number>;
  typingUsers: Record<number, number[]>;

  setActiveChat: (id: number | null) => void;
  addMessage: (chatId: number, message: ChatMessage) => void;
  setMessages: (chatId: number, messages: ChatMessage[]) => void;
  prependMessages: (chatId: number, messages: ChatMessage[]) => void;
  setTyping: (chatId: number, userId: number, isTyping: boolean) => void;
  incrementUnread: (chatId: number) => void;
  clearUnread: (chatId: number) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  activeChatId: null,
  messagesByChat: {},
  unreadCounts: {},
  typingUsers: {},

  setActiveChat: (id) => set({ activeChatId: id }),

  addMessage: (chatId, message) =>
    set((state) => {
      const existing = state.messagesByChat[chatId] || [];
      if (existing.some((m) => m.id === message.id)) return state;
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: [...existing, message],
        },
      };
    }),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: messages,
      },
    })),

  prependMessages: (chatId, messages) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: [...messages, ...(state.messagesByChat[chatId] || [])],
      },
    })),

  setTyping: (chatId, userId, isTyping) =>
    set((state) => {
      const current = state.typingUsers[chatId] || [];
      const updated = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
      return {
        typingUsers: { ...state.typingUsers, [chatId]: updated },
      };
    }),

  incrementUnread: (chatId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [chatId]: (state.unreadCounts[chatId] || 0) + 1,
      },
    })),

  clearUnread: (chatId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [chatId]: 0 },
    })),
}));
