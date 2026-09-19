"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driftMonitor = exports.DriftMonitor = void 0;
// server/src/monitoring/drift.monitor.ts
const registry_1 = require("../metrics/registry");
class DriftMonitor {
    softCorrections = registry_1.metricsRegistry.counter('drift_corrections_soft_total', 'Total soft playback rate corrections');
    hardCorrections = registry_1.metricsRegistry.counter('drift_corrections_hard_total', 'Total hard seek corrections');
    criticalCorrections = registry_1.metricsRegistry.counter('drift_corrections_critical_total', 'Total critical full synchronization requests');
    driftSeconds = registry_1.metricsRegistry.histogram('drift_seconds', 'Playback drift in seconds between client and host');
    roomHealthScores = new Map();
    recordCorrection(type, driftSec, roomId) {
        this.driftSeconds.observe(Math.abs(driftSec));
        if (type === 'soft') {
            this.softCorrections.inc();
        }
        else if (type === 'hard') {
            this.hardCorrections.inc();
        }
        else if (type === 'critical') {
            this.criticalCorrections.inc();
        }
        // Dynamic room drift health score (starts at 100, drops on seeks/resyncs)
        let score = this.roomHealthScores.get(roomId) ?? 100;
        if (type === 'critical') {
            score = Math.max(0, score - 15);
        }
        else if (type === 'hard') {
            score = Math.max(0, score - 5);
        }
        else if (type === 'soft') {
            score = Math.max(0, score - 1);
        }
        // Gradually recover health score towards 100 if drift is minor
        if (Math.abs(driftSec) < 0.1 && score < 100) {
            score = Math.min(100, score + 0.5);
        }
        this.roomHealthScores.set(roomId, score);
    }
    getRoomHealth(roomId) {
        return this.roomHealthScores.get(roomId) ?? 100;
    }
    cleanupRoom(roomId) {
        this.roomHealthScores.delete(roomId);
    }
    getStats() {
        let totalScore = 0;
        const scores = Array.from(this.roomHealthScores.values());
        if (scores.length > 0) {
            totalScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        }
        else {
            totalScore = 100;
        }
        return {
            softCorrections: this.softCorrections.get(),
            hardCorrections: this.hardCorrections.get(),
            criticalCorrections: this.criticalCorrections.get(),
            driftStats: this.driftSeconds.getStats(),
            averageHealthScore: totalScore,
        };
    }
}
exports.DriftMonitor = DriftMonitor;
exports.driftMonitor = new DriftMonitor();
