import "server-only";

import { getAuthTokenCookie, getSessionUser } from "@/lib/session";
import { getCurrentUserFromLaravel } from "@/services/laravel-auth.service";
import type { VerifiedSessionResult } from "@/types/auth.type";

export const getVerifiedSession = async (): Promise<VerifiedSessionResult> => {
  const session = await getSessionUser();

  if (session === null) {
    return {
      ok: false,
      reason: "missing_session",
      status: 401,
      message: "Sesi tidak ditemukan. Silakan login terlebih dahulu.",
    };
  }

  const token = await getAuthTokenCookie();

  if (token === null || token.trim() === "") {
    return {
      ok: false,
      reason: "missing_session",
      status: 401,
      message: "Token autentikasi tidak ditemukan. Silakan login kembali.",
    };
  }

  const result = await getCurrentUserFromLaravel(token);

  if (result.ok) {
    return { ok: true, user: result.user };
  }

  if (result.status === 401) {
    return {
      ok: false,
      reason: "expired",
      status: 401,
      message: "Sesi Anda telah berakhir. Silakan login kembali.",
    };
  }

  if (result.status === 0 || result.status >= 500) {
    return {
      ok: false,
      reason: "backend",
      status: result.status,
      message: result.message,
    };
  }

  return {
    ok: false,
    reason: "invalid_user",
    status: result.status,
    message: result.message,
  };
};
