import { apiClient } from "./client";
import { Notification } from "@/types";

export const notificationApi = {
  getNotifications: () => apiClient.get<Notification[]>("/notifications"),

  markAsRead: (notificationId: string) =>
    apiClient.patch<void>(`/notifications/${notificationId}/read`),

  markAllAsRead: () => apiClient.patch<void>("/notifications/read-all"),
};
