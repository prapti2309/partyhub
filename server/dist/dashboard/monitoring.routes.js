"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/dashboard/monitoring.routes.ts
const express_1 = require("express");
const monitoring_controller_1 = require("./monitoring.controller");
const router = (0, express_1.Router)();
router.get('/metrics/all', monitoring_controller_1.monitoringController.getMetrics);
router.get('/metrics/socket', monitoring_controller_1.monitoringController.getSocketMetrics);
router.get('/metrics/rooms', monitoring_controller_1.monitoringController.getRoomMetrics);
router.get('/metrics/drift', monitoring_controller_1.monitoringController.getDriftMetrics);
router.get('/metrics/webrtc', monitoring_controller_1.monitoringController.getWebRtcMetrics);
router.get('/metrics/system', monitoring_controller_1.monitoringController.getSystemMetrics);
exports.default = router;
