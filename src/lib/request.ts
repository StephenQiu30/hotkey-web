import axios, { AxiosError } from "axios";
import {
  getAccessToken,
  clearAccessToken,
  refreshAccessToken,
  resetRefreshPromise,
} from "./authSession";

/** Pages that do NOT require authentication — skip redirect-to-login on 401. */
const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

function shouldSkipRedirect(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

/**
 * Internal marker to prevent infinite refresh loops.
 * Requests already retried carry _retry: true on their config.
 */
const RETRY_MARKER = "_retry" as const;

/** Endpoints that must NEVER trigger an automatic token refresh. */
const NO_REFRESH_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout",
  "/api/v1/auth/me",
  "/api/v1/auth/password/reset",
  "/api/v1/auth/verifications",
  "/api/v1/auth/verifications/confirm",
];

function isNoRefreshPath(url: string = ""): boolean {
  return NO_REFRESH_PATHS.some((p) => url.startsWith(p));
}

export class HotKeyAPIError extends Error {
  code?: string;
  status: number;
  requestId?: string;

  constructor(message: string, status: number, code?: string, requestId?: string) {
    super(message);
    this.name = "HotKeyAPIError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

const apiClient = axios.create({
  baseURL: "",
  timeout: 15000,
  withCredentials: true, // HttpOnly Refresh Cookie
});

// ── Request interceptor: inject Bearer token from memory ───────────

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: envelope parsing + single-flight refresh ─

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string; message?: string; request_id?: string }>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const requestUrl = error.config?.url ?? "";
    const isRetry = (error.config as any)?.[RETRY_MARKER] === true;

    // Parse envelope fields
    const code = body?.code;
    const message = body?.message ?? error.message;
    const requestId = body?.request_id;

    // 401 handling: refresh + retry (once per request)
    if (status === 401 && !isRetry && !isNoRefreshPath(requestUrl)) {
      try {
        // Single-flight: all concurrent 401s share one refresh
        const newToken = await refreshAccessToken(async () => {
          const { refreshToken } = await import("@/services/auth");
          const res = await refreshToken();
          const data = res.data ?? {};
          const token = data.access_token ?? "";
          if (!token) throw new Error("refresh returned no token");
          return token;
        });

        // Update the stored token
        (await import("./authSession")).setAccessToken(newToken, 3600);

        // Retry the original request with the new token
        const retryConfig: Record<string, any> = {
          ...error.config,
          headers: { ...(error.config?.headers ?? {}) as any, Authorization: `Bearer ${newToken}` },
          _retry: true,
        };
        const retryResponse = await apiClient(retryConfig);
        return retryResponse;
      } catch (refreshError) {
        // Refresh failed — clear session
        clearAccessToken();
        resetRefreshPromise();
        if (typeof window !== "undefined" && !shouldSkipRedirect(window.location.pathname)) {
          window.location.href = "/login";
        }
        return Promise.reject(
          new HotKeyAPIError("登录已过期，请重新登录", 401, "AUTH_SESSION_EXPIRED"),
        );
      }
    }

    // 401 on auth endpoints or retry — fail immediately
    if (status === 401) {
      clearAccessToken();
      if (typeof window !== "undefined" && !shouldSkipRedirect(window.location.pathname)) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new HotKeyAPIError(message, status, code, requestId));
  },
);

/**
 * Unified API request helper.
 *
 * Wraps the Axios instance which handles:
 * - Bearer token injection from memory
 * - HttpOnly refresh cookie (withCredentials)
 * - Automatic 401 → refresh → retry (single-flight)
 * - Unified envelope error parsing
 */
export async function request<T>(url: string, options?: any): Promise<T> {
  const response = await apiClient({ url, ...options });
  return response.data;
}
