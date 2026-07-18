// src/types/chat.types.ts

/**
 * Represents a reaction on a chat message.
 */
export interface MessageReaction {
  messageId: string;
  userId: string;
  emoji: string;
  roomId?: string;
  createdAt?: string;
}

/**
 * Represents a single chat message.
 */
export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  pinned: boolean;
  edited?: boolean;
  deleted?: boolean;
  createdAt: string;
  reactions: MessageReaction[];
}
