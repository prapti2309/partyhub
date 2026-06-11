import { roomApi } from "./api/room.api";
import { Room, RoomSettings, RoomMember } from "@/types";
import { MOCK_ROOMS } from "../utils/mock-data";

export const roomService = {
  createRoom: async (
    name: string,
    settings: Partial<RoomSettings>,
    maxCapacity: number
  ): Promise<Room> => {
    try {
      const response = await roomApi.createRoom(name, settings, maxCapacity);
      return response.data;
    } catch (e) {
      console.warn("[Room Service] Falling back to mock room creation");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const mockRoom: Room = {
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
            username: "neon_nova",
            avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=nova",
            role: "OWNER",
            isMuted: false,
          },
        ],
        settings: {
          sharedControls: false,
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: true,
          guestAllowed: true,
          ...settings,
        },
        videoSession: {
          videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
          videoTitle: "Neon Nights Trailer",
          position: 0,
          isPlaying: false,
          speed: 1.0,
        },
      };
      return mockRoom;
    }
  },

  getRoomByCode: async (code: string): Promise<Room> => {
    try {
      const response = await roomApi.getRoomByCode(code);
      return response.data;
    } catch (e) {
      console.warn("[Room Service] Falling back to mock room lookup");
      await new Promise((resolve) => setTimeout(resolve, 400));
      const room = MOCK_ROOMS.find((r) => r.code.toUpperCase() === code.toUpperCase());
      if (room) return room;

      // Fallback create
      return {
        id: "room-mock-" + code,
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
            avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=vibemaster",
            role: "OWNER",
            isMuted: false,
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
    }
  },

  updateRoomSettings: async (
    roomId: string,
    settings: Partial<RoomSettings>
  ): Promise<RoomSettings> => {
    try {
      const response = await roomApi.updateRoomSettings(roomId, settings);
      return response.data;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return settings as RoomSettings;
    }
  },

  kickMember: async (roomId: string, userId: string): Promise<void> => {
    try {
      await roomApi.kickMember(roomId, userId);
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log(`[Room Service Mock] Kicked user ${userId} from room ${roomId}`);
    }
  },

  banMember: async (roomId: string, userId: string): Promise<void> => {
    try {
      await roomApi.banMember(roomId, userId);
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log(`[Room Service Mock] Banned user ${userId} from room ${roomId}`);
    }
  },

  getRoomMembers: async (roomId: string): Promise<RoomMember[]> => {
    try {
      const response = await roomApi.getRoomMembers(roomId);
      return response.data;
    } catch (e) {
      const room = MOCK_ROOMS.find((r) => r.id === roomId);
      return room ? room.members : [];
    }
  },
};
