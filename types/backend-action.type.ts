import type { ApiErrorKind } from "@/types/api.type";
import type { TYPE_LOGIN_SESSION_USER } from "@/types/auth.type";

export type BackendActionMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type BackendActionPayload = {
  method: BackendActionMethod;
  path: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  bodyText?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export type BackendActionResult =
  | { ok: true; status: number; body: unknown }
  | {
      ok: false;
      status: number;
      kind: ApiErrorKind;
      message: string;
      errors: Record<string, string[]> | null;
    };

export type LoginActionResult =
  | { ok: true; message: string; user: TYPE_LOGIN_SESSION_USER }
  | {
      ok: false;
      status: number;
      message: string;
      errors: Record<string, string[]> | null;
    };

export type LogoutActionResult =
  | { ok: true; message: string }
  | {
      ok: false;
      status: number;
      message: string;
    };
