import type { ApiErrorBody } from "./types";

const BASE_URL = "http://localhost:8000/api";

// A typed error class so components can check err.errorCode and branch
// (e.g. show a 404-specific message vs a generic one) instead of parsing strings.
export class ApiError extends Error {
  errorCode: ApiErrorBody["error_code"];
  status: number;

  constructor(body: ApiErrorBody, status: number) {
    super(body.detail);
    this.errorCode = body.error_code;
    this.status = status;
  }
}

// One function all requests funnel through. Handles: base URL, JSON headers,
// parsing your {detail, error_code} error shape, and 204s (which have no body to parse).
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json()) as ApiErrorBody;
    throw new ApiError(body, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}