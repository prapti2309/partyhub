import { create } from "zustand";
import { Friend, FriendRequest } from "../types";
import { friendService } from "../services/friend.service";

interface FriendsStoreState {
  friends: Friend[];
  requests: FriendRequest[];
  isLoading: boolean;
  fetchFriendsAndRequests: () => Promise<void>;
  sendFriendRequest: (username: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
}

export const useFriendsStore = create<FriendsStoreState>((set) => ({
  friends: [],
  requests: [],
  isLoading: false,

  fetchFriendsAndRequests: async () => {
    set({ isLoading: true });
    try {
      const [friends, requests] = await Promise.all([
        friendService.getFriends(),
        friendService.getFriendRequests(),
      ]);
      set({
        friends: friends || [],
        requests: requests || [],
        isLoading: false,
      });
    } catch {
      set({ friends: [], requests: [], isLoading: false });
    }
  },

  sendFriendRequest: async (username: string) => {
    set({ isLoading: true });
    try {
      await friendService.sendRequest(username);
    } finally {
      set({ isLoading: false });
    }
  },

  acceptFriendRequest: async (requestId: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));

    set((state) => {
      const acceptedReq = state.requests.find((r) => r.id === requestId);
      if (!acceptedReq) return { isLoading: false };

      const newFriend: Friend = {
        id: acceptedReq.requesterId,
        username: acceptedReq.requesterName,
        avatarUrl: acceptedReq.requesterAvatar,
        status: "ONLINE",
        customStatus: "Just became friends!",
      };

      return {
        friends: [...state.friends, newFriend],
        requests: state.requests.filter((r) => r.id !== requestId),
        isLoading: false,
      };
    });
  },

  declineFriendRequest: async (requestId: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 400));

    set((state) => ({
      requests: state.requests.filter((r) => r.id !== requestId),
      isLoading: false,
    }));
  },

  removeFriend: async (friendId: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 400));

    set((state) => ({
      friends: state.friends.filter((f) => f.id !== friendId),
      isLoading: false,
    }));
  },
}));
