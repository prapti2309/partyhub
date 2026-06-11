import { apiClient } from "./client";
import { Room, RoomSettings, RoomMember } from "@/types";

export const roomApi = {
  createRoom: (name: string, settings: Partial<RoomSettings>, maxCapacity: number) =>
    apiClient.post<Room>("/rooms", { name, settings, maxCapacity }),

  getRoomByCode: (code: string) => apiClient.get<Room>(`/rooms/${code}`),

  updateRoomSettings: (roomId: string, settings: Partial<RoomSettings>) =>
    apiClient.patch<RoomSettings>(`/rooms/${roomId}/settings`, settings),

  kickMember: (roomId: string, userId: string) =>
    apiClient.post<void>(`/rooms/${roomId}/kick/${userId}`),

  banMember: (roomId: string, userId: string) =>
    apiClient.post<void>(`/rooms/${roomId}/ban/${userId}`),

  getRoomMembers: (roomId: string) => apiClient.get<RoomMember[]>(`/rooms/${roomId}/members`),
};
