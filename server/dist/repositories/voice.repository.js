"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceRepository = void 0;
// src/repositories/voice.repository.ts
const redis_1 = require("@/config/redis");
/**
 * Redis‑backed storage for voice session state.
 * We keep a per‑room set of participant socket IDs and a map of
 * peer connection identifiers. This mirrors the pattern used for
 * presence and chat.
 */
exports.voiceRepository = {
    /** Add a participant socket to a voice room */
    async addParticipant(roomId, socketId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        const key = `voice:room:${roomId}:participants`;
        await client.sAdd(key, socketId);
        // Keep participants set alive while the voice call is active
        await client.expire(key, 60 * 60); // 1 hour TTL
    },
    /** Remove a participant socket from a voice room */
    async removeParticipant(roomId, socketId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        const key = `voice:room:${roomId}:participants`;
        await client.sRem(key, socketId);
    },
    /** Get all participant socket IDs for a voice room */
    async getParticipants(roomId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return [];
        const key = `voice:room:${roomId}:participants`;
        return await client.sMembers(key);
    },
    /** Store the last SDP offer/answer for a socket – useful for ICE restarts */
    async setLastSdp(roomId, socketId, sdp) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        const key = `voice:room:${roomId}:sdp:${socketId}`;
        await client.set(key, sdp, { EX: 60 * 5 }); // 5 min TTL
    },
    async getLastSdp(roomId, socketId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return null;
        const key = `voice:room:${roomId}:sdp:${socketId}`;
        return await client.get(key);
    },
};
