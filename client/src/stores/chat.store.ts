// src/stores/chat.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ChatMessage, MessageReaction } from '@/types/chat.types';

export interface ChatState {
  messages: ChatMessage[];
  typingUsers: string[]; // userIds currently typing
  unreadCount: number;
  lastReadMessageId?: string;
  addMessage: (msg: ChatMessage) => void;
  editMessage: (msgId: string, newContent: string) => void;
  deleteMessage: (msgId: string) => void;
  addReaction: (reaction: MessageReaction) => void;
  removeReaction: (messageId: string, userId: string, emoji: string) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
  markRead: (lastReadMessageId: string) => void;
}

export const useChatStore = create<ChatState>()(
  devtools((set, get) => ({
    messages: [],
    typingUsers: [],
    unreadCount: 0,
    lastReadMessageId: undefined,
    addMessage: (msg) =>
      set((state) => ({ messages: [...state.messages, msg] })),
    editMessage: (msgId, newContent) =>
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === msgId ? { ...m, content: newContent, edited: true } : m
        ),
      })),
    deleteMessage: (msgId) =>
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === msgId ? { ...m, deleted: true } : m
        ),
      })),
    addReaction: (reaction) =>
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === reaction.messageId
            ? { ...m, reactions: [...(m.reactions || []), reaction] }
            : m
        ),
      })),
    removeReaction: (messageId, userId, emoji) =>
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId
            ? {
                ...m,
                reactions: (m.reactions || []).filter(
                  (r) => !(r.userId === userId && r.emoji === emoji)
                ),
              }
            : m
        ),
      })),
    setTyping: (userId, isTyping) =>
      set((state) => ({
        typingUsers: isTyping
          ? Array.from(new Set([...state.typingUsers, userId]))
          : state.typingUsers.filter((id) => id !== userId),
      })),
    incrementUnread: () =>
      set((state) => ({ unreadCount: state.unreadCount + 1 })),
    resetUnread: () => set({ unreadCount: 0 }),
    markRead: (lastReadMessageId) =>
      set({ lastReadMessageId, unreadCount: 0 }),
  }))
);
