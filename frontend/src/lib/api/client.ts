
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://astride-safari-discover.ngrok-free.dev";

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
  multipart?: boolean;
  headers?: Record<string, string>;
}

/**
 * Decides whether a parsed response is an envelope wrapper like
 *   { message: "...", data: [...] }
 * (which we want to unwrap) vs a real entity that just happens to have
 * a `data` field as part of its own schema.
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
 * Unwrap a Spring Boot `Page<T>` response to its `content` array.
 *
 * Spring's Page<T> looks like:
 *   { content: T[], pageable: {...}, totalPages, totalElements,
 *     last, first, number, numberOfElements, size, empty, sort }
 *
 * If the response is already a plain array, returns it unchanged. If it's
 * a Page<T>, returns just the content. Otherwise returns an empty array
 * so callers can safely use `.find/.filter` without crashing.
 *
 * Use this in any API method that talks to a paginated list endpoint.
 */
export function unwrapPage<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (
    raw &&
    typeof raw === "object" &&
    "content" in raw &&
    Array.isArray((raw as { content?: unknown }).content)
  ) {
    return (raw as { content: T[] }).content;
  }
  return [];
}

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

  const contentType = res.headers.get("content-type") ?? "";
  let parsed: unknown = null;
  if (contentType.includes("application/json")) {
    parsed = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => "");
    parsed = text;
  }

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message?: unknown }).message ?? "")
        : "") || res.statusText;
    throw new ApiError(res.status, message, parsed);
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && isEnvelope(parsed)) {
    return (parsed as { data: T }).data;
  }
  return parsed as T;
}