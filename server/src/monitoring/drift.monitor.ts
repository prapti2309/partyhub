// server/src/monitoring/drift.monitor.ts
import { metricsRegistry } from '../metrics/registry';

export class DriftMonitor {
  private softCorrections = metricsRegistry.counter('drift_corrections_soft_total', 'Total soft playback rate corrections');
  private hardCorrections = metricsRegistry.counter('drift_corrections_hard_total', 'Total hard seek corrections');
  private criticalCorrections = metricsRegistry.counter('drift_corrections_critical_total', 'Total critical full synchronization requests');
  
  private driftSeconds = metricsRegistry.histogram('drift_seconds', 'Playback drift in seconds between client and host');
  private roomHealthScores = new Map<string, number>();

  recordCorrection(type: 'soft' | 'hard' | 'critical', driftSec: number, roomId: string) {
    this.driftSeconds.observe(Math.abs(driftSec));
    
    if (type === 'soft') {
      this.softCorrections.inc();
    } else if (type === 'hard') {
      this.hardCorrections.inc();
    } else if (type === 'critical') {
      this.criticalCorrections.inc();
    }

    // Dynamic room drift health score (starts at 100, drops on seeks/resyncs)
    let score = this.roomHealthScores.get(roomId) ?? 100;
    if (type === 'critical') {
      score = Math.max(0, score - 15);
    } else if (type === 'hard') {
      score = Math.max(0, score - 5);
    } else if (type === 'soft') {
      score = Math.max(0, score - 1);
    }
    // Gradually recover health score towards 100 if drift is minor
    if (Math.abs(driftSec) < 0.1 && score < 100) {
      score = Math.min(100, score + 0.5);
    }
    this.roomHealthScores.set(roomId, score);
  }

  getRoomHealth(roomId: string): number {
    return this.roomHealthScores.get(roomId) ?? 100;
  }

  cleanupRoom(roomId: string) {
    this.roomHealthScores.delete(roomId);
  }

  getStats() {
    let totalScore = 0;
    const scores = Array.from(this.roomHealthScores.values());
    if (scores.length > 0) {
      totalScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    } else {
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

export const driftMonitor = new DriftMonitor();
