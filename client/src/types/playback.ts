// src/types/playback.ts

/**
 * Authoritative playback state from the server.
 * This is the canonical snapshot used by the drift correction engine.
 */
export interface PlaybackState {
  /** Current playback position in milliseconds */
  position: number;
  /** Whether the video is currently playing */
  playing: boolean;
  /** Playback rate (1.0 = normal speed) */
  playbackRate: number;
  /** Server timestamp (ms) when this snapshot was generated */
  serverTimestamp: number;
  /** Video URL being played */
  videoUrl?: string;
  /** Video title */
  videoTitle?: string;
}
