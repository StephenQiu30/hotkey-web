import { create } from "zustand";

interface AuthUser {
  email: string;
  displayName?: string;
}

interface AuthState {
  token: string;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  hydrate: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: "",
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user, isAuthenticated: true });
  },
  hydrate: () => {
    const token = localStorage.getItem("token") ?? "";
    set({ token, isAuthenticated: !!token, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: "", user: null, isAuthenticated: false });
  },
}));
