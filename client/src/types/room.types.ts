// ─── ROOM TYPES ────────────────────────────────────────────────────────────

export type RoomMemberRole = "OWNER" | "COHOST" | "VIEWER";

export interface RoomMember {
  userId: string;
  username: string;
  avatarUrl?: string;
  role: RoomMemberRole;
  isMuted: boolean;
  isDeafened?: boolean;
  isCameraOn?: boolean;
  isScreenSharing?: boolean;
  speaking?: boolean;
}

export interface RoomSettings {
  sharedControls: boolean;
  chatEnabled: boolean;
  voiceEnabled: boolean;
  videoEnabled: boolean;
  guestAllowed: boolean;
}

export interface VideoSession {
  videoUrl: string;
  videoTitle?: string;
  position: number;
  isPlaying: boolean;
  speed: number;
}

export type RoomStatus = "ACTIVE" | "CLOSED" | "BANNED";

export interface Room {
  id: string;
  code: string;
  name: string;
  isPublic: boolean;
  password?: string;
  maxCapacity: number;
  ownerId: string;
  status?: RoomStatus;
  createdAt: string;
  members: RoomMember[];
  settings: RoomSettings;
  videoSession?: VideoSession;
}

export interface CreateRoomPayload {
  name: string;
  isPublic: boolean;
  password?: string;
  maxCapacity: number;
}

export interface JoinRoomPayload {
  code: string;
  password?: string;
}
