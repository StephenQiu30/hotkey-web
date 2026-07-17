import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getAuthMe,
  postAuthLogin,
  postAuthLogout,
  postAuthRefresh,
} from "@/services/hotkey/hotkey-server/identity";
import { setAccessToken, clearAccessToken, getAccessToken } from "@/lib/authSession";

export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: HotKeyAPI.UserResponse | null;
  error: string | null;

  initialize(): Promise<void>;
  establishSession(data: HotKeyAPI.AuthenticationResponse): Promise<void>;
  login(input: { email: string; password: string }): Promise<void>;
  logout(): Promise<void>;
  clearSession(): void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: "initializing",
      user: null,
      error: null,

      initialize: async () => {
        // Step 1: restore token from localStorage (handled by authSession.ts)
        const token = getAccessToken();
        if (!token) {
          // No token — try HttpOnly refresh cookie (legacy / first-time)
          try {
            const res = await postAuthRefresh();
            const newToken = res.data?.access_token ?? "";
            if (!newToken) throw new Error("no token");
            setAccessToken(newToken, 900);
          } catch {
            set({ status: "unauthenticated", user: null, error: null });
            return;
          }
        }
        // Step 2: validate token and fetch user
        try {
          const res = await getAuthMe();
          set({ status: "authenticated", user: res.data ?? null, error: null });
        } catch {
          clearAccessToken();
          set({ status: "unauthenticated", user: null, error: null });
        }
      },

      establishSession: async (data) => {
        const token = data.access_token;
        if (!token) throw new Error("登录响应无效");
        setAccessToken(token, 900);
        const meRes = await getAuthMe();
        set({ status: "authenticated", user: meRes.data ?? null, error: null });
      },

      login: async (input) => {
        try {
          const res = await postAuthLogin(input);
          const token = res.data?.access_token;
          const userData = res.data?.user;
          if (!token || !userData) throw new Error("登录响应无效");

          await get().establishSession({ access_token: token, user: userData });
        } catch (err: any) {
          set({ status: "unauthenticated", user: null, error: err.message ?? null });
          throw err;
        }
      },

      logout: async () => {
        const { status } = get();
        if (status === "unauthenticated") return;
        try {
          await postAuthLogout();
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
    }),
    {
      name: "hk-auth-storage",
      // Only persist user to localStorage; status and error are session-only
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
