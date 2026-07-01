// Sync configuration constants
export const DRIFT_THRESHOLDS = {
  MINOR: 0.1, // seconds, ignore
  MODERATE: 0.5, // seconds, soft correction
  MAJOR: 2.0, // seconds, hard seek
  CRITICAL: 5.0, // seconds, full resync
};

export const SYNC_INTERVAL_BOUNDS = {
  MIN: 250, // ms
  MAX: 1000, // ms
};
