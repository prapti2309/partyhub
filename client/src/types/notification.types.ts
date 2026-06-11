// ─── NOTIFICATION TYPES ────────────────────────────────────────────────────

export type NotificationType =
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "ROOM_INVITE"
  | "MENTION"
  | "SYSTEM";

export interface NotificationData {
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  roomId?: string;
  roomCode?: string;
  roomName?: string;
  message?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  data: NotificationData;
  read: boolean;
  createdAt: string;
}
