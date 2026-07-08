"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRepository = void 0;
const redis_1 = require("@/config/redis");
const logger_1 = require("@/utils/logger");
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const ROTATION_TTL = 24 * 60 * 60; // 24 hours in seconds
exports.sessionRepository = {
    async createSession(sessionId, metadata) {
        try {
            const sessionKey = `session:${sessionId}`;
            const userSessionsKey = `user:sessions:${metadata.userId}`;
            await redis_1.redisClient.set(sessionKey, JSON.stringify(metadata), {
                EX: SESSION_TTL,
            });
            await redis_1.redisClient.sAdd(userSessionsKey, sessionId);
            await redis_1.redisClient.expire(userSessionsKey, SESSION_TTL);
        }
        catch (err) {
            logger_1.logger.error("Redis createSession error", { err });
        }
    },
    async getSession(sessionId) {
        try {
            const data = await redis_1.redisClient.get(`session:${sessionId}`);
            if (!data)
                return null;
            return JSON.parse(data);
        }
        catch (err) {
            logger_1.logger.error("Redis getSession error", { err });
            return null;
        }
    },
    async updateSessionLastSeen(sessionId) {
        try {
            const sessionKey = `session:${sessionId}`;
            const data = await redis_1.redisClient.get(sessionKey);
            if (data) {
                const metadata = JSON.parse(data);
                metadata.lastSeen = new Date().toISOString();
                await redis_1.redisClient.set(sessionKey, JSON.stringify(metadata), {
                    KEEPTTL: true,
                });
            }
        }
        catch (err) {
            logger_1.logger.error("Redis updateSessionLastSeen error", { err });
        }
    },
    async deleteSession(userId, sessionId) {
        try {
            await redis_1.redisClient.del(`session:${sessionId}`);
            await redis_1.redisClient.sRem(`user:sessions:${userId}`, sessionId);
        }
        catch (err) {
            logger_1.logger.error("Redis deleteSession error", { err });
        }
    },
    async deleteAllSessionsForUser(userId) {
        try {
            const userSessionsKey = `user:sessions:${userId}`;
            const sessionIds = await redis_1.redisClient.sMembers(userSessionsKey);
            const keysToDelete = sessionIds.map((id) => `session:${id}`);
            if (keysToDelete.length > 0) {
                await redis_1.redisClient.del(keysToDelete);
            }
            await redis_1.redisClient.del(userSessionsKey);
        }
        catch (err) {
            logger_1.logger.error("Redis deleteAllSessionsForUser error", { err });
        }
    },
    async logRotatedToken(oldJti, newJti) {
        try {
            await redis_1.redisClient.set(`token:rotated:${oldJti}`, newJti, {
                EX: ROTATION_TTL,
            });
        }
        catch (err) {
            logger_1.logger.error("Redis logRotatedToken error", { err });
        }
    },
    async getRotatedToken(oldJti) {
        try {
            return await redis_1.redisClient.get(`token:rotated:${oldJti}`);
        }
        catch (err) {
            logger_1.logger.error("Redis getRotatedToken error", { err });
            return null;
        }
    },
    async listActiveSessions(userId) {
        try {
            const userSessionsKey = `user:sessions:${userId}`;
            const sessionIds = await redis_1.redisClient.sMembers(userSessionsKey);
            if (sessionIds.length === 0)
                return [];
            const sessionKeys = sessionIds.map((id) => `session:${id}`);
            const rawSessions = await redis_1.redisClient.mGet(sessionKeys);
            const activeSessions = [];
            for (let i = 0; i < rawSessions.length; i++) {
                const data = rawSessions[i];
                if (data) {
                    activeSessions.push(JSON.parse(data));
                }
                else {
                    // Stale session ID in set, remove it
                    await redis_1.redisClient.sRem(userSessionsKey, sessionIds[i]);
                }
            }
            return activeSessions;
        }
        catch (err) {
            logger_1.logger.error("Redis listActiveSessions error", { err });
            return [];
        }
    },
};
