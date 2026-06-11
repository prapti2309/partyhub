// ─── SOCKET.IO EVENT TYPES ─────────────────────────────────────────────────
// Strictly typed event maps for Socket.IO client-server communication.

// ─── ROOM EVENT PAYLOADS ───────────────────────────────────────────────────

export interface JoinRoomPayload {
  roomCode: string;
  password?: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface UserJoinedPayload {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

export interface UserLeftPayload {
  userId: string;
  displayName: string;
}

export interface RoomStatePayload {
  members: Array<{
    userId: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
  }>;
  currentVideo?: string;
  position: number;
  isPlaying: boolean;
}

// ─── PLAYBACK EVENT PAYLOADS ───────────────────────────────────────────────

export interface PlayPayload {
  roomId: string;
  position: number;
  timestamp?: number;
}

export interface PausePayload {
  roomId: string;
  position: number;
}

export interface SeekPayload {
  roomId: string;
  position: number;
  isPlaying?: boolean;
}

export interface SpeedChangePayload {
  roomId: string;
  speed: number;
}

export interface VideoChangePayload {
  roomId: string;
  videoUrl: string;
  videoTitle: string;
}

export interface SyncResponsePayload {
  position: number;
  isPlaying: boolean;
  speed: number;
  timestamp: number;
}

// ─── CHAT EVENT PAYLOADS ───────────────────────────────────────────────────

export interface ChatMessagePayload {
  roomId: string;
  content: string;
  username?: string;
  userId?: string;
}

export interface NewMessagePayload {
  id: string;
  userId: string;
  displayName: string;
  content: string;
  createdAt: string;
}

export interface TypingPayload {
  roomId: string;
  username: string;
}

export interface TypingUpdatePayload {
  users: Array<{ userId: string; displayName: string }>;
}

export interface MessageReactPayload {
  roomId: string;
  messageId: string;
  emoji: string;
}

// ─── VOICE / WEBRTC EVENT PAYLOADS ─────────────────────────────────────────

export interface VoiceJoinPayload {
  roomId: string;
}

export interface VoiceLeavePayload {
  roomId: string;
}

export interface VoiceConnectedPayload {
  userId: string;
  displayName: string;
}

export interface VoiceMutePayload {
  roomId: string;
  muted: boolean;
  userId?: string;
}

export interface VoiceCameraPayload {
  userId: string;
}

export interface WebRTCOfferPayload {
  targetId: string;
  sdp: RTCSessionDescriptionInit;
}

export interface WebRTCAnswerPayload {
  targetId: string;
  sdp: RTCSessionDescriptionInit;
}

export interface WebRTCIcePayload {
  targetId: string;
  candidate: RTCIceCandidateInit;
}

// ─── CLIENT → SERVER EVENT MAP ─────────────────────────────────────────────

export interface ClientToServerEvents {
  "join-room": (payload: JoinRoomPayload) => void;
  "leave-room": (payload: LeaveRoomPayload) => void;
  play: (payload: PlayPayload) => void;
  pause: (payload: PausePayload) => void;
  seek: (payload: SeekPayload) => void;
  "speed-change": (payload: SpeedChangePayload) => void;
  "video-change": (payload: VideoChangePayload) => void;
  "sync-request": (payload: { roomId: string }) => void;
  "chat-message": (payload: ChatMessagePayload) => void;
  "typing-start": (payload: TypingPayload) => void;
  "typing-stop": (payload: TypingPayload) => void;
  "message-react": (payload: MessageReactPayload) => void;
  "voice-join": (payload: VoiceJoinPayload) => void;
  "voice-leave": (payload: VoiceLeavePayload) => void;
  "voice-mute": (payload: VoiceMutePayload) => void;
  "webrtc-offer": (payload: WebRTCOfferPayload) => void;
  "webrtc-answer": (payload: WebRTCAnswerPayload) => void;
  "webrtc-ice": (payload: WebRTCIcePayload) => void;
}

// ─── SERVER → CLIENT EVENT MAP ─────────────────────────────────────────────

export interface ServerToClientEvents {
  "user-joined": (payload: UserJoinedPayload) => void;
  "user-left": (payload: UserLeftPayload) => void;
  "room-state": (payload: RoomStatePayload) => void;
  play: (payload: PlayPayload) => void;
  pause: (payload: PausePayload) => void;
  seek: (payload: SeekPayload) => void;
  "speed-change": (payload: SpeedChangePayload) => void;
  "sync-response": (payload: SyncResponsePayload) => void;
  "new-message": (payload: NewMessagePayload) => void;
  "typing-update": (payload: TypingUpdatePayload) => void;
  "message-pin": (payload: { messageId: string; pinned: boolean }) => void;
  "message-delete": (payload: { messageId: string }) => void;
  "voice-connected": (payload: VoiceConnectedPayload) => void;
  "voice-disconnected": (payload: { userId: string }) => void;
  "voice-status": (payload: { userId: string; muted: boolean }) => void;
  "webrtc-offer": (payload: WebRTCOfferPayload) => void;
  "webrtc-answer": (payload: WebRTCAnswerPayload) => void;
  "webrtc-ice": (payload: WebRTCIcePayload) => void;
}

// ─── SOCKET EVENT NAME UNIONS ──────────────────────────────────────────────

export type ClientEventName = keyof ClientToServerEvents;
export type ServerEventName = keyof ServerToClientEvents;
