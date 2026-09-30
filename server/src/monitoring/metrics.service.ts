// server/src/monitoring/metrics.service.ts
import { apiMonitor } from './api.monitor';
import { socketMonitor } from './socket.monitor';
import { driftMonitor } from './drift.monitor';
import { roomMonitor } from './room.monitor';
import { webrtcMonitor } from './webrtc.monitor';
import { redisMonitor } from './redis.monitor';
import { metricsRegistry } from '../metrics/registry';

export class MetricsService {
  async getAggregatedMetrics() {
    const redisStats = await redisMonitor.getStats();
    return {
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
      api: apiMonitor.getStats(),
      socket: socketMonitor.getStats(),
      drift: driftMonitor.getStats(),
      rooms: roomMonitor.getStats(),
      webrtc: webrtcMonitor.getStats(),
      redis: redisStats,
    };
  }

  getPrometheusMetrics(): string {
    return metricsRegistry.toPrometheusFormat();
  }
}

export const metricsService = new MetricsService();
