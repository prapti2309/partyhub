// server/src/dashboard/monitoring.routes.ts
import { Router } from 'express';
import { monitoringController } from './monitoring.controller';

const router = Router();

router.get('/metrics/all', monitoringController.getMetrics);
router.get('/metrics/socket', monitoringController.getSocketMetrics);
router.get('/metrics/rooms', monitoringController.getRoomMetrics);
router.get('/metrics/drift', monitoringController.getDriftMetrics);
router.get('/metrics/webrtc', monitoringController.getWebRtcMetrics);
router.get('/metrics/system', monitoringController.getSystemMetrics);

export default router;
