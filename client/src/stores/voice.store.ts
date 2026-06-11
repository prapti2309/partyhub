import { create } from "zustand";

interface VoicePeer {
  userId: string;
  username: string;
  avatarUrl?: string;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  speaking: boolean;
}

interface VoiceStoreState {
  isInVoiceChannel: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  voicePeers: VoicePeer[];

  joinVoice: () => void;
  leaveVoice: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  setSpeaking: (userId: string, speaking: boolean) => void;
  updatePeerVoiceState: (userId: string, updates: Partial<VoicePeer>) => void;
}

export const useVoiceStore = create<VoiceStoreState>((set) => ({
  isInVoiceChannel: false,
  isMuted: false,
  isDeafened: false,
  isCameraOn: false,
  isScreenSharing: false,
  voicePeers: [],

  joinVoice: () => {
    // Generate some mock voice peers when we join for demonstration
    const mockPeers: VoicePeer[] = [
      {
        userId: "user-2",
        username: "retro_coder",
        avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=retro",
        isMuted: false,
        isCameraOn: false,
        isScreenSharing: false,
        speaking: false,
      },
      {
        userId: "friend-3",
        username: "pixel_princess",
        avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel",
        isMuted: true,
        isCameraOn: false,
        isScreenSharing: false,
        speaking: false,
      },
    ];
    set({ isInVoiceChannel: true, voicePeers: mockPeers });
  },

  leaveVoice: () => {
    set({ isInVoiceChannel: false, voicePeers: [], isCameraOn: false, isScreenSharing: false });
  },

  toggleMute: () => {
    set((state) => {
      const nextMuted = !state.isMuted;
      // If muting, we don't necessarily deafen, but if we unmute we might want to check
      return { isMuted: nextMuted };
    });
  },

  toggleDeafen: () => {
    set((state) => {
      const nextDeafened = !state.isDeafened;
      // Standard Discord rule: Deafen implies Muted
      return {
        isDeafened: nextDeafened,
        isMuted: nextDeafened ? true : state.isMuted,
      };
    });
  },

  toggleCamera: () => {
    set((state) => {
      if (!state.isInVoiceChannel) return state;
      return { isCameraOn: !state.isCameraOn };
    });
  },

  toggleScreenShare: () => {
    set((state) => {
      if (!state.isInVoiceChannel) return state;
      return { isScreenSharing: !state.isScreenSharing };
    });
  },

  setSpeaking: (userId: string, speaking: boolean) => {
    set((state) => ({
      voicePeers: state.voicePeers.map((p) => (p.userId === userId ? { ...p, speaking } : p)),
    }));
  },

  updatePeerVoiceState: (userId: string, updates: Partial<VoicePeer>) => {
    set((state) => ({
      voicePeers: state.voicePeers.map((p) => (p.userId === userId ? { ...p, ...updates } : p)),
    }));
  },
}));
