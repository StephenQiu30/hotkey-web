import { describe, it, expect, beforeEach } from "vitest";

// -- authSession.ts unit tests ---------------------------------------

describe("authSession", () => {
  it("stores and retrieves access token", async () => {
    const { setAccessToken, getAccessToken, clearAccessToken } = await import("@/lib/authSession");
    clearAccessToken();
    setAccessToken("tok1", 3600);
    expect(getAccessToken()).toBe("tok1");
    clearAccessToken();
    expect(getAccessToken()).toBe("");
  });

  it("detects expired token", async () => {
    const { setAccessToken, isAccessTokenExpired, clearAccessToken } = await import("@/lib/authSession");
    clearAccessToken();
    expect(isAccessTokenExpired()).toBe(true);
    setAccessToken("tok", 3600);
    expect(isAccessTokenExpired()).toBe(false);
  });

  it("supports single-flight refresh promise", async () => {
    const { refreshAccessToken, resetRefreshPromise } = await import("@/lib/authSession");
    resetRefreshPromise();
    let calls = 0;
    const p1 = refreshAccessToken(async () => { calls++; return "tok-a"; });
    const p2 = refreshAccessToken(async () => { calls++; return "tok-b"; });
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe("tok-a");
    expect(r2).toBe("tok-a"); // same promise shared
    expect(calls).toBe(1);
  });
});

// -- authErrors.ts unit tests -----------------------------------------

describe("authErrors", () => {
  it("maps known error codes to Chinese messages", async () => {
    const { errorMessage } = await import("@/lib/authErrors");
    expect(errorMessage("AUTH_INVALID_CREDENTIALS")).toBe("邮箱或密码错误");
    expect(errorMessage("AUTH_EMAIL_ALREADY_REGISTERED")).toBe("该邮箱已注册");
    expect(errorMessage("AUTH_PASSWORD_POLICY_VIOLATION")).toContain("密码强度不足");
  });

  it("falls back to generic message for unknown codes", async () => {
    const { errorMessage } = await import("@/lib/authErrors");
    expect(errorMessage("UNKNOWN_CODE" as HotKeyAPI.ErrorCode)).toBe("操作失败，请稍后重试");
  });
});

// -- HotKeyAPIError ----------------------------------------------------

describe("HotKeyAPIError", () => {
  it("carries HTTP status and stable business error code", async () => {
    const { HotKeyAPIError } = await import("@/lib/request");
    const err = new HotKeyAPIError(401, "AUTH_INVALID_CREDENTIALS");
    expect(err.code).toBe(401);
    expect(err.errorCode).toBe("AUTH_INVALID_CREDENTIALS");
    expect(err.message).toBe('code: 401, data: null, message: "邮箱或密码错误"');
    expect(err.name).toBe("HotKeyAPIError");
  });
});

describe("registration contract", () => {
  it("submits the verification ticket instead of the verified email", async () => {
    const { createRegisterRequest } = await import("@/lib/registerRequest");
    expect(createRegisterRequest("ticket-123", "Passw0rd!", "Alice")).toEqual({
      verification_ticket: "ticket-123",
      password: "Passw0rd!",
      display_name: "Alice",
    });
  });
});
