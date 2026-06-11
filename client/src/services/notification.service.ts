import { notificationApi } from "./api/notification.api";
import { Notification } from "@/types";
import { MOCK_NOTIFICATIONS } from "../utils/mock-data";

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await notificationApi.getNotifications();
      return response.data;
    } catch (e) {
      return MOCK_NOTIFICATIONS;
    }
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await notificationApi.markAsRead(notificationId);
    } catch (e) {
      console.log(`[Notification Service Mock] Marked read: ${notificationId}`);
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await notificationApi.markAllAsRead();
    } catch (e) {
      console.log("[Notification Service Mock] Marked all read");
    }
  },
};
