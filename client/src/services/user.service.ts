import { userApi } from "./api/user.api";
import { User, Profile } from "@/types";

export const userService = {
  getUserProfile: async (userId: string): Promise<User> => {
    const response = await userApi.getUserProfile(userId);
    return response.data;
  },

  updateProfile: async (profile: Partial<Profile>): Promise<Profile> => {
    const response = await userApi.updateProfile(profile);
    return response.data;
  },

  deleteAccount: async (): Promise<void> => {
    await userApi.deleteAccount();
  },

  searchUsers: async (query: string): Promise<User[]> => {
    try {
      const response = await userApi.searchUsers(query);
      return response.data || [];
    } catch {
      return [];
    }
  },
};
