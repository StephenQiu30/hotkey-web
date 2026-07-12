/**
 * In-memory access token and single-flight refresh coordination.
 *
 * Token and verification Ticket remain in memory only — never written
 * to LocalStorage, SessionStorage, query strings, or analytics.
 */

let accessToken = "";
let expiresAt = 0;
let refreshPromise: Promise<string> | null = null;

/**
 * Store a new access token in memory.
 */
export function setAccessToken(token: string, expiresIn: number): void {
  accessToken = token;
  expiresAt = Date.now() + expiresIn * 1000;
}

/**
 * Clear the in-memory access token (logout / session end).
 */
export function clearAccessToken(): void {
  accessToken = "";
  expiresAt = 0;
}

/**
 * Read the current in-memory access token.
 */
export function getAccessToken(): string {
  return accessToken;
}

/**
 * Returns true when no valid access token is held.
 */
export function isAccessTokenExpired(): boolean {
  if (!accessToken) return true;
  // Buffer by 10 s to avoid edge-of-expiry races
  return Date.now() + 10_000 >= expiresAt;
}

/**
 * Single-flight refresh: callers share one in-flight Promise.
 *
 * The caller (response interceptor) provides the actual refresh
 * implementation so it can import generated services without
 * creating a circular dependency.
 */
export function refreshAccessToken(
  perform: () => Promise<string>,
): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = perform().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Reset the single-flight Promise (e.g. after logout).
 */
export function resetRefreshPromise(): void {
  refreshPromise = null;
}
