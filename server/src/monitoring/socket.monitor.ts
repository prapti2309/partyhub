// server/src/monitoring/socket.monitor.ts
import { metricsRegistry } from '../metrics/registry';

export class SocketMonitor {
  private activeConnections = metricsRegistry.gauge('socket_connections_active', 'Active Socket.IO connections');
  private totalConnections = metricsRegistry.counter('socket_connections_total', 'Total Socket.IO connections accepted');
  private unexpectedDisconnects = metricsRegistry.counter('socket_disconnects_unexpected', 'Unexpected Socket.IO disconnects');
  private reconnectAttempts = metricsRegistry.counter('socket_reconnect_attempts', 'Automatic socket reconnect attempts');
  private reconnectSuccesses = metricsRegistry.counter('socket_reconnect_success', 'Successful socket reconnects');
  
  // Event handler latency
  private eventLatency = metricsRegistry.histogram('socket_event_latency_ms', 'Latency of processing socket events');
  private validationDuration = metricsRegistry.histogram('socket_validation_duration_ms', 'Duration of event payload validations');

  recordConnection() {
    this.activeConnections.inc();
    this.totalConnections.inc();
  }

  recordDisconnect(reason: string) {
    this.activeConnections.dec();
    const unexpectedReasons = ['transport close', 'transport error', 'ping timeout'];
    if (unexpectedReasons.includes(reason)) {
      this.unexpectedDisconnects.inc();
    }
  }

  recordReconnectAttempt() {
    this.reconnectAttempts.inc();
  }

  recordReconnectSuccess() {
    this.reconnectSuccesses.inc();
  }

  recordEvent(eventName: string, durationMs: number, valDurationMs = 0) {
    this.eventLatency.observe(durationMs);
    if (valDurationMs > 0) {
      this.validationDuration.observe(valDurationMs);
    }
  }

  getStats() {
    return {
      activeConnections: this.activeConnections.get(),
      totalConnections: this.totalConnections.get(),
      unexpectedDisconnects: this.unexpectedDisconnects.get(),
      reconnectAttempts: this.reconnectAttempts.get(),
      reconnectSuccesses: this.reconnectSuccesses.get(),
      eventLatency: this.eventLatency.getStats(),
      validationDuration: this.validationDuration.getStats(),
    };
  }
}

export const socketMonitor = new SocketMonitor();
