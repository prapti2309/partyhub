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
    CHAT_EDIT: "chat:edit",
    CHAT_DELETE: "chat:delete",
    CHAT_REACTION_ADD: "chat:reaction:add",
    CHAT_REACTION_REMOVE: "chat:reaction:remove",
    CHAT_TYPING_START: "chat:typing:start",
    CHAT_TYPING_STOP: "chat:typing:stop",
    CHAT_READ_RECEIPT: "chat:read:receipt",
    // Voice WebRTC
    VOICE_SIGNAL: "voice:signal",
};
