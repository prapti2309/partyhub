// ─── CHAT / MESSAGE TYPES ──────────────────────────────────────────────────

export interface MessageReaction {
  emoji: string;
  users: string[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  reactions: MessageReaction[];
}
