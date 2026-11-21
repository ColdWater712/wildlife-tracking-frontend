import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { getVerifiedSession } from "@/services/session.service";

type LoginPageProps = {
  searchParams: Promise<{ reason?: string | string[] }>;
};

const LOGIN_NOTICES: Record<string, string> = {
  expired: "Sesi Anda telah berakhir. Silakan login kembali.",
  invalid_user: "Data pengguna tidak valid. Silakan login kembali.",
  backend: "Tidak dapat memverifikasi sesi dengan backend. Silakan coba lagi.",
  unauthorized: "Anda tidak memiliki akses ke halaman tersebut.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const rawReason = params.reason;
  const reason = Array.isArray(rawReason) ? rawReason[0] : rawReason;
  const session = await getVerifiedSession();

  if (session.ok && (reason === undefined || reason === "")) {
    redirect(getDefaultRouteForRole(session.user.role));
  }

  return <LoginForm notice={LOGIN_NOTICES[reason ?? ""]} />;
}
