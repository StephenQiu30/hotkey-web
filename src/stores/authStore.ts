import { create } from "zustand";

interface AuthUser {
  email: string;
  displayName?: string;
}

interface AuthState {
  token: string;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "",
  user: null,
  isAuthenticated:
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false,
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: "", user: null, isAuthenticated: false });
  },
}));
