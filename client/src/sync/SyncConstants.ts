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

/**
 * Named export used by PlaybackCorrector for drift threshold and rate bounds.
 */
export const SyncConstants = {
  DRIFT_THRESHOLD_MINOR: DRIFT_THRESHOLDS.MINOR,
  DRIFT_THRESHOLD_MODERATE: DRIFT_THRESHOLDS.MODERATE,
  DRIFT_THRESHOLD_MAJOR: DRIFT_THRESHOLDS.MAJOR,
  DRIFT_THRESHOLD_CRITICAL: DRIFT_THRESHOLDS.CRITICAL,
  RATE_MIN: 0.5,
  RATE_MAX: 2.0,
};

