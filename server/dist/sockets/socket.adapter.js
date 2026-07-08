"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisAdapter = void 0;
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("@/config/redis");
const getRedisAdapter = () => {
    const pubClient = (0, redis_1.getRedisClient)();
    if (!pubClient) {
        throw new Error("Redis client not initialized for socket adapter");
    }
    const subClient = pubClient.duplicate();
    // We need to connect the subClient if it's not already connected
    // Depending on the redis library used (redis v4), duplicate() creates an unconnected client
    subClient.connect().catch(console.error);
    return (0, redis_adapter_1.createAdapter)(pubClient, subClient);
};
exports.getRedisAdapter = getRedisAdapter;
