import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/auth", () => ({
  login: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  refreshToken: vi.fn(),
}));

vi.mock("@/lib/authSession", () => ({
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
  getAccessToken: vi.fn(() => ""),
  isAccessTokenExpired: vi.fn(() => true),
}));

import { useAuthStore } from "@/stores/authStore";
import * as authService from "@/services/auth";
import * as authSession from "@/lib/authSession";

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ status: "initializing", user: null, error: null });
});

describe("auth store state machine", () => {
  it("starts in initializing state with no user", () => {
    const state = useAuthStore.getState();
    expect(state.status).toBe("initializing");
    expect(state.user).toBeNull();
  });

  it("initialize transitions to authenticated when me succeeds", async () => {
    const userData: HotKeyAPI.AuthenticatedUserData = {
      id: 1,
      email: "a@b.com",
      display_name: "Alice",
    };
    vi.mocked(authService.me).mockResolvedValueOnce({
      data: userData,
    } as any);

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(useAuthStore.getState().user).toEqual(userData);
  });

  it("initialize transitions to unauthenticated when me fails", async () => {
    vi.mocked(authService.me).mockRejectedValueOnce(new Error("no session"));

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("login stores token, fetches me, and sets authenticated", async () => {
    const userData: HotKeyAPI.AuthenticatedUserData = {
      id: 1,
      email: "a@b.com",
      display_name: "Alice",
      plan_type: "free",
    };

    // Mock login response
    vi.mocked(authService.login).mockResolvedValueOnce({
      data: { token: "tok1", user: { id: 1, email: "a@b.com", display_name: "Alice" } },
    } as any);

    // Mock me response
    vi.mocked(authService.me).mockResolvedValueOnce({
      data: userData,
    } as any);

    await useAuthStore.getState().login({
      email: "a@b.com",
      password: "pass123",
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "pass123",
    });
    expect(authSession.setAccessToken).toHaveBeenCalledWith("tok1", 900);
    expect(authService.me).toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(useAuthStore.getState().user).toEqual(userData);
  });

  it("establishes the session returned by registration without another login", async () => {
    const userData = { id: 2, email: "new@example.com", display_name: "New" } as HotKeyAPI.AuthenticatedUserData;
    vi.mocked(authService.me).mockResolvedValueOnce({ data: userData } as any);

    await useAuthStore.getState().establishSession({
      token: "registered-token",
      user: { id: 2, email: "new@example.com", display_name: "New" },
    });

    expect(authService.login).not.toHaveBeenCalled();
    expect(authSession.setAccessToken).toHaveBeenCalledWith("registered-token", 900);
    expect(authService.me).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().user).toEqual(userData);
  });

  it("login sets error on invalid credentials", async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      message: "邮箱或密码错误",
      code: 401,
    });

    await expect(
      useAuthStore.getState().login({ email: "a@b.com", password: "wrong" }),
    ).rejects.toThrow();

    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(useAuthStore.getState().error).toBe("邮箱或密码错误");
  });

  it("logout calls API and clears state", async () => {
    useAuthStore.setState({ status: "authenticated", user: { id: 1, email: "a@b.com" } as any });
    vi.mocked(authService.logout).mockResolvedValueOnce({ code: 200, message: "success" } as any);

    await useAuthStore.getState().logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(authSession.clearAccessToken).toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("logout is idempotent when already unauthenticated", async () => {
    useAuthStore.setState({ status: "unauthenticated", user: null });

    await useAuthStore.getState().logout();

    expect(authService.logout).not.toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("clearSession resets to unauthenticated", () => {
    useAuthStore.setState({ status: "authenticated", user: { id: 1 } as any });

    useAuthStore.getState().clearSession();

    expect(authSession.clearAccessToken).toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
