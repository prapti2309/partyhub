import { create } from "zustand";
import { ChatMessage, MessageReaction } from "../types";

interface ChatStoreState {
  messages: ChatMessage[];
  typists: string[];
  addMessage: (message: ChatMessage) => void;
  deleteMessage: (messageId: string) => void;
  togglePinMessage: (messageId: string) => void;
  updateMessageReactions: (messageId: string, reactions: MessageReaction[]) => void;
  setTypist: (username: string, isTyping: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
  messages: [], // Removed mock data
  typists: [],

  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  deleteMessage: (messageId: string) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    }));
  },

  togglePinMessage: (messageId: string) => {
    set((state) => ({
      messages: state.messages.map((m) => (m.id === messageId ? { ...m, pinned: !m.pinned } : m)),
    }));
  },

  updateMessageReactions: (messageId: string, reactions: MessageReaction[]) => {
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id !== messageId) return m;
        return { ...m, reactions };
      }),
    }));
  },

  setTypist: (username: string, isTyping: boolean) => {
    set((state) => {
      const exists = state.typists.includes(username);
      if (isTyping && !exists) {
        return { typists: [...state.typists, username] };
      } else if (!isTyping && exists) {
        return { typists: state.typists.filter((u) => u !== username) };
      }
      return state;
    });
  },

  clearChat: () => {
    set({ messages: [] });
  },
}));
