// ─── FRIEND TYPES ──────────────────────────────────────────────────────────

import type { PresenceStatus } from "./user.types";

export interface FriendActivity {
  watching?: string;
  roomCode?: string;
}

export interface Friend {
  id: string;
  username: string;
  avatarUrl?: string;
  status: PresenceStatus;
  customStatus?: string;
  activity?: FriendActivity;
}

export interface FriendRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar?: string;
  createdAt: string;
}
