import { UserRole } from "@prisma/client";

export interface SocketUser {
  id: string;
  email: string;
  role: UserRole;
  sessionId: string;
  deviceMetadata?: any;
}

export interface SocketData {
  user: SocketUser;
  sessionId: string;
  roomId?: string; // Current active room
}

export interface StandardSocketResponse<T = any> {
  success: boolean;
  code?: string;
  message?: string;
  timestamp: string;
  requestId: string;
  details?: T;
}

export type SocketAck = (response: StandardSocketResponse) => void;
