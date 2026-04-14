/**
 * 백엔드 API와의 통신을 담당하는 통합 클라이언트입니다.
 * 자동 인증 토큰 주입, URL 정규화 및 에러 핸들링 기능을 포함합니다.
 */
type RequestOptions = {
  token?: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
};

type ApiRequestTrace = {
  requestId: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  url: string;
  startedAt: string;
  durationMs: number;
  status: number;
  ok: boolean;
  serverRequestId: string | null;
  serverProcessTimeMs: number | null;
  serverTiming: string | null;
  networkError: string | null;
};

declare global {
  interface Window {
    __TL_API_TRACES__?: ApiRequestTrace[];
  }
}

const TRACE_LIMIT = 200;

function createRequestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function markTraceStart(requestId: string) {
  if (typeof performance === "undefined") return;
  try {
    performance.mark(`tl:api:${requestId}:start`);
  } catch {
    // no-op
  }
}

function markTraceEndAndMeasure(requestId: string) {
  if (typeof performance === "undefined") return;
  try {
    const startMark = `tl:api:${requestId}:start`;
    const endMark = `tl:api:${requestId}:end`;
    const measureName = `tl:api:${requestId}:duration`;
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
  } catch {
    // no-op
  }
}

function pushTrace(trace: ApiRequestTrace) {
  if (typeof window === "undefined") return;
  const current = window.__TL_API_TRACES__ ?? [];
  current.push(trace);
  if (current.length > TRACE_LIMIT) {
    current.splice(0, current.length - TRACE_LIMIT);
  }
  window.__TL_API_TRACES__ = current;
}

function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "";

  let trimmed = raw.trim().replace(/\/+$/, "");

  // CRITICAL: Enforce HTTPS to prevent Mixed Content errors in production
  // Skip HTTPS conversion for localhost to allow local development
  const isLocalhost = trimmed.includes("localhost") || trimmed.includes("127.0.0.1");
  if (trimmed.startsWith("http://") && !isLocalhost) {
    trimmed = `https://${trimmed.slice("http://".length)}`;
    console.warn(`[API] Forced HTTP → HTTPS: ${trimmed}`);
  }

  return trimmed;
}

const API_PREFIX = "/api/v1";

function buildUrl(path: string): string {
  const apiBaseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const hasPrefix = normalizedPath.startsWith(API_PREFIX);
  const finalPath = hasPrefix ? normalizedPath : `${API_PREFIX}${normalizedPath}`;
  const base = apiBaseUrl.endsWith(API_PREFIX)
    ? apiBaseUrl.slice(0, -API_PREFIX.length)
    : apiBaseUrl;
  return `${base}${finalPath}`;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is required. Set your backend base URL (e.g. https://api.example.com)."
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const requestId =
    headers["x-request-id"] ||
    headers["X-Request-ID"] ||
    createRequestId();
  headers["x-request-id"] = requestId;
  delete headers["X-Request-ID"];

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const url = buildUrl(path);
  const startedAt = new Date().toISOString();
  const startedPerf = typeof performance !== "undefined" ? performance.now() : Date.now();
  markTraceStart(requestId);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      credentials: options.credentials ?? "include",
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const endedPerf = typeof performance !== "undefined" ? performance.now() : Date.now();
    const durationMs = Math.round(endedPerf - startedPerf);
    markTraceEndAndMeasure(requestId);
    const networkError = err instanceof Error ? err.message : String(err);
    pushTrace({
      requestId,
      method,
      path,
      url,
      startedAt,
      durationMs,
      status: 0,
      ok: false,
      serverRequestId: null,
      serverProcessTimeMs: null,
      serverTiming: null,
      networkError,
    });
    throw new Error(`[request_id=${requestId}] ${networkError}`);
  }

  const endedPerf = typeof performance !== "undefined" ? performance.now() : Date.now();
  const durationMs = Math.round(endedPerf - startedPerf);
  const serverRequestId = res.headers.get("x-request-id");
  const serverProcessTimeRaw = res.headers.get("x-process-time-ms");
  const serverProcessTimeMs =
    serverProcessTimeRaw && Number.isFinite(Number(serverProcessTimeRaw))
      ? Number(serverProcessTimeRaw)
      : null;
  const serverTiming = res.headers.get("server-timing");

  markTraceEndAndMeasure(requestId);
  pushTrace({
    requestId,
    method,
    path,
    url,
    startedAt,
    durationMs,
    status: res.status,
    ok: res.ok,
    serverRequestId,
    serverProcessTimeMs,
    serverTiming,
    networkError: null,
  });

  if (!res.ok) {
    const text = await res.text();
    const linkedRequestId = serverRequestId || requestId;
    throw new Error(`[request_id=${linkedRequestId}] ${text || `HTTP ${res.status}`}`);
  }

  // Handle 204 No Content (empty response from DELETE)
  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>("GET", path, undefined, options);
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>("POST", path, body, options);
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>("PUT", path, body, options);
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>("PATCH", path, body, options);
  },
  delete<T>(path: string, options?: RequestOptions) {
    return request<T>("DELETE", path, undefined, options);
  },
};
