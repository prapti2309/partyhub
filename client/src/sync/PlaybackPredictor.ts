// client/src/sync/PlaybackPredictor.ts
import { PlaybackState } from "@/types/playback";
import { PlaybackClock } from "./PlaybackClock";

/**
 * Predicts the current playback position based on the last known
 * server‑authoritative playback state and the logical clock.
 */
export class PlaybackPredictor {
  private clock: PlaybackClock;

  constructor(clock: PlaybackClock) {
    this.clock = clock;
  }

  /**
   * Returns an object containing the predicted position (ms) and the
   * playbackRate at the current moment.
   */
  predict(state: PlaybackState) {
    const serverNow = this.clock.now();
    const deltaMs = serverNow - state.serverTimestamp; // ms elapsed since server snapshot
    const predictedPos = state.position + deltaMs * state.playbackRate;
    return { position: predictedPos, playbackRate: state.playbackRate };
  }
}
