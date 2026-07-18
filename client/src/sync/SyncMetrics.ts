// client/src/sync/SyncMetrics.ts

/**
 * Collects and exposes drift correction metrics for observability.
 * Tracks drift samples, correction counts, and rates.
 */
export class SyncMetrics {
  private driftSamples: number[] = [];
  private softCorrections = 0;
  private hardCorrections = 0;
  private criticalCorrections = 0;
  private maxSamples = 100;

  /** Record a drift measurement (in seconds) */
  recordDrift(driftSec: number) {
    this.driftSamples.push(driftSec);
    if (this.driftSamples.length > this.maxSamples) {
      this.driftSamples.shift();
    }
  }

  /** Record a soft correction event */
  recordSoftCorrection() {
    this.softCorrections++;
  }

  /** Record a hard correction event */
  recordHardCorrection() {
    this.hardCorrections++;
  }

  /** Record a critical correction event */
  recordCriticalCorrection() {
    this.criticalCorrections++;
  }

  /** Get the average drift across recent samples */
  get averageDrift(): number {
    if (this.driftSamples.length === 0) return 0;
    const sum = this.driftSamples.reduce((a, b) => a + b, 0);
    return sum / this.driftSamples.length;
  }

  /** Get correction counters */
  get stats() {
    return {
      averageDrift: this.averageDrift,
      totalSamples: this.driftSamples.length,
      softCorrections: this.softCorrections,
      hardCorrections: this.hardCorrections,
      criticalCorrections: this.criticalCorrections,
    };
  }

  /** Reset all metrics */
  reset() {
    this.driftSamples = [];
    this.softCorrections = 0;
    this.hardCorrections = 0;
    this.criticalCorrections = 0;
  }
}
