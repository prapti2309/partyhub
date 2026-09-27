import { create } from "zustand";
import { User, Profile } from "../types";
import { authService } from "../services/auth.service";

interface AuthStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
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

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await authService.login(email, password);
      localStorage.setItem("watchparty_auth", JSON.stringify({ user: res.user, token: res.token }));

      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await authService.register(username, email, password);
      localStorage.setItem("watchparty_auth", JSON.stringify({ user: res.user, token: res.token }));

      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    authService.logout().catch(() => {});
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
