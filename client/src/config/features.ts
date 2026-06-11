/**
 * WatchParty Feature Flags
 * Toggles simulation layers vs live distributed networks
 */
export const FEATURES = {
  USE_REAL_SOCKETS: false, // Set to true to bypass simulated loops and use live WSS connections
  USE_REAL_WEBRTC: false, // Set to true to utilize native browser STUN/TURN peer discovery
  ENABLE_ANALYTICS: false, // Toggle event metrics trackers
};
