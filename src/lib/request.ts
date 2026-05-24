type RequestOptions = RequestInit & {
  data?: unknown;
  params?: Record<string, unknown>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_HOTKEY_API_BASE_URL ?? "http://localhost:8000";

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { data, params, headers, ...init } = options;
  const url = new URL(path, API_BASE_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body: data === undefined ? init.body : JSON.stringify(data),
    cache: init.cache ?? "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HotKey API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
