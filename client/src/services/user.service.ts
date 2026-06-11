import { userApi } from "./api/user.api";
import { User, Profile } from "@/types";
import { MOCK_USERS } from "../utils/mock-data";

export const userService = {
  getUserProfile: async (userId: string): Promise<User> => {
    try {
      const response = await userApi.getUserProfile(userId);
      return response.data;
    } catch (e) {
      const user = MOCK_USERS.find((u) => u.id === userId);
      if (user) return user;
      throw new Error("User not found");
    }
  },

  updateProfile: async (profile: Partial<Profile>): Promise<Profile> => {
    try {
      const response = await userApi.updateProfile(profile);
      return response.data;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return profile as Profile;
    }
  },

  deleteAccount: async (): Promise<void> => {
    try {
      await userApi.deleteAccount();
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log("[User Service Mock] Soft deleted current user account");
    }
  },

  searchUsers: async (query: string): Promise<User[]> => {
    try {
      const response = await userApi.searchUsers(query);
      return response.data;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_USERS.filter(
        (u) =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.profile?.displayName.toLowerCase().includes(query.toLowerCase())
      );
    }
  },
};
