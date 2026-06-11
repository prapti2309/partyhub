export interface PlaybackSyncPayload {
  roomId: string;
  position: number;
  isPlaying: boolean;
  speed: number;
  timestamp: number;
}

export interface ChatMessagePayload {
  roomId: string;
  content: string;
  username: string;
  userId: string;
}

export interface VoiceSignalingPayload {
  targetUserId: string;
  sdp?: any;
  candidate?: any;
}

export interface ClientToServerEvents {
  "room:join": (payload: { roomCode: string; username: string }) => void;
  "room:leave": (payload: { roomId: string }) => void;
  "playback:sync": (payload: PlaybackSyncPayload) => void;
  "chat:send": (payload: ChatMessagePayload) => void;
  "voice:signal": (payload: VoiceSignalingPayload) => void;
}

export interface ServerToClientEvents {
  "room:state": (payload: { members: any[]; isPlaying: boolean; position: number }) => void;
  "playback:broadcast": (payload: PlaybackSyncPayload) => void;
  "chat:receive": (payload: ChatMessagePayload & { id: string; createdAt: Date }) => void;
  "voice:signal": (payload: VoiceSignalingPayload & { senderUserId: string }) => void;
}
