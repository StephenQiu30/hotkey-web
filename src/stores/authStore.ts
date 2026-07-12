import { create } from "zustand";
import { login as apiLogin, logout as apiLogout, me as apiMe } from "@/services/auth";
import { setAccessToken, clearAccessToken } from "@/lib/authSession";

export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: HotKeyAPI.AuthenticatedUserData | null;
  error: string | null;

  initialize(): Promise<void>;
  login(input: { email: string; password: string }): Promise<void>;
  logout(): Promise<void>;
  clearSession(): void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "initializing",
  user: null,
  error: null,

  initialize: async () => {
    try {
      const res = await apiMe();
      set({ status: "authenticated", user: res.data ?? null, error: null });
    } catch {
      set({ status: "unauthenticated", user: null, error: null });
    }
  },

  login: async (input) => {
    try {
      const res = await apiLogin(input);
      const token = res.data?.token;
      const userData = res.data?.user;
      if (!token || !userData) throw new Error("登录响应无效");

      setAccessToken(token, 3600);

      // Fetch full profile
      const meRes = await apiMe();
      set({ status: "authenticated", user: meRes.data ?? null, error: null });
    } catch (err: any) {
      const code = err.code ?? "AUTH_INVALID_CREDENTIALS";
      set({ status: "unauthenticated", user: null, error: code });
      throw err;
    }
  },

  logout: async () => {
    const { status } = get();
    if (status === "unauthenticated") return;
    try {
      await apiLogout();
    } catch {
      // API failure ignored — clear local state regardless
    }
    clearAccessToken();
    set({ status: "unauthenticated", user: null, error: null });
  },

  clearSession: () => {
    clearAccessToken();
    set({ status: "unauthenticated", user: null, error: null });
  },
}));
