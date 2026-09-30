// server/src/dashboard/monitoring.controller.ts
import { Request, Response } from 'express';
import { metricsService } from '../monitoring/metrics.service';
import { socketMonitor } from '../monitoring/socket.monitor';
import { roomMonitor } from '../monitoring/room.monitor';
import { driftMonitor } from '../monitoring/drift.monitor';
import { webrtcMonitor } from '../monitoring/webrtc.monitor';

export const monitoringController = {
  async getMetrics(_req: Request, res: Response) {
    const stats = await metricsService.getAggregatedMetrics();
    res.json(stats);
  },

  getSocketMetrics(_req: Request, res: Response) {
    res.json(socketMonitor.getStats());
  },

  getRoomMetrics(_req: Request, res: Response) {
    res.json(roomMonitor.getStats());
  },

  getDriftMetrics(_req: Request, res: Response) {
    res.json(driftMonitor.getStats());
  },

  getWebRtcMetrics(_req: Request, res: Response) {
    res.json(webrtcMonitor.getStats());
  },

  async getSystemMetrics(_req: Request, res: Response) {
    const stats = await metricsService.getAggregatedMetrics();
    res.json({
      system: stats.system,
      redis: stats.redis,
    });
  },
};
