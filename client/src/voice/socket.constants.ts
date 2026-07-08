// src/voice/socket.constants.ts
export const SOCKET_EVENTS = {
  VOICE_JOIN: "voice:join",
  VOICE_LEAVE: "voice:leave",
  VOICE_OFFER: "voice:offer",
  VOICE_ANSWER: "voice:answer",
  VOICE_ICE_CANDIDATE: "voice:ice-candidate",
  VOICE_MUTE: "voice:mute",

  // Media (Video/Screen) Events
  MEDIA_CAMERA_ON: "media:camera:on",
  MEDIA_CAMERA_OFF: "media:camera:off",
  MEDIA_SCREEN_START: "media:screen:start",
  MEDIA_SCREEN_STOP: "media:screen:stop",
  MEDIA_DEVICE_UPDATE: "media:device:update",
  MEDIA_PERMISSIONS: "media:permissions",
  MEDIA_SPEAKING: "media:speaking",
  MEDIA_QUALITY: "media:quality",
  MEDIA_STATE_UPDATE: "media:state:update",
};
