"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringController = void 0;
const metrics_service_1 = require("../monitoring/metrics.service");
const socket_monitor_1 = require("../monitoring/socket.monitor");
const room_monitor_1 = require("../monitoring/room.monitor");
const drift_monitor_1 = require("../monitoring/drift.monitor");
const webrtc_monitor_1 = require("../monitoring/webrtc.monitor");
exports.monitoringController = {
    async getMetrics(_req, res) {
        const stats = await metrics_service_1.metricsService.getAggregatedMetrics();
        res.json(stats);
    },
    getSocketMetrics(_req, res) {
        res.json(socket_monitor_1.socketMonitor.getStats());
    },
    getRoomMetrics(_req, res) {
        res.json(room_monitor_1.roomMonitor.getStats());
    },
    getDriftMetrics(_req, res) {
        res.json(drift_monitor_1.driftMonitor.getStats());
    },
    getWebRtcMetrics(_req, res) {
        res.json(webrtc_monitor_1.webrtcMonitor.getStats());
    },
    async getSystemMetrics(_req, res) {
        const stats = await metrics_service_1.metricsService.getAggregatedMetrics();
        res.json({
            system: stats.system,
            redis: stats.redis,
        });
    },
};
