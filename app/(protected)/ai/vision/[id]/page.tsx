import { notFound } from "next/navigation";

import { getSessionUser } from "@/lib/session";
import { roleHasPermission } from "@/types/auth.type";

import AiPredictionDetailContent from "./index";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AiPredictionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const predictionId = Number(id);

  if (!Number.isFinite(predictionId) || predictionId <= 0) {
    notFound();
  }

  const user = await getSessionUser();

  return (
    <AiPredictionDetailContent
      canVerify={user ? roleHasPermission(user.role, "verify_ai") : false}
      canDelete={user ? roleHasPermission(user.role, "delete_data") : false}
    />
  );
}
