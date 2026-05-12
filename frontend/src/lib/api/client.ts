// =============================================================================
// Shared API client
// Written once. Frozen after teammate A wires in real auth. Don't modify
// the public surface (request, ApiError) without team agreement.
// =============================================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!BASE_URL) {
  // eslint-disable-next-line no-console
  console.error("VITE_API_BASE_URL is not set. Check your .env file.");
}

/**
 * Token accessor. Teammate A's auth module should replace this with a real
 * implementation that reads from their auth context / localStorage.
 *
 * TODO(integration): replace with real token source once auth lands.
 * Temporary: reads from localStorage so login flow can drop a token there.
 */
function getAuthToken(): string | null {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Set to true to send FormData (multipart). Body must be a FormData instance. */
  multipart?: boolean;
  /** Override or extend headers. */
  headers?: Record<string, string>;
}

/**
 * Decides whether a parsed response is an envelope wrapper like
 *   { message: "...", data: [...] }
 * (which we want to unwrap) versus a real entity that just happens to have
 * a `data` field as part of its own schema (like our incident records,
 * which carry a stringified JSON blob in a field called `data`).
 *
 * Envelopes are objects whose keys are roughly { data + message/success/status }
 * and nothing else. Real entities carry schema fields like `id`, `createdAt`,
 * `status` (the entity's status, not the envelope's), etc.
 *
 * Heuristic: it's an envelope only when EITHER
 *   - the only keys are `data` plus a subset of {message, success}, OR
 *   - there is no `id` field at the top level.
 *
 * If the top level has an `id`, it's almost certainly the entity itself.
 */
function isEnvelope(parsed: object): boolean {
  const obj = parsed as Record<string, unknown>;
  if (!("data" in obj)) return false;
  if ("id" in obj) return false; // entity, not envelope
  const keys = Object.keys(obj);
  const envelopeKeys = new Set(["data", "message", "success", "status"]);
  return keys.every((k) => envelopeKeys.has(k));
}

/**
 * Core request helper.
 * Handles:
 * - Base URL prefixing
 * - Bearer token injection
 * - ngrok browser warning bypass
 * - JSON body serialization (or multipart passthrough)
 * - Error envelope parsing
 * - Response unwrapping (handles both {message,data} and raw shapes)
 */
export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, multipart = false, headers = {} } = options;

  const token = getAuthToken();
  const finalHeaders: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
    ...headers,
  };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (!multipart && body !== undefined) finalHeaders["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: multipart ? (body as BodyInit) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Parse response (might be JSON, plain string, or empty).
  const contentType = res.headers.get("content-type") ?? "";
  let parsed: unknown = null;
  if (contentType.includes("application/json")) {
    parsed = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => "");
    parsed = text;
  }

  if (!res.ok) {
    // Backend error shape per onboarding doc: { status, error, message, timestamp }
    const message =
      (parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message?: unknown }).message ?? "")
        : "") || res.statusText;
    throw new ApiError(res.status, message, parsed);
  }

  // Success — unwrap if it looks like a true envelope, else return as-is.
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && isEnvelope(parsed)) {
    return (parsed as { data: T }).data;
  }
  return parsed as T;
}