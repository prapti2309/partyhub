import { apiClient } from "./client";
import { Friend, FriendRequest } from "@/types";

export const friendApi = {
  getFriends: () => apiClient.get<Friend[]>("/friends"),

  getFriendRequests: () => apiClient.get<FriendRequest[]>("/friends/requests"),

  sendRequest: (username: string) => apiClient.post<void>("/friends/requests", { username }),

  acceptRequest: (requestId: string) =>
    apiClient.post<void>(`/friends/requests/${requestId}/accept`),

  declineRequest: (requestId: string) =>
    apiClient.post<void>(`/friends/requests/${requestId}/decline`),

  removeFriend: (friendId: string) => apiClient.delete<void>(`/friends/${friendId}`),
};
