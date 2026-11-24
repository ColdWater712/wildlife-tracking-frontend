"use server";

import {
  ApiError,
  createServerApiClient,
  extractApiErrors,
  extractApiMessage,
  getLaravelApiBaseUrl,
  getPaginationMeta,
  readJsonResponse,
  resolveErrorKind,
} from "@/services/api";
import {
  clearAuthCookies,
  getAuthToken,
  setAuthCookies,
} from "@/services/cookie-token";
import { authenticateWithLaravel } from "@/services/laravel-auth.service";
import type {
  BackendActionPayload,
  BackendActionResult,
  LoginActionResult,
  LogoutActionResult,
} from "@/types/backend-action.type";
import type { TYPE_LOGIN_REQUEST } from "@/types/auth.type";

const normalizePath = (path: string): string =>
  path.replace(/^\/api\/backend(?=\/|$)/, "") || "/";

const unauthorizedResult = (): BackendActionResult => ({
  ok: false,
  status: 401,
  kind: resolveErrorKind(401),
  message: "Sesi tidak ditemukan. Silakan login kembali.",
  errors: null,
});

const encodeBytesToBase64 = (bytes: Uint8Array): string => {
  const chunkSize = 0x8000;
  let encoded = "";

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    let binary = "";
    const end = Math.min(offset + chunkSize, bytes.length);

    for (let index = offset; index < end; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }

    encoded += btoa(binary);
  }

  return encoded;
};

export const loginAction = async (
  payload: TYPE_LOGIN_REQUEST,
): Promise<LoginActionResult> => {
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";

  if (email.length === 0 || password.length === 0) {
    return {
      ok: false,
      status: 422,
      message: "Email dan kata sandi wajib diisi.",
      errors: {
        email: email.length === 0 ? ["Email wajib diisi"] : [],
        password: password.length === 0 ? ["Kata sandi wajib diisi"] : [],
      },
    };
  }

  try {
    const result = await authenticateWithLaravel({ email, password });

    if (!result.ok) {
      return {
        ok: false,
        status: result.status,
        message: result.message,
        errors: result.errors,
      };
    }

    await setAuthCookies(result.user, result.token);

    return {
      ok: true,
      message: "Login berhasil.",
      user: result.user,
    };
  } catch {
    return {
      ok: false,
      status: 503,
      message:
        "Tidak dapat menghubungi API backend. Pastikan server Laravel berjalan.",
      errors: null,
    };
  }
};

export const logoutAction = async (): Promise<LogoutActionResult> => {
  const token = await getAuthToken();
  let result: LogoutActionResult = { ok: true, message: "Logout berhasil." };

  if (token) {
    try {
      const serverApi = createServerApiClient(getLaravelApiBaseUrl());
      await serverApi.post("/logout", { token });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        result = {
          ok: false,
          status: 401,
          message: "Sesi telah berakhir. Silakan login kembali.",
        };
      } else if (error instanceof ApiError && error.status === 0) {
        result = {
          ok: false,
          status: 503,
          message:
            "Tidak dapat menghubungi API backend. Token lokal tetap dihapus.",
        };
      } else {
        result = {
          ok: false,
          status: error instanceof ApiError ? error.status : 503,
          message:
            "Gagal mencabut token di backend. Token lokal tetap dihapus.",
        };
      }
    }
  }

  await clearAuthCookies();

  return result;
};

export const forwardBackendAction = async (
  payload: BackendActionPayload,
): Promise<BackendActionResult> => {
  const token = await getAuthToken();

  if (!token) return unauthorizedResult();

  const contentType = payload.headers?.["Content-Type"];
  const headers: Record<string, string> =
    typeof contentType === "string" ? { "Content-Type": contentType } : {};

  try {
    const serverApi = createServerApiClient(getLaravelApiBaseUrl());
    const response = await serverApi.requestRaw(
      payload.method,
      normalizePath(payload.path),
      {
        params: payload.params,
        body: payload.body,
        bodyText: payload.bodyText,
        formData: payload.formData,
        headers,
        token,
        timeoutMs: payload.timeoutMs,
      },
    );

    if (response.status === 204) {
      return {
        ok: true,
        status: response.status,
        body: undefined,
        meta: getPaginationMeta(response.headers),
      };
    }

    const responseContentType = response.headers.get("content-type") ?? "";
    const isBinaryResponse =
      response.ok &&
      (responseContentType.includes("image/") ||
        responseContentType.includes("application/octet-stream"));

    if (isBinaryResponse) {
      const bytes = new Uint8Array(await response.arrayBuffer());

      return {
        ok: true,
        status: response.status,
        body: undefined,
        base64: encodeBytesToBase64(bytes),
        contentType: responseContentType,
        meta: getPaginationMeta(response.headers),
      };
    }

    const body = await readJsonResponse(response);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        kind: resolveErrorKind(response.status),
        message: extractApiMessage(
          body,
          `Permintaan gagal dengan status ${response.status}.`,
        ),
        errors: extractApiErrors(body),
      };
    }

    return {
      ok: true,
      status: response.status,
      body,
      meta: getPaginationMeta(response.headers),
    };
  } catch {
    return {
      ok: false,
      status: 503,
      kind: "network",
      message: "Tidak dapat menghubungi backend Laravel.",
      errors: null,
    };
  }
};
