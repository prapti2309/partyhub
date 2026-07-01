import { create } from "zustand";

interface PlayerStoreState {
  videoUrl: string;
  videoTitle: string;
  position: number;
  isPlaying: boolean;
  speed: number;
  isBuffering: boolean;
  driftThreshold: number; // in seconds
  setBuffering: (isBuffering: boolean) => void;
  changeVideo: (url: string, title: string) => void;
  syncState: (position: number, isPlaying: boolean, speed: number) => void;
}

export const usePlayerStore = create<PlayerStoreState>((set) => ({
  videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
  videoTitle: "Neon Nights Trailer",
  position: 0,
  isPlaying: false,
  speed: 1.0,
  isBuffering: false,
  driftThreshold: 2.0, // default 2 seconds

  setBuffering: (isBuffering: boolean) => {
    set({ isBuffering });
  },

  changeVideo: (videoUrl: string, videoTitle: string) => {
    set({ videoUrl, videoTitle, position: 0, isPlaying: false });
  },

  syncState: (state: any) => {
    set((s) => {
      // Compute drift based on server timestamp and playbackRate
      const now = Date.now();
      const timeDiff = (now - state.serverTimestamp) / 1000; // seconds
      const expectedPos = state.playing ? state.position + timeDiff * state.playbackRate : state.position;
      const drift = Math.abs(s.position - expectedPos);
      const updates: Partial<PlayerStoreState> = {};

      if (drift > s.driftThreshold) {
        updates.position = expectedPos;
        updates.isPlaying = state.playing;
        updates.speed = state.playbackRate;
      }

      return Object.keys(updates).length ? updates : s;
    });
  },
}));
