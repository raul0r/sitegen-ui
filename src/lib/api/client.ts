import { normalizeApiError } from "./errors";

const JSON_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let lastRequestId: string | undefined;

export function getLastRequestId(): string | undefined {
  return lastRequestId;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && JSON_METHODS.has(method) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    method,
    headers,
  });
  const requestId = response.headers.get("X-Request-ID") ?? undefined;
  lastRequestId = requestId;
  const raw = await response.text();
  const payload = raw ? safeJson(raw) : null;

  if (!response.ok) {
    throw normalizeApiError(response.status, payload, requestId);
  }

  return payload as T;
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return { message: raw };
  }
}
