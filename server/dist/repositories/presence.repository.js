"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presenceRepository = void 0;
// src/repositories/presence.repository.ts
const redis_1 = require("@/config/redis");
const USER_STATUS_PREFIX = 'presence:user:';
const TYPING_PREFIX = 'typing:room:'; // set of userIds typing in room
const UNREAD_PREFIX = 'unread:room:'; // hash per user
exports.presenceRepository = {
    // Participant management (already exists in original file, re‑exported here for completeness)
    async addParticipant(roomId, userId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        await client.sAdd(`room:participants:${roomId}`, userId);
    },
    async removeParticipant(roomId, userId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        await client.sRem(`room:participants:${roomId}`, userId);
    },
    async getParticipants(roomId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return [];
        return await client.sMembers(`room:participants:${roomId}`);
    },
    // ---------- Presence status ----------
    async setUserStatus(userId, status, device, ttlSeconds = 30) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        const payload = JSON.stringify({ status, device, ts: Date.now() });
        await client.set(`${USER_STATUS_PREFIX}${userId}`, payload, { EX: ttlSeconds });
    },
    async getUserStatus(userId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return null;
        const raw = await client.get(`${USER_STATUS_PREFIX}${userId}`);
        if (!raw)
            return null;
        try {
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    },
    // ---------- Typing ----------
    async addTypingUser(roomId, userId, ttl = 5) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        const key = `${TYPING_PREFIX}${roomId}`;
        await client.sAdd(key, userId);
        await client.expire(key, ttl);
    },
    async removeTypingUser(roomId, userId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        await client.sRem(`${TYPING_PREFIX}${roomId}`, userId);
    },
    async getTypingUsers(roomId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return [];
        return await client.sMembers(`${TYPING_PREFIX}${roomId}`);
    },
    // ---------- Unread counters ----------
    async incUnread(roomId, userId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        const key = `${UNREAD_PREFIX}${roomId}:user:${userId}`;
        await client.incr(key);
        // keep for long term (30 days)
        await client.expire(key, 60 * 60 * 24 * 30);
    },
    async resetUnread(roomId, userId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        await client.set(`${UNREAD_PREFIX}${roomId}:user:${userId}`, '0');
    },
    async getUnread(roomId, userId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return 0;
        const val = await client.get(`${UNREAD_PREFIX}${roomId}:user:${userId}`);
        return val ? parseInt(val, 10) : 0;
    },
};
