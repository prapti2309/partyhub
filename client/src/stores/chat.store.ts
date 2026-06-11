import { create } from "zustand";
import { ChatMessage, MessageReaction } from "../types";
import { MOCK_CHAT } from "../utils/mock-data";

interface ChatStoreState {
  messages: ChatMessage[];
  typists: string[];
  sendMessage: (roomId: string, content: string, username: string, userId: string) => void;
  addMessage: (message: ChatMessage) => void;
  deleteMessage: (messageId: string) => void;
  togglePinMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string, username: string) => void;
  setTypist: (username: string, isTyping: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
  messages: MOCK_CHAT,
  typists: [],

  sendMessage: (roomId: string, content: string, username: string, userId: string) => {
    const newMessage: ChatMessage = {
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      roomId,
      userId,
      username,
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
      content,
      pinned: false,
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

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

  addReaction: (messageId: string, emoji: string, username: string) => {
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id !== messageId) return m;

        const updatedReactions = [...m.reactions];
        const existingReactionIndex = updatedReactions.findIndex((r) => r.emoji === emoji);

        if (existingReactionIndex > -1) {
          const reaction = updatedReactions[existingReactionIndex];
          const userIndex = reaction.users.indexOf(username);

          if (userIndex > -1) {
            // Remove user
            reaction.users.splice(userIndex, 1);
            // If no users left, remove reaction entirely
            if (reaction.users.length === 0) {
              updatedReactions.splice(existingReactionIndex, 1);
            }
          } else {
            // Add user
            reaction.users.push(username);
          }
        } else {
          // New reaction emoji
          updatedReactions.push({ emoji, users: [username] });
        }

        return { ...m, reactions: updatedReactions };
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
