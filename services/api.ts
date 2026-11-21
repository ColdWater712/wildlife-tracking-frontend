import { forwardBackendAction } from "@/services/backend-actions";
import { resolveErrorKind } from "@/types/api.type";
import type { ApiErrorKind, ApiErrorState, ApiResponse } from "@/types/api.type";

export { resolveErrorKind };
export type { ApiErrorKind, ApiErrorState, ApiResponse };

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  body?: unknown;
  bodyText?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  token?: string;
  timeoutMs?: number;
};

export type ApiClientConfig = {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
};

const DEFAULT_TIMEOUT_MS = 10000;
const FALLBACK_BASE_URL = "http://127.0.0.1:8000/api";

export const getLaravelApiBaseUrl = (): string => {
  const configured =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    FALLBACK_BASE_URL;

  return configured.replace(/\/+$/, "");
};

const buildQuery = (params: RequestOptions["params"]): string => {
  if (!params) return "";

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      search.append(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
};

const buildUrl = (config: ApiClientConfig, path: string): string => {
  if (!config.baseUrl) return path;

  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${config.baseUrl}${suffix}`;
};

const resolveBody = (
  method: HttpMethod,
  options: RequestOptions,
): string | undefined => {
  if (method === "GET") return undefined;
  if (options.bodyText !== undefined) return options.bodyText;
  if (options.body === undefined) return undefined;
  return JSON.stringify(options.body);
};

export const readJsonResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text ? { message: text.slice(0, 300) } : null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const extractApiErrors = (
  body: unknown,
): Record<string, string[]> | null => {
  if (typeof body !== "object" || body === null || !("errors" in body)) {
    return null;
  }

  const errors = body.errors;

  if (typeof errors !== "object" || errors === null) return null;

  const normalized: Record<string, string[]> = {};

  for (const [field, messages] of Object.entries(errors)) {
    normalized[field] = Array.isArray(messages)
      ? messages.map((message) => String(message))
      : [String(messages)];
  }

  return normalized;
};

export const extractApiMessage = (body: unknown, fallback: string): string => {
  if (typeof body !== "object" || body === null) return fallback;
  if (!("message" in body)) return fallback;
  if (typeof body.message !== "string" || body.message.length === 0) {
    return fallback;
  }

  return body.message;
};

export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly errors: Record<string, string[]> | null;

  constructor(
    status: number,
    kind: ApiErrorKind,
    message: string,
    errors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;
    this.errors = errors;
  }
}

export const createApiClient = (config: ApiClientConfig = {}) => {
  const requestRaw = async (
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<Response> => {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...config.defaultHeaders,
        ...options.headers,
      };

      if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
      }

      return await fetch(
        `${buildUrl(config, path)}${buildQuery(options.params)}`,
        {
          method,
          signal: controller.signal,
          headers,
          body: resolveBody(method, options),
          cache: "no-store",
        },
      );
    } finally {
      clearTimeout(timer);
    }
  };

  const request = async <T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    try {
      const response = await requestRaw(method, path, options);

      if (response.status === 204) return undefined as T;

      const body = await readJsonResponse(response);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          resolveErrorKind(response.status),
          extractApiMessage(
            body,
            `Permintaan gagal dengan status ${response.status}.`,
          ),
          extractApiErrors(body),
        );
      }

      return body as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError(
          0,
          "network",
          `Permintaan ke ${path} melewati batas waktu ${options.timeoutMs ?? DEFAULT_TIMEOUT_MS}ms.`,
        );
      }

      throw new ApiError(
        0,
        "network",
        "Tidak dapat terhubung ke server. Pastikan API backend berjalan.",
      );
    }
  };

  return {
    request,
    requestRaw,
    get: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>("GET", path, options),
    post: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>("POST", path, options),
    put: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>("PUT", path, options),
    patch: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>("PATCH", path, options),
    delete: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>("DELETE", path, options),
  };
};

export type ApiClient = ReturnType<typeof createApiClient>;

export const createServerApiClient = (baseUrl: string): ApiClient =>
  createApiClient({ baseUrl });

type BackendActionResult = Awaited<ReturnType<typeof forwardBackendAction>>;

const runBackendAction = async (
  method: HttpMethod,
  path: string,
  options: RequestOptions,
): Promise<BackendActionResult> => {
  try {
    return await forwardBackendAction({
      method,
      path,
      params: options.params,
      body: options.body,
      bodyText: options.bodyText,
      headers: options.headers,
      timeoutMs: options.timeoutMs,
    });
  } catch {
    return {
      ok: false,
      status: 503,
      kind: "network",
      message: "Tidak dapat terhubung ke server aplikasi.",
      errors: null,
    };
  }
};

const toActionApiError = (result: Extract<BackendActionResult, { ok: false }>): ApiError =>
  new ApiError(result.status, result.kind, result.message, result.errors);

const createActionApiClient = (): ApiClient => {
  const request = async <T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    const result = await runBackendAction(method, path, options);

    if (!result.ok) throw toActionApiError(result);

    if (result.status === 204 || result.body === undefined) {
      return undefined as T;
    }

    return result.body as T;
  };

  const requestRaw = async (
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<Response> => {
    const result = await runBackendAction(method, path, options);

    if (!result.ok) throw toActionApiError(result);

    if (result.status === 204 || result.body === undefined) {
      return new Response(null, { status: result.status });
    }

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  };

  return {
    request,
    requestRaw,
    get: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>("GET", path, options),
    post: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>("POST", path, options),
    put: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>("PUT", path, options),
    patch: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>("PATCH", path, options),
    delete: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>("DELETE", path, options),
  };
};

export const api = createActionApiClient();

export const unwrapData = <T>(response: ApiResponse<T>): T => {
  if (!response || typeof response !== "object" || response.data === undefined) {
    throw new ApiError(0, "unknown", "Format respons API tidak dikenali.");
  }

  return response.data;
};

export const formatApiMessage = (
  message: string,
  errors: Record<string, string[]> | null,
  fallback: string,
): string => {
  const detail = Object.entries(errors ?? {})
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .filter((entry) => entry.trim() !== "")
    .join(" ");

  return [message, detail].filter((entry) => entry.trim() !== "").join(" ") || fallback;
};

export const toApiErrorState = (error: unknown): ApiErrorState => {
  if (error instanceof ApiError) {
    return {
      kind: error.kind,
      status: error.status,
      message: error.message,
      errors: error.errors,
    };
  }

  if (error instanceof Error) {
    return {
      kind: "unknown",
      status: 0,
      message: error.message,
      errors: null,
    };
  }

  return {
    kind: "unknown",
    status: 0,
    message: "Terjadi kesalahan yang tidak diketahui.",
    errors: null,
  };
};

export const formatApiError = (error: unknown, fallback: string): string => {
  const state = toApiErrorState(error);
  return formatApiMessage(state.message, state.errors, fallback);
};

export const getApiFieldErrors = (error: unknown): Record<string, string> => {
  const errors = toApiErrorState(error).errors ?? {};
  const fieldErrors: Record<string, string> = {};

  for (const [field, messages] of Object.entries(errors)) {
    const [firstMessage] = messages;
    if (firstMessage) fieldErrors[field] = firstMessage;
  }

  return fieldErrors;
};
