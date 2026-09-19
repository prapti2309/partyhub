"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/health/health.controller.ts
const express_1 = require("express");
const health_service_1 = require("../monitoring/health.service");
const metrics_service_1 = require("../monitoring/metrics.service");
const router = (0, express_1.Router)();
router.get('/health', async (_req, res) => {
    const check = await health_service_1.healthService.checkReadiness();
    res.status(check.status === 'ready' ? 200 : 503).json(check);
});
router.get('/health/live', async (_req, res) => {
    const check = await health_service_1.healthService.checkLiveness();
    res.json(check);
});
router.get('/health/ready', async (_req, res) => {
    const check = await health_service_1.healthService.checkReadiness();
    res.status(check.status === 'ready' ? 200 : 503).json(check);
});
router.get('/metrics', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(metrics_service_1.metricsService.getPrometheusMetrics());
});
exports.default = router;
