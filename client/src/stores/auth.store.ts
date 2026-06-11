import { create } from "zustand";
import { User, Profile } from "../types";

interface AuthStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, email: string) => Promise<void>;
  register: (username: string, email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<Profile>) => void;
}

// Helper to get initial state from localStorage safely
const getInitialState = () => {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }
  try {
    const saved = localStorage.getItem("watchparty_auth");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        user: parsed.user,
        token: parsed.token,
        isAuthenticated: !!parsed.token,
      };
    }
  } catch (e) {
    console.error("Failed to load auth state", e);
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialState = getInitialState();

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: initialState.user,
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated,
  isLoading: false,

  login: async (username: string, email: string) => {
    set({ isLoading: true });
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockUser: User = {
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
    };
    const mockToken = "mock_jwt_token_" + Math.random().toString(36).substring(2);

    localStorage.setItem("watchparty_auth", JSON.stringify({ user: mockUser, token: mockToken }));

    set({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  register: async (username: string, email: string) => {
    set({ isLoading: true });
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockUser: User = {
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
    };
    const mockToken = "mock_jwt_token_" + Math.random().toString(36).substring(2);

    localStorage.setItem("watchparty_auth", JSON.stringify({ user: mockUser, token: mockToken }));

    set({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem("watchparty_auth");
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateProfile: (profileUpdates: Partial<Profile>) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser: User = {
        ...state.user,
        profile: {
          ...state.user.profile,
          ...profileUpdates,
        } as Profile,
      };

      localStorage.setItem(
        "watchparty_auth",
        JSON.stringify({ user: updatedUser, token: state.token })
      );

      return { user: updatedUser };
    });
  },
}));
