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

// -- HotKeyAPIError ----------------------------------------------------

describe("HotKeyAPIError", () => {
  it("carries HTTP status and Chinese message", async () => {
    const { HotKeyAPIError } = await import("@/lib/request");
    const err = new HotKeyAPIError(401, "邮箱或密码错误");
    expect(err.code).toBe(401);
    expect(err.message).toBe("邮箱或密码错误");
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
