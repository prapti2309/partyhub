"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketMonitor = exports.SocketMonitor = void 0;
// server/src/monitoring/socket.monitor.ts
const registry_1 = require("../metrics/registry");
class SocketMonitor {
    activeConnections = registry_1.metricsRegistry.gauge('socket_connections_active', 'Active Socket.IO connections');
    totalConnections = registry_1.metricsRegistry.counter('socket_connections_total', 'Total Socket.IO connections accepted');
    unexpectedDisconnects = registry_1.metricsRegistry.counter('socket_disconnects_unexpected', 'Unexpected Socket.IO disconnects');
    reconnectAttempts = registry_1.metricsRegistry.counter('socket_reconnect_attempts', 'Automatic socket reconnect attempts');
    reconnectSuccesses = registry_1.metricsRegistry.counter('socket_reconnect_success', 'Successful socket reconnects');
    // Event handler latency
    eventLatency = registry_1.metricsRegistry.histogram('socket_event_latency_ms', 'Latency of processing socket events');
    validationDuration = registry_1.metricsRegistry.histogram('socket_validation_duration_ms', 'Duration of event payload validations');
    recordConnection() {
        this.activeConnections.inc();
        this.totalConnections.inc();
    }
    recordDisconnect(reason) {
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
    recordEvent(_eventName, durationMs, valDurationMs = 0) {
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
exports.SocketMonitor = SocketMonitor;
exports.socketMonitor = new SocketMonitor();
