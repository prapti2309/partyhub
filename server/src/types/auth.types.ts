import { UserRole } from "@prisma/client";

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  tokenVersion: number;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  familyId: string;
  parentJti: string | null;
  sessionId: string;
  tokenVersion: number;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface SessionMetadata {
  userId: string;
  ip: string;
  userAgent: string;
  deviceName: string;
  createdAt: string;
  lastSeen: string;
  expiresAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export type AuthErrorCode =
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "SESSION_REVOKED"
  | "REPLAY_DETECTED"
  | "EMAIL_UNVERIFIED"
  | "CSRF_VIOLATION"
  | "RATE_LIMIT_EXCEEDED"
  | "INVALID_CREDENTIALS";
