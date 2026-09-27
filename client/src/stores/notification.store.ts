import { create } from "zustand";
import { Notification } from "../types";
import { notificationService } from "../services/notification.service";

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
    try {
      const notifications = await notificationService.getNotifications();
      const list = notifications || [];
      const unread = list.filter((n) => !n.read).length;
      set({
        notifications: list,
        unreadCount: unread,
      });
    } catch {
      set({ notifications: [], unreadCount: 0 });
    }
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
