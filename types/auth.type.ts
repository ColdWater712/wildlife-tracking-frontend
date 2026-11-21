import { TYPE_META_PAGGINATION } from "@/types/meta.type";

export type TYPE_USER_ROLE =
  | "konservasionis_lapangan"
  | "peneliti_ekologi"
  | "administrator_sistem"
  | "pengambil_kebijakan";

export const USER_ROLES = [
  "konservasionis_lapangan",
  "peneliti_ekologi",
  "administrator_sistem",
  "pengambil_kebijakan",
] as const satisfies readonly TYPE_USER_ROLE[];

export const normalizeUserRole = (value: unknown): TYPE_USER_ROLE | null => {
  if (typeof value !== "string") return null;

  const candidate = value.trim();

  return USER_ROLES.includes(candidate as TYPE_USER_ROLE)
    ? (candidate as TYPE_USER_ROLE)
    : null;
};

export type TYPE_USER = {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  role: TYPE_USER_ROLE;
  created_at: string;
};

export type TYPE_USER_PAYLOAD = {
  username: string;
  full_name: string;
  email: string;
  password: string;
  role: TYPE_USER_ROLE;
};

export type TYPE_USER_GET_ALL_RESPONSE = {
  items: TYPE_USER[];
  meta: TYPE_META_PAGGINATION;
};

export type TYPE_USER_GET_BY_ID_RESPONSE = {
  items: TYPE_USER;
  meta: null;
};

export const TYPE_ROLE_LABELS: Record<TYPE_USER_ROLE, string> = {
  konservasionis_lapangan: "Konservasionis Lapangan",
  peneliti_ekologi: "Peneliti Ekologi",
  administrator_sistem: "Administrator Sistem",
  pengambil_kebijakan: "Pengambil Kebijakan",
};

export type TYPE_LOGIN_PAYLOAD = {
  username: string;
  password: string;
};

export type TYPE_LOGIN_REQUEST = {
  email: string;
  password: string;
};

export type TYPE_LOGIN_SESSION_USER = {
  user_id: number;
  username: string;
  name: string;
  email: string;
  role: TYPE_USER_ROLE;
};

export type TYPE_LOGIN_RESULT = {
  token: string;
  expires_at: string;
  type: string;
};

export type TYPE_LOGIN_RESPONSE_DATA = {
  token: string;
  user: TYPE_USER;
};

export type TYPE_BACKEND_ROLE = {
  role_id: number;
  role_name: string;
  description?: string | null;
  created_at?: string | null;
};

export type TYPE_BACKEND_LOGIN_USER = {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  status: string;
  role: TYPE_BACKEND_ROLE | null;
};

export type TYPE_BACKEND_LOGIN_DATA = {
  user: TYPE_BACKEND_LOGIN_USER;
  token: string;
};

export type TYPE_BACKEND_LOGIN_RESPONSE = {
  success: boolean;
  message: string;
  data: TYPE_BACKEND_LOGIN_DATA;
  errors?: Record<string, string[]> | null;
};

export type TYPE_BACKEND_ME_USER = Omit<TYPE_BACKEND_LOGIN_USER, "role"> & {
  role: TYPE_BACKEND_ROLE | null;
  permissions?: unknown;
};

export type TYPE_BACKEND_ME_RESPONSE = {
  success: boolean;
  message: string;
  data: TYPE_BACKEND_ME_USER;
  errors?: Record<string, string[]> | null;
};
