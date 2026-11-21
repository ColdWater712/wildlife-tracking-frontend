import { redirect } from "next/navigation";

import { AiPendingVerificationView } from "@/components/shared/ai/ai-pending-verification-view";
import { getSessionUser } from "@/lib/session";

export default async function AiPendingVerificationPage() {
  const user = await getSessionUser();

  if (user?.role !== "peneliti_ekologi") {
    redirect("/ai/vision");
  }

  return <AiPendingVerificationView />;
}
