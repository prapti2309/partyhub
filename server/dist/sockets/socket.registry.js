"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketRegistry = void 0;
const redis_1 = require("@/config/redis");
const SOCKET_PREFIX = "socket:";
exports.socketRegistry = {
    async registerSocket(socketId, userId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        const data = {
            userId,
            joinTime: Date.now(),
            lastHeartbeat: Date.now(),
        };
        await client.hSet(`${SOCKET_PREFIX}${socketId}`, Object.entries(data).flat());
        await client.expire(`${SOCKET_PREFIX}${socketId}`, 60 * 60 * 24); // 24 hours TTL
    },
    async updateRoom(socketId, roomId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        if (roomId) {
            await client.hSet(`${SOCKET_PREFIX}${socketId}`, "roomId", roomId);
        }
        else {
            await client.hDel(`${SOCKET_PREFIX}${socketId}`, "roomId");
        }
    },
    async getSocket(socketId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return null;
        const data = await client.hGetAll(`${SOCKET_PREFIX}${socketId}`);
        if (!data || Object.keys(data).length === 0)
            return null;
        return {
            userId: data.userId,
            roomId: data.roomId,
            joinTime: parseInt(data.joinTime, 10),
            lastHeartbeat: parseInt(data.lastHeartbeat, 10),
        };
    },
    async removeSocket(socketId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        await client.del(`${SOCKET_PREFIX}${socketId}`);
    },
    async updateHeartbeat(socketId) {
        const client = (0, redis_1.getRedisClient)();
        if (!client)
            return;
        await client.hSet(`${SOCKET_PREFIX}${socketId}`, "lastHeartbeat", Date.now().toString());
    }
};
