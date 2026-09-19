import { create } from "zustand";
import { Room, RoomSettings, RoomMember } from "../types";
import { roomService } from "../services/room.service";

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
  createRoom: (
    title: string,
    settings?: Partial<RoomSettings>,
    capacity?: number,
    ownerName?: string,
    isPrivate?: boolean,
    password?: string
  ) => Promise<Room>;
  joinRoom: (code: string, username?: string) => Promise<{ room: Room }>;
  leaveRoom: () => void;
  kickMember: (userId: string) => void;
}

export const useRoomStore = create<RoomStoreState>((set) => ({
  activeRoom: null,
  roomsList: [],
  isLoading: false,

  setRoomData: (room: Room) => set({ activeRoom: room }),

  clearRoom: () => set({ activeRoom: null }),

  createRoom: async (title, settings, capacity, ownerName, isPrivate, password) => {
    set({ isLoading: true });
    try {
      const room = await roomService.createRoom(title, isPrivate, password);
      if (settings && Object.keys(settings).length > 0) {
        await roomService.updateRoomSettings(room.id, settings).catch(() => {});
      }
      set({ activeRoom: room, isLoading: false });
      return room;
    } finally {
      set({ isLoading: false });
    }
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
      const existingIndex = state.activeRoom.members.findIndex(
        (m) => m.userId === participant.userId
      );
      const updatedMembers = [...state.activeRoom.members];

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
      const updatedMembers = state.activeRoom.members.filter((m) => m.userId !== userId);
      return { activeRoom: { ...state.activeRoom, members: updatedMembers } };
    });
  },

  updateParticipantStatus: (userId: string, isOnline: boolean) => {
    set((state) => {
      if (!state.activeRoom) return state;
      const updatedMembers = state.activeRoom.members.map((m) =>
        m.userId === userId ? { ...m, isOnline } : m
      );
      return { activeRoom: { ...state.activeRoom, members: updatedMembers } };
    });
  },

  updateRoomOwner: (ownerId: string) => {
    set((state) => {
      if (!state.activeRoom) return state;
      const updatedMembers = state.activeRoom.members.map((m) => ({
        ...m,
        role: m.userId === ownerId ? "OWNER" : ((m.role === "OWNER" ? "VIEWER" : m.role) as any),
      }));
      return { activeRoom: { ...state.activeRoom, ownerId, members: updatedMembers } };
    });
  },

  joinRoom: async (code: string, _username?: string) => {
    set({ isLoading: true });
    try {
      const room = await roomService.getRoomByCode(code);
      set({ activeRoom: room, isLoading: false });
      return { room };
    } finally {
      set({ isLoading: false });
    }
  },
  leaveRoom: () => set({ activeRoom: null }),
  kickMember: (_userId: string) => {},
}));
