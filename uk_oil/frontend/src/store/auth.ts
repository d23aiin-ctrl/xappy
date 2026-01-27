import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  badge_number: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  role: string;
  status: string;
  site_id?: string;
  department?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setUser: (user) => {
        localStorage.setItem("user", JSON.stringify(user));
        set({ user });
      },

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        set({ accessToken, refreshToken });
      },

      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "xappy-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper to initialize auth from localStorage
export const initializeAuth = () => {
  const token = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const userStr = localStorage.getItem("user");

  if (token && refreshToken && userStr) {
    try {
      const user = JSON.parse(userStr);
      useAuthStore.getState().setAuth(user, token, refreshToken);
    } catch {
      useAuthStore.getState().logout();
    }
  } else {
    useAuthStore.getState().setLoading(false);
  }
};
