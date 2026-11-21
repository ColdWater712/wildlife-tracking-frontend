import "server-only";

import { cookies } from "next/headers";

import {
  EXPIRES_AT_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  TOKEN_COOKIE,
  TYPE_COOKIE,
} from "@/lib/cookie-names";
import type { TYPE_LOGIN_SESSION_USER } from "@/types/auth.type";

export const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
};

export const setAuthCookies = async (
  sessionUser: TYPE_LOGIN_SESSION_USER,
  token: string,
): Promise<void> => {
  const cookieStore = await cookies();
  const isSecure = process.env.NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE, JSON.stringify(sessionUser), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

export const clearAuthCookies = async (): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(EXPIRES_AT_COOKIE);
  cookieStore.delete(TYPE_COOKIE);
};
