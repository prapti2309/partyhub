"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisRepository = void 0;
const redis_1 = require("@/config/redis");
exports.redisRepository = {
    async setWithTTL(key, value, ttlSeconds) {
        const client = redis_1.redisClient;
        if (!client)
            return;
        await client.setEx(key, ttlSeconds, value);
    },
    async get(key) {
        const client = redis_1.redisClient;
        if (!client)
            return null;
        return await client.get(key);
    },
    async del(key) {
        const client = redis_1.redisClient;
        if (!client)
            return;
        await client.del(key);
    },
    async hSet(key, field, value) {
        const client = redis_1.redisClient;
        if (!client)
            return;
        await client.hSet(key, field, value);
    },
    async hGet(key, field) {
        const client = redis_1.redisClient;
        if (!client)
            return undefined;
        return await client.hGet(key, field);
    },
    async hGetAll(key) {
        const client = redis_1.redisClient;
        if (!client)
            return {};
        return await client.hGetAll(key);
    },
    async hDel(key, field) {
        const client = redis_1.redisClient;
        if (!client)
            return;
        await client.hDel(key, field);
    },
    async expire(key, ttlSeconds) {
        const client = redis_1.redisClient;
        if (!client)
            return;
        await client.expire(key, ttlSeconds);
    }
};
