// src/voice/SignalingClient.ts
import { socketManager } from "@/lib/socket/SocketManager";
import { SOCKET_EVENTS } from "./socket.constants";

/**
 * Thin wrapper around the global SocketManager that provides typed methods
 * for voice signaling and registers listeners for incoming events.
 */
export class SignalingClient {
  /** Join a voice room */
  async join(payload: { roomId: string; deviceLabel?: string }) {
    const socket = await socketManager.connect();
    return socket.emit(SOCKET_EVENTS.VOICE_JOIN, payload);
  }

  /** Leave a voice room */
  async leave(payload: { roomId: string }) {
    const socket = await socketManager.connect();
    return socket.emit("voice:leave", payload);
  }

  /** Send SDP offer */
  async sendOffer(payload: { roomId: string; sdp: string }) {
    const socket = await socketManager.connect();
    return socket.emit(SOCKET_EVENTS.VOICE_OFFER, payload);
  }

  /** Send SDP answer */
  async sendAnswer(payload: { roomId: string; sdp: string }) {
    const socket = await socketManager.connect();
    return socket.emit(SOCKET_EVENTS.VOICE_ANSWER, payload);
  }

  /** Send ICE candidate */
  async sendIceCandidate(payload: { roomId: string; candidate: string }) {
    const socket = await socketManager.connect();
    return socket.emit(SOCKET_EVENTS.VOICE_ICE_CANDIDATE, payload);
  }

  /** Mute / unmute */
  async mute(payload: { roomId: string; muted: boolean }) {
    const socket = await socketManager.connect();
    return socket.emit(SOCKET_EVENTS.VOICE_MUTE, payload);
  }

  /** Register event listeners – these are used by WebRTCManager */
  onPeerConnected(cb: (data: { socketId: string; roomId: string }) => void) {
    socketManager.getSocket()?.on("voice:peer-connected", cb);
  }
  onPeerDisconnected(cb: (data: { socketId: string; roomId: string }) => void) {
    socketManager.getSocket()?.on("voice:peer-disconnected", cb);
  }
  onOffer(cb: (data: { from: string; roomId: string; sdp: string }) => void) {
    socketManager.getSocket()?.on("voice:offer", cb);
  }
  onAnswer(cb: (data: { from: string; roomId: string; sdp: string }) => void) {
    socketManager.getSocket()?.on("voice:answer", cb);
  }
  onIceCandidate(cb: (data: { from: string; roomId: string; candidate: string }) => void) {
    socketManager.getSocket()?.on("voice:ice-candidate", cb);
  }

  // --- Media Events ---
  async setCamera(payload: { roomId: string; enabled: boolean }) {
    const socket = await socketManager.connect();
    return socket.emit(payload.enabled ? SOCKET_EVENTS.MEDIA_CAMERA_ON : SOCKET_EVENTS.MEDIA_CAMERA_OFF, payload);
  }

  async setScreenSharing(payload: { roomId: string; enabled: boolean }) {
    const socket = await socketManager.connect();
    return socket.emit(payload.enabled ? SOCKET_EVENTS.MEDIA_SCREEN_START : SOCKET_EVENTS.MEDIA_SCREEN_STOP, payload);
  }

  async updateDevice(payload: { roomId: string; hasAudio: boolean; hasVideo: boolean }) {
    const socket = await socketManager.connect();
    return socket.emit(SOCKET_EVENTS.MEDIA_DEVICE_UPDATE, payload);
  }

  async setSpeaking(payload: { roomId: string; isSpeaking: boolean }) {
    const socket = await socketManager.connect();
    return socket.emit(SOCKET_EVENTS.MEDIA_SPEAKING, payload);
  }

  onMediaStateUpdate(cb: (data: any) => void) {
    socketManager.getSocket()?.on(SOCKET_EVENTS.MEDIA_STATE_UPDATE, cb);
  }
}
