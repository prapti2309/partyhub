"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisMonitor = exports.RedisMonitor = void 0;
// server/src/monitoring/redis.monitor.ts
const registry_1 = require("../metrics/registry");
const redis_1 = require("../config/redis");
class RedisMonitor {
    commandDuration = registry_1.metricsRegistry.histogram('redis_command_duration_ms', 'Duration of Redis commands in ms');
    connectionFailures = registry_1.metricsRegistry.counter('redis_connection_failures_total', 'Total Redis connection failures');
    pubsubThroughput = registry_1.metricsRegistry.counter('redis_pubsub_messages_total', 'Total Redis Pub/Sub messages processed');
    recordCommand(durationMs) {
        this.commandDuration.observe(durationMs);
    }
    recordConnectionFailure() {
        this.connectionFailures.inc();
    }
    recordPubSubMessage() {
        this.pubsubThroughput.inc();
    }
    async getRedisInfo() {
        try {
            if (!redis_1.redisClient || !redis_1.redisClient.isOpen) {
                return { status: 'disconnected', memoryUsedBytes: 0, uptimeSeconds: 0 };
            }
            const rawInfo = await redis_1.redisClient.info('memory');
            const memoryMatch = rawInfo.match(/used_memory:(\d+)/);
            const usedMemory = memoryMatch ? parseInt(memoryMatch[1], 10) : 0;
            return {
                status: 'connected',
                memoryUsedBytes: usedMemory,
                uptimeSeconds: process.uptime(),
            };
        }
        catch {
            return { status: 'error', memoryUsedBytes: 0, uptimeSeconds: 0 };
        }
    }
    async getStats() {
        const info = await this.getRedisInfo();
        return {
            commandDuration: this.commandDuration.getStats(),
            connectionFailures: this.connectionFailures.get(),
            pubsubThroughput: this.pubsubThroughput.get(),
            ...info,
        };
    }
}
exports.RedisMonitor = RedisMonitor;
exports.redisMonitor = new RedisMonitor();
