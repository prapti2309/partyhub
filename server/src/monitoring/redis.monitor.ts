// server/src/monitoring/redis.monitor.ts
import { metricsRegistry } from '../metrics/registry';
import { redisClient } from '../config/redis';

export class RedisMonitor {
  private commandDuration = metricsRegistry.histogram('redis_command_duration_ms', 'Duration of Redis commands in ms');
  private connectionFailures = metricsRegistry.counter('redis_connection_failures_total', 'Total Redis connection failures');
  private pubsubThroughput = metricsRegistry.counter('redis_pubsub_messages_total', 'Total Redis Pub/Sub messages processed');

  recordCommand(durationMs: number) {
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
      if (!redisClient || !redisClient.isOpen) {
        return { status: 'disconnected', memoryUsedBytes: 0, uptimeSeconds: 0 };
      }
      const rawInfo = await redisClient.info('memory');
      const memoryMatch = rawInfo.match(/used_memory:(\d+)/);
      const usedMemory = memoryMatch ? parseInt(memoryMatch[1], 10) : 0;
      return {
        status: 'connected',
        memoryUsedBytes: usedMemory,
        uptimeSeconds: process.uptime(),
      };
    } catch {
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

export const redisMonitor = new RedisMonitor();
