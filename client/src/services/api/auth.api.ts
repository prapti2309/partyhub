import { apiClient } from "./client";
import { User } from "@/types";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ user: User; token: string }>("/auth/login", { email, password }),

  register: (username: string, email: string, passwordHash: string) =>
    apiClient.post<{ user: User; token: string }>("/auth/register", {
      username,
      email,
      passwordHash,
    }),

  logout: () => apiClient.post<void>("/auth/logout"),

  getMe: () => apiClient.get<User>("/auth/me"),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, passwordHash: string) =>
    apiClient.post<{ message: string }>("/auth/reset-password", { token, passwordHash }),
};
