"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsService = exports.MetricsService = void 0;
// server/src/monitoring/metrics.service.ts
const api_monitor_1 = require("./api.monitor");
const socket_monitor_1 = require("./socket.monitor");
const drift_monitor_1 = require("./drift.monitor");
const room_monitor_1 = require("./room.monitor");
const webrtc_monitor_1 = require("./webrtc.monitor");
const redis_monitor_1 = require("./redis.monitor");
const registry_1 = require("../metrics/registry");
class MetricsService {
    async getAggregatedMetrics() {
        const redisStats = await redis_monitor_1.redisMonitor.getStats();
        return {
            system: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
            },
            api: api_monitor_1.apiMonitor.getStats(),
            socket: socket_monitor_1.socketMonitor.getStats(),
            drift: drift_monitor_1.driftMonitor.getStats(),
            rooms: room_monitor_1.roomMonitor.getStats(),
            webrtc: webrtc_monitor_1.webrtcMonitor.getStats(),
            redis: redisStats,
        };
    }
    getPrometheusMetrics() {
        return registry_1.metricsRegistry.toPrometheusFormat();
    }
}
exports.MetricsService = MetricsService;
exports.metricsService = new MetricsService();
