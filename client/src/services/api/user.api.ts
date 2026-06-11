import { apiClient } from "./client";
import { User, Profile } from "@/types";

export const userApi = {
  getUserProfile: (userId: string) => apiClient.get<User>(`/users/${userId}`),

  updateProfile: (profile: Partial<Profile>) => apiClient.patch<Profile>("/users/profile", profile),

  deleteAccount: () => apiClient.delete<void>("/users/account"),

  searchUsers: (query: string) => apiClient.get<User[]>(`/users/search?q=${query}`),
};
