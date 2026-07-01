export const SOCKET_EVENTS = {
  // Connection Events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",
  PING: "PING",
  PONG: "PONG",

  // Room Events
  ROOM_CREATE: "room:create",
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  ROOM_CLOSE: "room:close",
  ROOM_KICK: "room:kick",
  ROOM_TRANSFER: "room:transfer",
  ROOM_STATE: "room:state",
  ROOM_ERROR: "room:error",
  PARTICIPANT_JOINED: "room:participant_joined",
  PARTICIPANT_LEFT: "room:participant_left",
  ROOM_OWNERSHIP_TRANSFERRED: "room:ownership_transferred",

  // Player Events
  PLAYER_PLAY: "player:play",
  PLAYER_PAUSE: "player:pause",
  PLAYER_SEEK: "player:seek",
  PLAYER_BUFFER: "player:buffer",
  PLAYER_READY: "player:ready",
  PLAYER_SYNC: "player:sync",
  PLAYER_CHANGE_VIDEO: "player:changeVideo",
  PLAYER_ENDED: "player:ended",
  PLAYER_STATE: "player:state",
  PLAYER_ERROR: "player:error",

  // Chat Events
  CHAT_SEND: "chat:send",
  CHAT_EDIT: "chat:edit",
  CHAT_DELETE: "chat:delete",
  CHAT_TYPING_START: "chat:typing:start",
  CHAT_TYPING_STOP: "chat:typing:stop",
  CHAT_HISTORY: "chat:history",
  CHAT_REACTION_ADD: "chat:reaction:add",
  CHAT_REACTION_REMOVE: "chat:reaction:remove",
  CHAT_PIN: "chat:pin",
  CHAT_MESSAGE: "chat:message", // Broadcasted message
  CHAT_READ_RECEIPT: "chat:read:receipt",
  // Voice Events
  VOICE_JOIN: "voice:join",
  VOICE_LEAVE: "voice:leave",
  VOICE_OFFER: "voice:offer",
  VOICE_ANSWER: "voice:answer",
  VOICE_ICE_CANDIDATE: "voice:ice-candidate",
  VOICE_MUTE: "voice:mute",
  VOICE_UNMUTE: "voice:unmute",
  VOICE_PEER_CONNECTED: "voice:peer-connected",
  VOICE_PEER_DISCONNECTED: "voice:peer-disconnected",
  VOICE_ERROR: "voice:error",
  VOICE_STATE: "voice:state",
};

export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  ROOM_NOT_FOUND: "ROOM_NOT_FOUND",
  ROOM_FULL: "ROOM_FULL",
  INVALID_PAYLOAD: "INVALID_PAYLOAD",
  RATE_LIMITED: "RATE_LIMITED",
  PLAYBACK_CONFLICT: "PLAYBACK_CONFLICT",
  OWNER_REQUIRED: "OWNER_REQUIRED",
  VIDEO_NOT_FOUND: "VIDEO_NOT_FOUND",
  CHAT_DISABLED: "CHAT_DISABLED",
  USER_MUTED: "USER_MUTED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};
