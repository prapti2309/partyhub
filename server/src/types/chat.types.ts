// src/types/chat.types.ts
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
  edited: boolean;
  replyTo?: string;
  reactions: MessageReaction[];
  deleted: boolean;
  metadata?: {
    system?: boolean;
    announcement?: boolean;
  };
}

export interface MessageReaction {
  userId: string;
  emoji: string; // Unicode emoji string
  reactedAt: number;
}

// DTOs for socket payloads
export interface SendMessageDTO {
  roomId: string;
  content: string;
  replyTo?: string;
}

export interface EditMessageDTO {
  messageId: string;
  content: string;
}

export interface DeleteMessageDTO {
  messageId: string;
}

export interface ReactionDTO {
  messageId: string;
  emoji: string;
}

export interface TypingDTO {
  roomId: string;
}

export type PresenceStatus = 'online' | 'offline' | 'away' | 'idle' | 'busy' | 'invisible';

export interface PresenceDTO {
  status: PresenceStatus;
  device?: string;
}

export interface ReadReceiptDTO {
  roomId: string;
  lastReadMessageId: string;
}
