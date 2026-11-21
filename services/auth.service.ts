import { loginAction, logoutAction } from "@/services/backend-actions";
import type { LogoutActionResult } from "@/types/backend-action.type";
import type {
  TYPE_LOGIN_REQUEST,
  TYPE_LOGIN_SESSION_USER,
} from "@/types/auth.type";

export type LoginAttempt =
  | {
      ok: true;
      status: number;
      message: string;
      errors: null;
      user: TYPE_LOGIN_SESSION_USER;
    }
  | {
      ok: false;
      status: number;
      message: string;
      errors: Record<string, string[]> | null;
      user: null;
    };

export const loginRequest = async (
  payload: TYPE_LOGIN_REQUEST,
): Promise<LoginAttempt> => {
  const result = await loginAction(payload);

  if (result.ok) {
    return {
      ok: true,
      status: 200,
      message: result.message,
      errors: null,
      user: result.user,
    };
  }

  return {
    ok: false,
    status: result.status,
    message: result.message,
    errors: result.errors,
    user: null,
  };
};

export const logoutRequest = async (): Promise<LogoutActionResult> =>
  logoutAction();
