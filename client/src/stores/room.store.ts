import { create } from "zustand";
import { Room, RoomSettings, RoomMember } from "../types";

interface RoomStoreState {
  activeRoom: Room | null;
  roomsList: Room[];
  isLoading: boolean;
  setRoomData: (room: Room) => void;
  clearRoom: () => void;
  updateSettings: (settings: Partial<RoomSettings>) => void;
  addParticipant: (participant: Partial<RoomMember>) => void;
  removeParticipant: (userId: string) => void;
  updateParticipantStatus: (userId: string, isOnline: boolean) => void;
  updateRoomOwner: (ownerId: string) => void;
  createRoom: (title: string, settings: any, capacity: number, ownerName: string) => Promise<any>;
  joinRoom: (roomId: string, username?: string) => Promise<any>;
  leaveRoom: () => void;
  kickMember: (userId: string) => void;
}

export const useRoomStore = create<RoomStoreState>((set) => ({
  activeRoom: null,
  roomsList: [],
  isLoading: false,

  setRoomData: (room: Room) => set({ activeRoom: room }),
  
  clearRoom: () => set({ activeRoom: null }),

  createRoom: async (title, settings, capacity, ownerName) => {
    // Mock implementation to satisfy type checker and dashboard logic
    return { code: "123456" };
  },

  updateSettings: (settingsUpdates: Partial<RoomSettings>) => {
    set((state) => {
      if (!state.activeRoom) return state;
      const updated = {
        ...state.activeRoom,
        settings: { ...state.activeRoom.settings, ...settingsUpdates },
      };
      return { activeRoom: updated };
    });
  },

  addParticipant: (participant: Partial<RoomMember>) => {
    set((state) => {
      if (!state.activeRoom) return state;
      const existingIndex = state.activeRoom.members.findIndex(m => m.userId === participant.userId);
      let updatedMembers = [...state.activeRoom.members];
      
      if (existingIndex >= 0) {
        updatedMembers[existingIndex] = { ...updatedMembers[existingIndex], ...participant };
      } else {
        updatedMembers.push(participant as RoomMember);
      }
      
      return { activeRoom: { ...state.activeRoom, members: updatedMembers } };
    });
  },

  removeParticipant: (userId: string) => {
    set((state) => {
      if (!state.activeRoom) return state;
      const updatedMembers = state.activeRoom.members.filter(m => m.userId !== userId);
      return { activeRoom: { ...state.activeRoom, members: updatedMembers } };
    });
  },

  updateParticipantStatus: (userId: string, isOnline: boolean) => {
    set((state) => {
      if (!state.activeRoom) return state;
      const updatedMembers = state.activeRoom.members.map(m => 
        m.userId === userId ? { ...m, isOnline } : m
      );
      return { activeRoom: { ...state.activeRoom, members: updatedMembers } };
    });
  },

  updateRoomOwner: (ownerId: string) => {
    set((state) => {
      if (!state.activeRoom) return state;
      const updatedMembers = state.activeRoom.members.map(m => ({
        ...m,
        role: m.userId === ownerId ? "OWNER" : (m.role === "OWNER" ? "VIEWER" : m.role) as any
      }));
      return { activeRoom: { ...state.activeRoom, ownerId, members: updatedMembers } };
    });
  },

  // These are handled by useRoomSocket hook; these are no-ops in the store
  joinRoom: async (_roomId: string, _username?: string) => {
    return { room: null };
  },
  leaveRoom: () => {},
  kickMember: (_userId: string) => {},
}));
