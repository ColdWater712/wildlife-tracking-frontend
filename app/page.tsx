import { redirect } from "next/navigation";

import { getDefaultRouteForRole } from "@/lib/navigation";
import { getVerifiedSession } from "@/services/session.service";

export default async function RootPage() {
  const session = await getVerifiedSession();

  redirect(session.ok ? getDefaultRouteForRole(session.user.role) : "/login");
}
