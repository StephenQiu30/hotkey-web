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

/** Register a new user POST /api/v1/auth/register */
export async function register(
  body: HotKeyAPI.RegisterRequest,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.UserResponse>("/api/v1/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
