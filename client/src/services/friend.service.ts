import { friendApi } from "./api/friend.api";
import { Friend, FriendRequest } from "@/types";

export const friendService = {
  getFriends: async (): Promise<Friend[]> => {
    try {
      const response = await friendApi.getFriends();
      return response.data || [];
    } catch (e) {
      return [];
    }
  },

  getFriendRequests: async (): Promise<FriendRequest[]> => {
    try {
      const response = await friendApi.getFriendRequests();
      return response.data || [];
    } catch (e) {
      return [];
    }
  },

  sendRequest: async (username: string): Promise<void> => {
    try {
      await friendApi.sendRequest(username);
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log(`[Friend Service Mock] Sent friend request to ${username}`);
    }
  },

  acceptRequest: async (requestId: string): Promise<void> => {
    try {
      await friendApi.acceptRequest(requestId);
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log(`[Friend Service Mock] Accepted request: ${requestId}`);
    }
  },

  declineRequest: async (requestId: string): Promise<void> => {
    try {
      await friendApi.declineRequest(requestId);
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log(`[Friend Service Mock] Declined request: ${requestId}`);
    }
  },

  removeFriend: async (friendId: string): Promise<void> => {
    try {
      await friendApi.removeFriend(friendId);
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log(`[Friend Service Mock] Removed friend: ${friendId}`);
    }
  },
};
