// src/stores/presence.store.ts
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export type PresenceStatus = 'online' | 'offline' | 'away' | 'idle' | 'busy' | 'invisible';

export interface ParticipantInfo {
  userId: string;
  username?: string;
  avatar?: string;
  status: PresenceStatus;
  device?: string;
  lastSeen: number; // timestamp
}

export interface PresenceState {
  participants: Record<string, ParticipantInfo>;
  typingUsers: Set<string>;
  updateParticipant: (info: ParticipantInfo) => void;
  removeParticipant: (userId: string) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
}

export const usePresenceStore = create<PresenceState>()(
  devtools((set, get) => ({
    participants: {},
    typingUsers: new Set(),
    updateParticipant: (info) =>
      set((state) => ({
        participants: { ...state.participants, [info.userId]: { ...info, lastSeen: Date.now() } },
      })),
    removeParticipant: (userId) =>
      set((state) => {
        const { [userId]: _, ...rest } = state.participants;
        return { participants: rest };
      }),
    setTyping: (userId, isTyping) =>
      set((state) => {
        const newSet = new Set(state.typingUsers);
        if (isTyping) newSet.add(userId);
        else newSet.delete(userId);
        return { typingUsers: newSet };
      }),
  }))
);
