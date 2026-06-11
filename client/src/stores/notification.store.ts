import { create } from "zustand";
import { Notification } from "../types";
import { MOCK_NOTIFICATIONS } from "../utils/mock-data";

interface NotificationStoreState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
  deleteNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    // Simulate API load
    await new Promise((resolve) => setTimeout(resolve, 300));
    const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
    set({
      notifications: MOCK_NOTIFICATIONS,
      unreadCount: unread,
    });
  },

  markAsRead: (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      const unread = updated.filter((n) => !n.read).length;
      return {
        notifications: updated,
        unreadCount: unread,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      return {
        notifications: updated,
        unreadCount: 0,
      };
    });
  },

  addNotification: (notification: Notification) => {
    set((state) => {
      const updated = [notification, ...state.notifications];
      const unread = updated.filter((n) => !n.read).length;
      return {
        notifications: updated,
        unreadCount: unread,
      };
    });
  },

  deleteNotification: (id: string) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      const unread = updated.filter((n) => !n.read).length;
      return {
        notifications: updated,
        unreadCount: unread,
      };
    });
  },
}));
