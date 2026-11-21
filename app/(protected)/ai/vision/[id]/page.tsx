import { notFound } from "next/navigation";

import { AiPredictionDetailView } from "@/components/shared/ai/ai-prediction-detail-view";
import { getSessionUser } from "@/lib/session";

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
    <AiPredictionDetailView
      predictionId={predictionId}
      canVerify={user?.role === "peneliti_ekologi"}
    />
  );
}
