// --- USER TYPES ---
export interface Profile {
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  status?: string;
  bannerUrl?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  createdAt: string;
  profile?: Profile;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// --- ROOM TYPES ---
export type RoomMemberRole = "OWNER" | "COHOST" | "VIEWER" | "PARTICIPANT";

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
  isOnline?: boolean;
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

export interface Room {
  id: string;
  code: string;
  name: string;
  isPublic: boolean;
  password?: string;
  maxCapacity: number;
  ownerId: string;
  createdAt: string;
  members: RoomMember[];
  settings: RoomSettings;
  videoSession?: VideoSession;
}

// --- CHAT TYPES ---
export interface MessageReaction {
  emoji: string;
  users: string[]; // usernames or userIds
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

// --- NOTIFICATION TYPES ---
export type NotificationType =
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "ROOM_INVITE"
  | "MENTION"
  | "SYSTEM";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  data: {
    senderId?: string;
    senderName?: string;
    senderAvatar?: string;
    roomId?: string;
    roomCode?: string;
    roomName?: string;
    message?: string;
  };
  read: boolean;
  createdAt: string;
}

// --- FRIEND TYPES ---
export interface Friend {
  id: string;
  username: string;
  avatarUrl?: string;
  status: "ONLINE" | "AWAY" | "BUSY" | "OFFLINE";
  customStatus?: string;
  activity?: {
    watching?: string;
    roomCode?: string;
  };
}

export interface FriendRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar?: string;
  createdAt: string;
}
