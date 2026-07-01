// client/src/sync/PlaybackCorrector.ts
import { PlaybackState } from "@/types/playback";
import { PlaybackPredictor } from "./PlaybackPredictor";
import { SyncMetrics } from "./SyncMetrics";
import { SyncConstants } from "./SyncConstants";

/**
 * Handles correction of playback drift.
 * - Soft correction: temporarily adjust playbackRate within safe bounds.
 * - Hard correction: seek to the expected position.
 * - Critical correction: request full sync from server.
 */
export class PlaybackCorrector {
  private predictor: PlaybackPredictor;
  private metrics: SyncMetrics;

  constructor(predictor: PlaybackPredictor, metrics: SyncMetrics) {
    this.predictor = predictor;
    this.metrics = metrics;
  }

  /**
   * Apply correction based on the current drift.
   * Returns a command object that the UI layer can act upon.
   */
  correct(state: PlaybackState) {
    const { position: predictedPos, playbackRate } = this.predictor.predict(state);
    const driftMs = Math.abs(state.position - predictedPos);
    const driftSec = driftMs / 1000;

    // Record metric
    this.metrics.recordDrift(driftSec);

    if (driftSec <= SyncConstants.DRIFT_THRESHOLD_MINOR) {
      return { type: "none" as const };
    }

    if (driftSec <= SyncConstants.DRIFT_THRESHOLD_MODERATE) {
      // Soft correction: adjust playbackRate slightly to converge
      const rateAdjustment = driftSec > 0 ? 0.02 : -0.02; // accelerate or decelerate
      const newRate = Math.min(
        Math.max(playbackRate + rateAdjustment, SyncConstants.RATE_MIN),
        SyncConstants.RATE_MAX
      );
      this.metrics.recordSoftCorrection();
      return { type: "soft" as const, newRate };
    }

    if (driftSec <= SyncConstants.DRIFT_THRESHOLD_MAJOR) {
      // Hard correction: seek to predicted position
      this.metrics.recordHardCorrection();
      return { type: "hard" as const, seekTo: predictedPos };
    }

    // Critical: ask server for fresh sync snapshot
    this.metrics.recordCriticalCorrection();
    return { type: "critical" as const };
  }
}
