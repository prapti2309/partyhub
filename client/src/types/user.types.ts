// ─── USER TYPES ────────────────────────────────────────────────────────────

export interface Profile {
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  status?: string;
  bannerUrl?: string;
}

export type UserRole = "USER" | "MODERATOR" | "ADMIN";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  profile?: Profile;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type PresenceStatus = "ONLINE" | "AWAY" | "BUSY" | "OFFLINE";
