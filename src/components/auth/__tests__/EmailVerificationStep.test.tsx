import { describe, it, expect } from "vitest";
import EmailVerificationStep from "@/components/auth/EmailVerificationStep";
import {
  postAuthEmailVerifications,
  postAuthEmailVerificationsConfirm,
} from "@/services/hotkey/hotkey-server/identity";

// Module-level smoke tests — Ant Design's jsdom rendering quirks
// make direct component rendering unreliable. Core logic (store, session,
// error codes) is unit-tested in their respective test files.

describe("EmailVerificationStep", () => {
  it("component module exports correctly", () => {
    expect(EmailVerificationStep).toBeDefined();
    expect(typeof EmailVerificationStep).toBe("function");
  });

  it("auth service module exports correctly", () => {
    expect(typeof postAuthEmailVerifications).toBe("function");
    expect(typeof postAuthEmailVerificationsConfirm).toBe("function");
  });
});
