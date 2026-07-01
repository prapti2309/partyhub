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

  syncState: (position: number, isPlaying: boolean, speed: number) => {
    set((state) => {
      // Only trigger a state change if there's a significant drift
      const drift = Math.abs(state.position - position);
      const updates: Partial<PlayerStoreState> = {};

      if (drift > state.driftThreshold) {
        updates.position = position;
      }

      if (state.isPlaying !== isPlaying) {
        updates.isPlaying = isPlaying;
      }

      if (state.speed !== speed) {
        updates.speed = speed;
      }

      if (Object.keys(updates).length > 0) {
        return updates;
      }

      return state;
    });
  },
}));
