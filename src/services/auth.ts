// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** Login with email and password POST /api/v1/auth/login */
export async function login(
  body: HotKeyAPI.LoginRequest,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Logout and revoke session POST /api/v1/auth/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<HotKeyAPI.ErrorBody>("/api/v1/auth/logout", {
    method: "POST",
    ...(options || {}),
  });
}

/** Get current user profile GET /api/v1/auth/me */
export async function me(options?: { [key: string]: any }) {
  return request<HotKeyAPI.AuthenticatedUserResponse>("/api/v1/auth/me", {
    method: "GET",
    ...(options || {}),
  });
}

/** Reset password with verification ticket POST /api/v1/auth/password/reset */
export async function resetPassword(
  body: HotKeyAPI.PasswordResetRequest,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.ErrorBody>("/api/v1/auth/password/reset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Register a new user POST /api/v1/auth/register */
export async function register(
  body: HotKeyAPI.EmailRegisterRequest,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.LoginResponse>("/api/v1/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Refresh access token POST /api/v1/auth/token/refresh */
export async function refreshToken(options?: { [key: string]: any }) {
  return request<HotKeyAPI.AuthTokenResponse>("/api/v1/auth/token/refresh", {
    method: "POST",
    ...(options || {}),
  });
}

/** Send a verification code POST /api/v1/auth/verifications */
export async function sendVerification(
  body: HotKeyAPI.VerificationSendRequest,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.VerificationSendResponse>(
    "/api/v1/auth/verifications",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** Confirm a verification code POST /api/v1/auth/verifications/confirm */
export async function confirmVerification(
  body: HotKeyAPI.VerificationConfirmRequest,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.VerificationTicketResponse>(
    "/api/v1/auth/verifications/confirm",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}
