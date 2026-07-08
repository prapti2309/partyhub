// src/voice/WebRTCManager.ts
import { MediaManager } from "./MediaManager";
import { PeerManager } from "./PeerManager";
import { SignalingClient } from "./SignalingClient";
import { logger } from "@/utils/logger";

/**
 * Orchestrates the full WebRTC voice flow.
 * - Acquires microphone stream via MediaManager.
 * - Creates peer connections via PeerManager.
 * - Exchanges SDP/ICE through SignalingClient.
 */
export class WebRTCManager {
  private mediaManager = MediaManager.getInstance();
  private peerManager = new PeerManager();
  private signaling = new SignalingClient();
  private localStream: MediaStream | null = null;
  private videoSenders: Map<string, RTCRtpSender> = new Map();
  private audioSenders: Map<string, RTCRtpSender> = new Map();

  /** Join a voice room */
  async join(roomId: string) {
    // 1️⃣ Acquire local audio stream
    this.localStream = await this.mediaManager.acquire();
    // 2️⃣ Notify server we are joining
    await this.signaling.join({ roomId });
    // 3️⃣ Listen for remote peers
    this.setupRemoteListeners(roomId);
  }

  /** Leave the voice room */
  async leave(roomId: string) {
    // Notify server
    await this.signaling.leave({ roomId });
    // Cleanup peers and media
    this.peerManager.closeAll();
    this.mediaManager.release();
    this.localStream = null;
  }

  /** Set mute state */
  async setMute(roomId: string, muted: boolean) {
    if (!this.localStream) return;
    this.localStream.getAudioTracks().forEach((t) => (t.enabled = !muted));
    await this.signaling.mute({ roomId, muted });
  }

  /** Replace audio track for all peers (e.g., when switching mic) */
  async replaceAudioTrack(newTrack: MediaStreamTrack | null) {
    for (const [peerId, sender] of this.audioSenders.entries()) {
      if (sender && newTrack) {
        await sender.replaceTrack(newTrack);
      }
    }
  }

  /** Replace video track for all peers (e.g., when turning on camera, or screen sharing) */
  async replaceVideoTrack(newTrack: MediaStreamTrack | null) {
    for (const [peerId, sender] of this.videoSenders.entries()) {
      if (sender) {
        await sender.replaceTrack(newTrack);
      }
    }
  }

  /** Attach local stream to a given HTMLAudioElement (used by UI) */
  attachLocalAudio(element: HTMLAudioElement) {
    if (this.localStream) {
      element.srcObject = this.localStream;
      element.autoplay = true;
    }
  }

  /** Internal: handle incoming remote peer events */
  private setupRemoteListeners(roomId: string) {
    // When a new peer connects, create a PeerConnection and add local tracks
    this.signaling.onPeerConnected(async ({ socketId }) => {
      const pc = this.peerManager.createPeer(socketId);
      // Add transceivers explicitly to support track replacement
      if (this.localStream) {
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
          const sender = pc.addTrack(audioTrack, this.localStream);
          this.audioSenders.set(socketId, sender);
        }
      } else {
         pc.addTransceiver('audio', { direction: 'sendrecv' });
      }
      
      const videoTransceiver = pc.addTransceiver('video', { direction: 'sendrecv' });
      this.videoSenders.set(socketId, videoTransceiver.sender);
      // Listen for remote tracks and forward to UI via custom events
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        const audioEvent = new CustomEvent('voice-remote-stream', {
          detail: { socketId, stream: remoteStream },
        });
        window.dispatchEvent(audioEvent);
      };

      // ICE candidate handling
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          this.signaling.sendIceCandidate({ roomId, candidate: JSON.stringify(e.candidate) });
        }
      };

      // Create and send an offer to the remote peer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await this.signaling.sendOffer({ roomId, sdp: offer.sdp! });
    });

    // Handle incoming offer
    this.signaling.onOffer(async ({ from, sdp }) => {
      const pc = this.peerManager.createPeer(from);
      await pc.setRemoteDescription({ type: "offer", sdp });
      // Setup transceivers
      if (this.localStream) {
         const audioTrack = this.localStream.getAudioTracks()[0];
         if (audioTrack) {
             const sender = pc.addTrack(audioTrack, this.localStream);
             this.audioSenders.set(from, sender);
         }
      } else {
         pc.addTransceiver('audio', { direction: 'sendrecv' });
      }
      
      const videoTransceiver = pc.addTransceiver('video', { direction: 'sendrecv' });
      this.videoSenders.set(from, videoTransceiver.sender);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await this.signaling.sendAnswer({ roomId, sdp: answer.sdp! });
    });

    // Handle incoming answer
    this.signaling.onAnswer(async ({ from, sdp }) => {
      const pc = this.peerManager.getPeer(from);
      if (pc) {
        await pc.setRemoteDescription({ type: "answer", sdp });
      }
    });

    // Handle incoming ICE candidate
    this.signaling.onIceCandidate(async ({ from, candidate }) => {
      const pc = this.peerManager.getPeer(from);
      if (pc) {
        await pc.addIceCandidate(JSON.parse(candidate));
      }
    });

    // Remote peer disconnected – clean up
    this.signaling.onPeerDisconnected(({ socketId }) => {
      this.peerManager.removePeer(socketId);
      this.videoSenders.delete(socketId);
      this.audioSenders.delete(socketId);
    });
  }
}
