"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRepository = exports.RoomRepository = void 0;
const redis_1 = require("@/config/redis");
const logger_1 = require("@/utils/logger");
class RoomRepository {
    /**
     * Initialize room state in Redis.
     */
    async createRoomState(roomId, data) {
        await redis_1.redisClient.hSet(`room:${roomId}`, {
            ownerId: data.ownerId,
            code: data.code,
            name: data.name,
            createdAt: new Date().toISOString(),
        });
    }
    /**
     * Get room metadata from Redis.
     */
    async getRoomState(roomId) {
        const data = await redis_1.redisClient.hGetAll(`room:${roomId}`);
        if (!data || Object.keys(data).length === 0)
            return null;
        return data;
    }
    /**
     * Update room metadata in Redis (e.g. ownerId).
     */
    async updateRoomState(roomId, data) {
        const updates = {};
        if (data.ownerId)
            updates.ownerId = data.ownerId;
        if (data.name)
            updates.name = data.name;
        if (Object.keys(updates).length > 0) {
            await redis_1.redisClient.hSet(`room:${roomId}`, updates);
        }
    }
    /**
     * Delete room state from Redis.
     */
    async deleteRoomState(roomId) {
        await redis_1.redisClient.del(`room:${roomId}`);
        await redis_1.redisClient.del(`room:${roomId}:participants`);
    }
    /**
     * Add or update participant in room.
     */
    async saveParticipant(roomId, participant) {
        await redis_1.redisClient.hSet(`room:${roomId}:participants`, participant.userId, JSON.stringify(participant));
    }
    /**
     * Retrieve a single participant in a room.
     */
    async getParticipant(roomId, userId) {
        const data = await redis_1.redisClient.hGet(`room:${roomId}:participants`, userId);
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch (err) {
            logger_1.logger.error("Failed to parse participant data", { err, data });
            return null;
        }
    }
    /**
     * Remove a participant from the room list.
     */
    async removeParticipant(roomId, userId) {
        await redis_1.redisClient.hDel(`room:${roomId}:participants`, userId);
    }
    /**
     * List all participants in a room.
     */
    async listParticipants(roomId) {
        const all = await redis_1.redisClient.hGetAll(`room:${roomId}:participants`);
        if (!all)
            return [];
        const participants = [];
        for (const val of Object.values(all)) {
            try {
                participants.push(JSON.parse(val));
            }
            catch (err) {
                logger_1.logger.error("Failed to parse participant item", { err });
            }
        }
        return participants;
    }
    /**
     * Track presence status of user globally.
     */
    async setUserPresence(userId, status) {
        await redis_1.redisClient.set(`presence:${userId}`, status);
    }
    /**
     * Get presence status of user.
     */
    async getUserPresence(userId) {
        return await redis_1.redisClient.get(`presence:${userId}`);
    }
    /**
     * Track socket ID mapping to user and room.
     */
    async setSocketPresence(socketId, presence) {
        await redis_1.redisClient.set(`socket:${socketId}`, JSON.stringify(presence), {
            EX: 24 * 60 * 60, // 24 hours expiry safety
        });
    }
    /**
     * Get socket presence details.
     */
    async getSocketPresence(socketId) {
        const data = await redis_1.redisClient.get(`socket:${socketId}`);
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch (err) {
            return null;
        }
    }
    /**
     * Remove socket presence mapping.
     */
    async removeSocketPresence(socketId) {
        await redis_1.redisClient.del(`socket:${socketId}`);
    }
    /**
     * Update heartbeat timestamp for a user.
     */
    async updateHeartbeat(userId) {
        await redis_1.redisClient.set(`heartbeat:${userId}`, Date.now().toString(), {
            EX: 60, // 60 seconds TTL
        });
    }
    /**
     * Retrieve heartbeat timestamp for a user.
     */
    async getHeartbeat(userId) {
        return await redis_1.redisClient.get(`heartbeat:${userId}`);
    }
    /**
     * Delete heartbeat key for a user.
     */
    async removeHeartbeat(userId) {
        await redis_1.redisClient.del(`heartbeat:${userId}`);
    }
}
exports.RoomRepository = RoomRepository;
exports.roomRepository = new RoomRepository();
