import { create } from "zustand";
import { Friend, FriendRequest } from "../types";
import { MOCK_FRIENDS, MOCK_FRIEND_REQUESTS } from "../utils/mock-data";

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
    await new Promise((resolve) => setTimeout(resolve, 400));
    set({
      friends: MOCK_FRIENDS,
      requests: MOCK_FRIEND_REQUESTS,
      isLoading: false,
    });
  },

  sendFriendRequest: async (username: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In mock, let's just complete successfully
    set({ isLoading: false });
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
