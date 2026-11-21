export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
};

export type ApiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "validation"
  | "not_found"
  | "client"
  | "server"
  | "network"
  | "unknown";

export type ApiErrorState = {
  kind: ApiErrorKind;
  status: number;
  message: string;
  errors: Record<string, string[]> | null;
};

export const resolveErrorKind = (status: number): ApiErrorKind => {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 422) return "validation";
  if (status === 400 || status === 409) return "client";
  if (status >= 500) return "server";
  return "unknown";
};
