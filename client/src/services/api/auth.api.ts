import { apiClient } from "./client";
import { User } from "@/types";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ user: User; accessToken?: string; token?: string }>("/auth/login", {
      email,
      password,
    }),

  register: (username: string, email: string, password: string) =>
    apiClient.post<{ user: User; accessToken?: string; token?: string }>("/auth/register", {
      displayName: username,
      email,
      password,
    }),

  logout: () => apiClient.post<void>("/auth/logout"),

  getMe: () => apiClient.get<User>("/auth/me"),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, passwordHash: string) =>
    apiClient.post<{ message: string }>("/auth/reset-password", { token, passwordHash }),
};
