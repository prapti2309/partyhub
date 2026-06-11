"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useVoiceStore } from "../stores/voice.store";
import { useRoomStore } from "../stores/room.store";

interface WebRTCContextType {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isConnecting: boolean;
  activePeersCount: number;
  joinVoiceChannel: () => Promise<void>;
  leaveVoiceChannel: () => void;
  startLocalVideo: () => Promise<void>;
  stopLocalVideo: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const voiceStore = useVoiceStore();
  const roomStore = useRoomStore();

  // Handle local state updates from voice store
  const isCameraOn = voiceStore.isCameraOn;
  const isScreenSharing = voiceStore.isScreenSharing;
  const isInVoiceChannel = voiceStore.isInVoiceChannel;

  const cleanupStreams = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
  };

  // Cleanup on unmount or channel leave
  useEffect(() => {
    if (!isInVoiceChannel) {
      cleanupStreams();
    }
  }, [isInVoiceChannel]);

  const joinVoiceChannel = async () => {
    setIsConnecting(true);
    console.log("🔊 [WebRTC] Initiating peer connection for voice channel...");

    // Simulate signaling server connection delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    voiceStore.joinVoice();
    setIsConnecting(false);
    console.log("🔊 [WebRTC] WebRTC Peer Connection Established");
  };

  const leaveVoiceChannel = () => {
    console.log("🔊 [WebRTC] Disconnecting WebRTC channel...");
    voiceStore.leaveVoice();
    cleanupStreams();
  };

  const startLocalVideo = async () => {
    try {
      console.log("📷 [WebRTC] Requesting local camera access...");
      // Simulate getting media stream or actually create a mock/canvas stream
      // We can create a dummy media stream in browsers if supported, or just keep state
      if (
        typeof window !== "undefined" &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
      ) {
        // Try getting user media, but fallback to mock stream if no camera exists
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setLocalStream(stream);
        } catch {
          // Mock stream
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#1a1a2e";
            ctx.fillRect(0, 0, 640, 480);
          }
          const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
          setLocalStream(stream);
        }
      }
      voiceStore.updatePeerVoiceState("user-current", { isCameraOn: true });
      console.log("📷 [WebRTC] Camera stream attached");
    } catch (e) {
      console.error("Failed to start local camera stream", e);
    }
  };

  const stopLocalVideo = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    voiceStore.updatePeerVoiceState("user-current", { isCameraOn: false });
    console.log("📷 [WebRTC] Local camera stream stopped");
  };

  const startScreenShare = async () => {
    try {
      console.log("🖥️ [WebRTC] Requesting screen share stream...");
      if (
        typeof window !== "undefined" &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getDisplayMedia
      ) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setScreenStream(stream);
          stream.getVideoTracks()[0].onended = () => {
            stopScreenShare();
            voiceStore.toggleScreenShare();
          };
        } catch {
          // Mock screen share
          setScreenStream(new MediaStream());
        }
      }
      voiceStore.updatePeerVoiceState("user-current", { isScreenSharing: true });
      console.log("🖥️ [WebRTC] Screen share stream active");
    } catch (e) {
      console.error("Failed to start screen share stream", e);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    voiceStore.updatePeerVoiceState("user-current", { isScreenSharing: false });
    console.log("🖥️ [WebRTC] Screen share stream stopped");
  };

  // Setup periodic speaking simulations for mock peers
  useEffect(() => {
    if (!isInVoiceChannel) return;

    const interval = setInterval(() => {
      const peers = voiceStore.voicePeers;
      if (peers.length === 0) return;

      // Randomly pick a peer and toggle speaking
      const randomPeerIndex = Math.floor(Math.random() * peers.length);
      const peer = peers[randomPeerIndex];
      if (!peer.isMuted) {
        voiceStore.setSpeaking(peer.userId, !peer.speaking);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isInVoiceChannel, voiceStore.voicePeers]);

  return (
    <WebRTCContext.Provider
      value={{
        localStream,
        screenStream,
        isConnecting,
        activePeersCount: voiceStore.voicePeers.length,
        joinVoiceChannel,
        leaveVoiceChannel,
        startLocalVideo,
        stopLocalVideo,
        startScreenShare,
        stopScreenShare,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error("useWebRTC must be used within a WebRTCProvider");
  }
  return context;
};
