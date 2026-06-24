type RequestOptions = RequestInit & {
  data?: unknown;
  params?: Record<string, unknown>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_HOTKEY_API_BASE_URL ?? "http://localhost:8000";

type APIErrorPayload = {
  error?: string;
  code?: string;
};

export class HotKeyAPIError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "HotKeyAPIError";
    this.status = status;
    this.code = code;
  }
}

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
    throw await toAPIError(response);
  }

  return (await response.json()) as T;
}

async function toAPIError(response: Response): Promise<HotKeyAPIError> {
  const fallbackMessage = `HotKey API request failed: ${response.status}`;
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as APIErrorPayload;
    return new HotKeyAPIError(payload.error || fallbackMessage, response.status, payload.code);
  }

  const detail = await response.text();
  return new HotKeyAPIError(detail || fallbackMessage, response.status);
}
