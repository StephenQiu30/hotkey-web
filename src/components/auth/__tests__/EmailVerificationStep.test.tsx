import { describe, it, expect } from "vitest";

// Module-level smoke tests — Ant Design's jsdom rendering quirks
// make direct component rendering unreliable. Core logic (store, session,
// error codes) is unit-tested in their respective test files.

describe("EmailVerificationStep", () => {
  it("component module exports correctly", async () => {
    const mod = await import("@/components/auth/EmailVerificationStep");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("auth service module exports correctly", async () => {
    const auth = await import("@/services/auth");
    expect(typeof auth.sendVerification).toBe("function");
    expect(typeof auth.confirmVerification).toBe("function");
  });
});
