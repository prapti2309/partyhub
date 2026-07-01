// src/voice/PeerManager.ts
/**
 * Manages RTCPeerConnection instances for each remote participant.
 * All peers share the same configuration (STUN/TURN servers).
 */
export class PeerManager {
  private peers: Map<string, RTCPeerConnection> = new Map();
  private config: RTCConfiguration;

  constructor() {
    // Default STUN server – can be overridden via env vars if needed.
    this.config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    };
  }

  /** Create a new peer for the given remote socket ID. */
  createPeer(remoteId: string): RTCPeerConnection {
    if (this.peers.has(remoteId)) {
      return this.peers.get(remoteId)!;
    }
    const pc = new RTCPeerConnection(this.config);
    this.peers.set(remoteId, pc);
    return pc;
  }

  getPeer(remoteId: string): RTCPeerConnection | undefined {
    return this.peers.get(remoteId);
  }

  /** Remove and close a peer connection. */
  removePeer(remoteId: string) {
    const pc = this.peers.get(remoteId);
    if (pc) {
      pc.close();
      this.peers.delete(remoteId);
    }
  }

  /** Close all peers (called on leave). */
  closeAll() {
    this.peers.forEach((pc) => pc.close());
    this.peers.clear();
  }
}
