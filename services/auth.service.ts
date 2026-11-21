import { loginAction, logoutAction } from "@/services/backend-actions";
import type { LogoutActionResult } from "@/types/backend-action.type";
import type { LoginAttempt, TYPE_LOGIN_REQUEST } from "@/types/auth.type";

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
