// client/src/sync/PlaybackClock.ts
import { LatencyEstimator } from "./LatencyEstimator";

/**
 * Maintains a logical clock that approximates the server time.
 * It uses the latest server timestamp from playback broadcasts and
 * adjusts with the estimated one‑way latency.
 */
export class PlaybackClock {
  private offset: number = 0; // serverTime - clientNow (ms)
  private latencyEstimator: LatencyEstimator;

  constructor(latencyEstimator: LatencyEstimator) {
    this.latencyEstimator = latencyEstimator;
  }

  /**
   * Sync the clock with a new playback state received from the server.
   * `state.serverTimestamp` is the server time (ms) at which the state
   * snapshot was generated.
   */
  sync(serverTimestamp: number) {
    const now = Date.now();
    // Estimated one‑way latency
    const latency = this.latencyEstimator.latency;
    // Offset = serverTime - (now + latency)
    this.offset = serverTimestamp - now - latency;
  }

  /**
   * Returns the current estimated server time in ms.
   */
  now(): number {
    return Date.now() + this.offset;
  }
}
