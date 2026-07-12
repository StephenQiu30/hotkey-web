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
    const { ErrorCode, errorMessage } = await import("@/lib/authErrors");
    expect(errorMessage(ErrorCode.AUTH_INVALID_CREDENTIALS)).toBe("邮箱或密码错误");
    expect(errorMessage(ErrorCode.AUTH_EMAIL_TAKEN)).toBe("该邮箱已注册");
    expect(errorMessage(ErrorCode.AUTH_WEAK_PASSWORD)).toContain("密码强度不足");
  });

  it("falls back to generic message for unknown codes", async () => {
    const { errorMessage } = await import("@/lib/authErrors");
    expect(errorMessage("UNKNOWN_CODE")).toBe("操作失败，请稍后再试");
  });
});

// -- HotKeyAPIError ----------------------------------------------------

describe("HotKeyAPIError", () => {
  it("carries code, status, and requestId", async () => {
    const { HotKeyAPIError } = await import("@/lib/request");
    const err = new HotKeyAPIError("bad", 400, "VALIDATION_ERROR", "req-123");
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.status).toBe(400);
    expect(err.requestId).toBe("req-123");
    expect(err.message).toBe("bad");
    expect(err.name).toBe("HotKeyAPIError");
  });
});
