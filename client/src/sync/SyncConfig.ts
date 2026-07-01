// client/src/sync/SyncConfig.ts
export const SyncConfig = {
  // drift thresholds in seconds
  thresholds: {
    MINOR: 0.1, // ignore
    MODERATE: 0.5, // soft correction (rate adjustment)
    MAJOR: 2.0, // hard seek
    CRITICAL: 5.0, // full resync (fallback)
  },
  // adaptive sync interval bounds in milliseconds
  intervalBounds: {
    MIN: 250,
    MAX: 1000,
  },
};
