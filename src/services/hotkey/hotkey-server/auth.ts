// @ts-ignore
/* eslint-disable */
import { request } from "@/lib/request";

/** Github Callback GET /api/auth/github/callback */
export async function githubCallbackApiAuthGithubCallbackGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: HotKeyAPI.githubCallbackApiAuthGithubCallbackGetParams,
  options?: { [key: string]: any }
) {
  return request<any>("/api/auth/github/callback", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** Github Login GET /api/auth/github/login */
export async function githubLoginApiAuthGithubLoginGet(options?: {
  [key: string]: any;
}) {
  return request<HotKeyAPI.GitHubAuthInitResponse>("/api/auth/github/login", {
    method: "GET",
    ...(options || {}),
  });
}

/** Login With Email POST /api/auth/login */
export async function loginWithEmailApiAuthLoginPost(
  body: HotKeyAPI.EmailLoginRequest,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.AuthResponse>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Auth Me GET /api/auth/me */
export async function authMeApiAuthMeGet(options?: { [key: string]: any }) {
  return request<HotKeyAPI.UserRead>("/api/auth/me", {
    method: "GET",
    ...(options || {}),
  });
}

/** Login With Miniapp POST /api/auth/miniapp/login */
export async function loginWithMiniappApiAuthMiniappLoginPost(
  body: HotKeyAPI.MiniappLoginRequest,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.AuthResponse>("/api/auth/miniapp/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Register With Email POST /api/auth/register */
export async function registerWithEmailApiAuthRegisterPost(
  body: HotKeyAPI.EmailRegisterRequest,
  options?: { [key: string]: any }
) {
  return request<HotKeyAPI.AuthResponse>("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Auth Token Exchange GET /api/auth/token */
export async function authTokenExchangeApiAuthTokenGet(options?: {
  [key: string]: any;
}) {
  return request<HotKeyAPI.AuthResponse>("/api/auth/token", {
    method: "GET",
    ...(options || {}),
  });
}

/** Refresh Auth Token POST /api/auth/token/refresh */
export async function refreshAuthTokenApiAuthTokenRefreshPost(options?: {
  [key: string]: any;
}) {
  return request<HotKeyAPI.TokenRefreshResponse>("/api/auth/token/refresh", {
    method: "POST",
    ...(options || {}),
  });
}
