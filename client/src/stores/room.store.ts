import { create } from "zustand";
import { Room, RoomSettings, RoomMember, RoomMemberRole } from "../types";
import { MOCK_ROOMS } from "../utils/mock-data";

interface RoomStoreState {
  activeRoom: Room | null;
  roomsList: Room[];
  isLoading: boolean;
  createRoom: (
    name: string,
    settings: Partial<RoomSettings>,
    maxCapacity: number,
    username: string
  ) => Promise<Room>;
  joinRoom: (code: string, username: string) => Promise<Room>;
  leaveRoom: () => void;
  updateSettings: (settings: Partial<RoomSettings>) => void;
  kickMember: (userId: string) => void;
  toggleMuteMember: (userId: string) => void;
  toggleCameraMember: (userId: string) => void;
}

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  activeRoom: null,
  roomsList: MOCK_ROOMS,
  isLoading: false,

  createRoom: async (
    name: string,
    settings: Partial<RoomSettings>,
    maxCapacity: number,
    username: string
  ) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 600));

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const defaultSettings: RoomSettings = {
      sharedControls: false,
      chatEnabled: true,
      voiceEnabled: true,
      videoEnabled: true,
      guestAllowed: true,
      ...settings,
    };

    const newRoom: Room = {
      id: "room-" + Math.random().toString(36).substring(2, 8),
      code,
      name,
      isPublic: true,
      maxCapacity,
      ownerId: "user-current",
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: "user-current",
          username,
          avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
          role: "OWNER",
          isMuted: false,
          isDeafened: false,
          isCameraOn: false,
          isScreenSharing: false,
          speaking: false,
        },
      ],
      settings: defaultSettings,
      videoSession: {
        videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
        videoTitle: "Neon Nights Trailer",
        position: 0,
        isPlaying: false,
        speed: 1.0,
      },
    };

    set((state) => ({
      roomsList: [...state.roomsList, newRoom],
      activeRoom: newRoom,
      isLoading: false,
    }));

    return newRoom;
  },

  joinRoom: async (code: string, username: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Try to find in existing rooms list first
    const existing = get().roomsList.find((r) => r.code.toUpperCase() === code.toUpperCase());

    if (existing) {
      const isAlreadyMember = existing.members.some((m) => m.username === username);
      const updatedMembers = [...existing.members];

      if (!isAlreadyMember) {
        const newMember: RoomMember = {
          userId: "user-current",
          username,
          avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
          role: "VIEWER",
          isMuted: false,
          isDeafened: false,
          isCameraOn: false,
          isScreenSharing: false,
          speaking: false,
        };
        updatedMembers.push(newMember);
      }

      const updatedRoom = { ...existing, members: updatedMembers };

      set((state) => ({
        roomsList: state.roomsList.map((r) =>
          r.code.toUpperCase() === code.toUpperCase() ? updatedRoom : r
        ),
        activeRoom: updatedRoom,
        isLoading: false,
      }));

      return updatedRoom;
    } else {
      // Fallback fallback mock room creation to avoid not found errors on arbitrary codes
      const mockRoom: Room = {
        id: "room-gen-" + code,
        code: code.toUpperCase(),
        name: `${code.toUpperCase()} Vibe Room`,
        isPublic: true,
        maxCapacity: 10,
        ownerId: "user-other",
        createdAt: new Date().toISOString(),
        members: [
          {
            userId: "user-other",
            username: "vibe_master",
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=vibemaster`,
            role: "OWNER",
            isMuted: false,
            isDeafened: false,
            speaking: false,
          },
          {
            userId: "user-current",
            username,
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
            role: "VIEWER",
            isMuted: false,
            isDeafened: false,
            speaking: false,
          },
        ],
        settings: {
          sharedControls: false,
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: true,
          guestAllowed: true,
        },
        videoSession: {
          videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
          videoTitle: "Neon Nights Trailer",
          position: 0,
          isPlaying: false,
          speed: 1.0,
        },
      };

      set((state) => ({
        roomsList: [...state.roomsList, mockRoom],
        activeRoom: mockRoom,
        isLoading: false,
      }));

      return mockRoom;
    }
  },

  leaveRoom: () => {
    set({ activeRoom: null });
  },

  updateSettings: (settingsUpdates: Partial<RoomSettings>) => {
    set((state) => {
      if (!state.activeRoom) return state;
      const updated = {
        ...state.activeRoom,
        settings: { ...state.activeRoom.settings, ...settingsUpdates },
      };
      return {
        activeRoom: updated,
        roomsList: state.roomsList.map((r) => (r.id === state.activeRoom!.id ? updated : r)),
      };
    });
  },

  kickMember: (userId: string) => {
    set((state) => {
      if (!state.activeRoom) return state;
      const updatedMembers = state.activeRoom.members.filter((m) => m.userId !== userId);
      const updated = { ...state.activeRoom, members: updatedMembers };
      return {
        activeRoom: updated,
        roomsList: state.roomsList.map((r) => (r.id === state.activeRoom!.id ? updated : r)),
      };
    });
  },

  toggleMuteMember: (userId: string) => {
    set((state) => {
      if (!state.activeRoom) return state;
      const updatedMembers = state.activeRoom.members.map((m) =>
        m.userId === userId ? { ...m, isMuted: !m.isMuted } : m
      );
      const updated = { ...state.activeRoom, members: updatedMembers };
      return {
        activeRoom: updated,
      };
    });
  },

  toggleCameraMember: (userId: string) => {
    set((state) => {
      if (!state.activeRoom) return state;
      const updatedMembers = state.activeRoom.members.map((m) =>
        m.userId === userId ? { ...m, isCameraOn: !m.isCameraOn } : m
      );
      const updated = { ...state.activeRoom, members: updatedMembers };
      return {
        activeRoom: updated,
      };
    });
  },
}));
