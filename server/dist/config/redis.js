"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.connectRedis = connectRedis;
exports.disconnectRedis = disconnectRedis;
const redis_1 = require("redis");
const env_1 = require("./env");
const logger_1 = require("@/utils/logger");
async function connectRedis() {
    exports.redisClient = (0, redis_1.createClient)({
        url: env_1.env.REDIS_URL,
    });
    exports.redisClient.on("error", (err) => logger_1.logger.error("❌ Redis client connection failure", { err }));
    exports.redisClient.on("connect", () => logger_1.logger.info("🔌 Redis client connecting..."));
    exports.redisClient.on("ready", () => logger_1.logger.info("✅ Redis client connection successful"));
    exports.redisClient.connect().catch((err) => {
        logger_1.logger.error("❌ Initial Redis connection failure", { err });
    });
}
async function disconnectRedis() {
    if (exports.redisClient) {
        await exports.redisClient.quit();
    }
}
