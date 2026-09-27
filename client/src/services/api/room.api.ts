import { apiClient } from "./client";
import { Room, RoomSettings, RoomMember } from "@/types";

export const roomApi = {
  createRoom: (name: string, isPrivate?: boolean, password?: string) =>
    apiClient.post<{ status: string; data: { room: any } }>("/rooms", {
      name,
      isPrivate: !!isPrivate,
      password: password || undefined,
    }),

  getRoomByCode: (code: string) =>
    apiClient.get<{ status: string; data: { room: any } }>(`/rooms/${code}`),

  updateRoomSettings: (roomId: string, settings: Partial<RoomSettings>) =>
    apiClient.patch<{ status: string; data: { settings: RoomSettings } }>(
      `/rooms/${roomId}/settings`,
      settings
    ),

  kickMember: (roomId: string, userId: string) =>
    apiClient.post<void>(`/rooms/${roomId}/kick`, { targetUserId: userId }),

  banMember: (roomId: string, userId: string) =>
    apiClient.post<void>(`/rooms/${roomId}/ban`, { targetUserId: userId }),

  getRoomMembers: (roomId: string) =>
    apiClient.get<{ status: string; data: { members: RoomMember[] } }>(`/rooms/${roomId}/members`),
};
