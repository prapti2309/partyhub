// src/stores/voice.store.ts
import { create } from "zustand";

export interface VoiceParticipant {
  socketId: string;
  stream: MediaStream;
  userId: string;
  username: string;
  avatarUrl?: string;
  isCameraOn: boolean;
  isMuted: boolean;
  speaking: boolean;
}

interface VoiceStoreState {
  // Core flags
  isInVoiceChannel: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;

  // Participants (including self)
  participants: VoiceParticipant[];
  voicePeers: VoiceParticipant[]; // duplicate for UI convenience

  // Actions
  joinVoice: (roomId: string) => Promise<void>;
  leaveVoice: (roomId: string) => Promise<void>;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  addParticipant: (p: VoiceParticipant) => void;
  removeParticipant: (socketId: string) => void;
  clear: () => void;

  // Peer management helpers
  updatePeerVoiceState: (userId: string, updates: Partial<VoiceParticipant>) => void;
  setSpeaking: (userId: string, speaking: boolean) => void;
}

export const useVoiceStore = create<VoiceStoreState>((set, get) => ({
  // Core flags
  isInVoiceChannel: false,
  isMuted: false,
  isDeafened: false,
  isCameraOn: false,
  isScreenSharing: false,

  // Participants
  participants: [],
  voicePeers: [],

  // Join a voice channel – delegates to WebRTCManager
  joinVoice: async (roomId: string) => {
    const { WebRTCManager } = await import("../voice/WebRTCManager");
    const manager = new WebRTCManager();
    await manager.join(roomId);
    set({ isInVoiceChannel: true });
  },

  // Leave a voice channel
  leaveVoice: async (roomId: string) => {
    const { WebRTCManager } = await import("../voice/WebRTCManager");
    const manager = new WebRTCManager();
    await manager.leave(roomId);
    set({ isInVoiceChannel: false, participants: [], voicePeers: [] });
  },

  setMuted: (muted: boolean) => {
    set({ isMuted: muted });
    // TODO: propagate mute state to server via signaling
  },
  toggleMute: () => {
    const current = get().isMuted;
    set({ isMuted: !current });
    // TODO: send mute change to server
  },
  toggleDeafen: () => {
    const { isDeafened, isMuted } = get();
    set({ isDeafened: !isDeafened, isMuted: !isDeafened ? true : isMuted });
  },
  toggleCamera: () => {
    const { isCameraOn } = get();
    set({ isCameraOn: !isCameraOn });
    // TODO: start/stop local video via WebRTCManager
  },
  toggleScreenShare: () => {
    const { isScreenSharing } = get();
    set({ isScreenSharing: !isScreenSharing });
    // TODO: start/stop screen share via WebRTCManager
  },

  addParticipant: (p: VoiceParticipant) =>
    set((s) => {
      const newList = [...s.participants, p];
      return { participants: newList, voicePeers: newList };
    }),
  removeParticipant: (socketId: string) =>
    set((s) => {
      const newList = s.participants.filter((p) => p.socketId !== socketId);
      return { participants: newList, voicePeers: newList };
    }),

  // Peer management helpers
  updatePeerVoiceState: (userId: string, updates: Partial<VoiceParticipant>) =>
    set((s) => {
      const newList = s.participants.map((p) =>
        p.userId === userId ? { ...p, ...updates } : p
      );
      return { participants: newList, voicePeers: newList };
    }),
  setSpeaking: (userId: string, speaking: boolean) =>
    set((s) => {
      const newList = s.participants.map((p) =>
        p.userId === userId ? { ...p, speaking } : p
      );
      return { participants: newList, voicePeers: newList };
    }),

  clear: () =>
    set({
      isInVoiceChannel: false,
      isMuted: false,
      isDeafened: false,
      isCameraOn: false,
      isScreenSharing: false,
      participants: [],
      voicePeers: [],
    }),
}));
