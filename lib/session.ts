import { cookies } from "next/headers";

import { SESSION_COOKIE, TOKEN_COOKIE } from "@/lib/cookie-names";
import {
  normalizeUserRole,
  ROLE_PERMISSIONS,
} from "@/types/auth.type";
import type { AppPermission, TYPE_USER_ROLE } from "@/types/auth.type";

export { SESSION_COOKIE };

export type SessionUser = {
  user_id: number;
  name: string;
  email: string;
  role: TYPE_USER_ROLE;
  permissions: AppPermission[];
};

const readString = (record: Record<string, unknown>, key: string): string => {
  const value = record[key];

  return typeof value === "string" ? value : "";
};

const readNumber = (record: Record<string, unknown>, key: string): number => {
  const value = record[key];

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

export const getSessionCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
};

export const getAuthTokenCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies();

  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
};

export const getSessionUser = async (): Promise<SessionUser | null> => {
  const raw = await getSessionCookie();

  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) return null;

    const record = parsed as Record<string, unknown>;
    const role = normalizeUserRole(record.role);
    const user_id = readNumber(record, "user_id");
    const name = readString(record, "name").trim();
    const email = readString(record, "email").trim();

    if (user_id <= 0 || name === "" || email === "" || role === null) {
      return null;
    }

    const allowed = new Set<AppPermission>(ROLE_PERMISSIONS[role]);
    const storedPermissions = Array.isArray(record.permissions)
      ? record.permissions.filter(
          (item): item is AppPermission =>
            typeof item === "string" && allowed.has(item as AppPermission),
        )
      : [];

    return {
      user_id,
      name,
      email,
      role,
      permissions: [...new Set(storedPermissions)],
    };
  } catch {
    return null;
  }
};
