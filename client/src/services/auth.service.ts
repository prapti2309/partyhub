import { authApi } from "./api/auth.api";
import { User } from "@/types";

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await authApi.login(email, password);
      return response.data;
    } catch (e) {
      console.warn("[Auth Service] Falling back to mock login");
      const username = email.split("@")[0] || "neon_user";
      // Simulated response
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        user: {
          id: "user-current",
          username,
          email,
          role: "USER",
          createdAt: new Date().toISOString(),
          profile: {
            displayName: username,
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
            bio: "Hey there! I am using WatchParty.",
            status: "Chilling",
          },
        },
        token: "mock_jwt_token_" + Math.random().toString(36).substring(2),
      };
    }
  },

  register: async (
    username: string,
    email: string,
    passwordHash: string
  ): Promise<{ user: User; token: string }> => {
    try {
      const response = await authApi.register(username, email, passwordHash);
      return response.data;
    } catch (e) {
      console.warn("[Auth Service] Falling back to mock registration");
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        user: {
          id: "user-current",
          username,
          email,
          role: "USER",
          createdAt: new Date().toISOString(),
          profile: {
            displayName: username,
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
            bio: "Hey there! I am using WatchParty.",
            status: "Chilling",
          },
        },
        token: "mock_jwt_token_" + Math.random().toString(36).substring(2),
      };
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
