import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/session";
import { roleHasPermission } from "@/types/auth.type";

import AiPendingVerificationContent from "./index";

export default async function AiPendingVerificationPage() {
  const user = await getSessionUser();

  if (!user || !roleHasPermission(user.role, "verify_ai")) {
    redirect("/ai/vision");
  }

  return <AiPendingVerificationContent />;
}
