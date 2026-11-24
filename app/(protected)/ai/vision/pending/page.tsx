import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/session";

import AiPendingVerificationContent from "./index";

export default async function AiPendingVerificationPage() {
  const user = await getSessionUser();

  if (user?.role !== "peneliti_ekologi") {
    redirect("/ai/vision");
  }

  return <AiPendingVerificationContent />;
}
