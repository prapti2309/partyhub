import { roomApi } from "./api/room.api";
import { Room, RoomSettings, RoomMember } from "@/types";

export const roomService = {
  createRoom: async (
    name: string,
    isPrivate: boolean = false,
    password?: string
  ): Promise<Room> => {
    const response = await roomApi.createRoom(name, isPrivate, password);
    const raw = (response.data as any).data?.room || response.data;
    return {
      id: raw.id,
      code: raw.roomCode || raw.code,
      name: raw.name,
      isPublic: !raw.isPrivate,
      maxCapacity: raw.maxCapacity || 10,
      ownerId: raw.ownerId,
      createdAt: raw.createdAt,
      members: raw.members || [],
      settings: raw.settings || {
        sharedControls: false,
        chatEnabled: true,
        voiceEnabled: true,
        videoEnabled: true,
        guestAllowed: true,
      },
    };
  },

  getRoomByCode: async (code: string): Promise<Room> => {
    const response = await roomApi.getRoomByCode(code);
    const raw = (response.data as any).data?.room || response.data;
    return {
      id: raw.id,
      code: raw.roomCode || raw.code,
      name: raw.name,
      isPublic: !raw.isPrivate,
      maxCapacity: raw.maxCapacity || 10,
      ownerId: raw.ownerId,
      createdAt: raw.createdAt,
      members: raw.members || [],
      settings: raw.settings || {
        sharedControls: false,
        chatEnabled: true,
        voiceEnabled: true,
        videoEnabled: true,
        guestAllowed: true,
      },
    };
  },

  updateRoomSettings: async (
    roomId: string,
    settings: Partial<RoomSettings>
  ): Promise<RoomSettings> => {
    const response = await roomApi.updateRoomSettings(roomId, settings);
    return (response.data as any).data?.settings || response.data;
  },

  kickMember: async (roomId: string, userId: string): Promise<void> => {
    await roomApi.kickMember(roomId, userId);
  },

  banMember: async (roomId: string, userId: string): Promise<void> => {
    await roomApi.banMember(roomId, userId);
  },

  getRoomMembers: async (roomId: string): Promise<RoomMember[]> => {
    try {
      const response = await roomApi.getRoomMembers(roomId);
      return (response.data as any).data?.members || response.data || [];
    } catch {
      return [];
    }
  },
};
