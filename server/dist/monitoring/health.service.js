"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthService = exports.HealthService = void 0;
// server/src/monitoring/health.service.ts
const prisma_1 = require("../config/prisma");
const redis_1 = require("../config/redis");
class HealthService {
    getEventLoopDelay() {
        return new Promise((resolve) => {
            const start = process.hrtime.bigint();
            setImmediate(() => {
                const delay = Number(process.hrtime.bigint() - start) / 1e6;
                resolve(delay);
            });
        });
    }
    async checkLiveness() {
        return {
            status: 'OK',
            uptime: process.uptime(),
            timestamp: Date.now(),
        };
    }
    async checkReadiness() {
        let dbStatus = 'unhealthy';
        let redisStatus = 'unhealthy';
        let ready = true;
        try {
            await prisma_1.prisma.$queryRaw `SELECT 1`;
            dbStatus = 'healthy';
        }
        catch {
            ready = false;
        }
        try {
            if (redis_1.redisClient && redis_1.redisClient.isOpen) {
                const start = Date.now();
                await redis_1.redisClient.ping();
                redisStatus = `healthy (${Date.now() - start}ms)`;
            }
            else {
                ready = false;
            }
        }
        catch {
            ready = false;
        }
        const eventLoopDelay = await this.getEventLoopDelay();
        const mem = process.memoryUsage();
        return {
            status: ready ? 'ready' : 'not_ready',
            timestamp: Date.now(),
            components: {
                database: dbStatus,
                redis: redisStatus,
            },
            performance: {
                eventLoopDelayMs: eventLoopDelay,
                memoryUsedPercent: (mem.heapUsed / mem.heapTotal) * 100,
                heapUsedMb: mem.heapUsed / 1024 / 1024,
            },
        };
    }
}
exports.HealthService = HealthService;
exports.healthService = new HealthService();
