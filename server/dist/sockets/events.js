"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = void 0;
exports.SOCKET_EVENTS = {
    // Room
    ROOM_JOIN: "room:join",
    ROOM_LEAVE: "room:leave",
    ROOM_STATE: "room:state",
    // Playback Player
    PLAYBACK_SYNC: "playback:sync",
    PLAYBACK_BROADCAST: "playback:broadcast",
    // Chat
    CHAT_SEND: "chat:send",
    CHAT_RECEIVE: "chat:receive",
    // Voice WebRTC
    VOICE_SIGNAL: "voice:signal",
};
