import { authApi } from "./api/auth.api";
import { User } from "@/types";

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await authApi.login(email, password);
      const token = response.data.accessToken || (response.data as any).token || "";
      return { user: response.data.user, token };
    } catch (e: any) {
      const serverErrors = e.response?.data?.errors;
      const firstError =
        Array.isArray(serverErrors) && serverErrors.length > 0 ? serverErrors[0].message : null;
      const message =
        firstError ||
        e.response?.data?.message ||
        e.message ||
        "Failed to sign in. Please verify credentials.";
      console.warn("[Auth Service] Login failed:", message);
      throw new Error(message);
    }
  },

  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> => {
    try {
      const response = await authApi.register(username, email, password);
      let token = response.data.accessToken || (response.data as any).token;
      if (!token) {
        // Auto-login to obtain accessToken after registration
        const loginRes = await authApi.login(email, password);
        token = loginRes.data.accessToken || (loginRes.data as any).token || "";
        return { user: loginRes.data.user || response.data.user, token };
      }
      return { user: response.data.user, token };
    } catch (e: any) {
      const serverErrors = e.response?.data?.errors;
      const firstError =
        Array.isArray(serverErrors) && serverErrors.length > 0 ? serverErrors[0].message : null;
      const message =
        firstError ||
        e.response?.data?.message ||
        e.message ||
        "Failed to register. Please try again.";
      console.warn("[Auth Service] Registration failed:", message);
      throw new Error(message);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn("[Auth Service] Logout locally.");
    }
  },

  getMe: async (): Promise<User> => {
    try {
      const response = await authApi.getMe();
      return response.data;
    } catch (e) {
      // Mock fallback: Retrieve from localStorage if exists
      const savedAuth =
        typeof window !== "undefined" ? localStorage.getItem("watchparty_auth") : null;
      if (savedAuth) {
        const { user } = JSON.parse(savedAuth);
        return user;
      }
      throw new Error("No authenticated session");
    }
  },

  forgotPassword: async (email: string): Promise<string> => {
    try {
      const response = await authApi.forgotPassword(email);
      return response.data.message;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return "Password reset email sent (Mock)";
    }
  },

  resetPassword: async (token: string, passwordHash: string): Promise<string> => {
    try {
      const response = await authApi.resetPassword(token, passwordHash);
      return response.data.message;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return "Password has been reset successfully (Mock)";
    }
  },
};
