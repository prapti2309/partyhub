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
  changeVideo: (videoUrl: string, videoTitle: string) => void;
  // Updated helpers for drift correction
  applySoftRate: (rate: number) => void;
  seekTo: (position: number) => void;
  setLocalState: (state: any) => void;
  // syncState now stores full server snapshot
  syncState: (state: any) => void;
  setSpeed: (speed: number) => void;
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

  // Store the canonical snapshot; drift handling delegated to sync scheduler
  syncState: (state: any) => {
    set({
      videoUrl: state.videoUrl ?? "",
      videoTitle: state.videoTitle ?? "",
      position: state.position,
      isPlaying: state.playing,
      speed: state.playbackRate,
      isBuffering: false,
    });
  },
  // Helper to gently adjust playback rate (soft correction)
  applySoftRate: (rate) => set({ speed: rate }),
  // Helper to perform a hard seek (hard correction)
  seekTo: (pos) => set({ position: pos, isPlaying: true }),
  // Directly replace local state with server data (used on full sync)
  setLocalState: (state) => {
    set({
      position: state.position,
      isPlaying: state.playing,
      speed: state.playbackRate,
    });
  },
  setSpeed: (speed: number) => set({ speed }),
}));
