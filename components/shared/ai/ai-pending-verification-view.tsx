"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import { AiPredictionImage } from "@/components/shared/ai/ai-prediction-image";
import {
  AiConfidence,
  AiProcessingBadge,
  AiVerificationBadge,
} from "@/components/shared/ai/ai-status";
import { AiPredictionVerification } from "@/components/shared/ai/ai-prediction-verification";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAiPendingPredictions } from "@/hooks/use-ai";
import { toApiErrorState } from "@/services/api";
import { formatDate } from "@/utils/format";

export function AiPendingVerificationView() {
  const pendingQuery = useAiPendingPredictions();
  const predictions = pendingQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Vision"
        title="Antrean Verifikasi AI"
        description="Tinjau prediksi AI yang masih menunggu keputusan peneliti. Prediksi bersifat advisory."
      />

      {pendingQuery.isPending ? (
        <Loading label="Memuat antrean verifikasi..." />
      ) : pendingQuery.isError ? (
        <ErrorState
          kind={toApiErrorState(pendingQuery.error).kind}
          message={toApiErrorState(pendingQuery.error).message}
          status={toApiErrorState(pendingQuery.error).status}
          errors={toApiErrorState(pendingQuery.error).errors}
          onRetry={() => void pendingQuery.refetch()}
        />
      ) : predictions.length === 0 ? (
        <EmptyState
          title="Tidak ada prediksi menunggu verifikasi"
          description="Semua prediksi AI sudah memiliki status verifikasi."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {predictions.map((prediction) => (
            <article key={prediction.prediction_id} className="ui-panel flex flex-col gap-4 p-4">
              <div className="flex items-start gap-3">
                <AiPredictionImage
                  mediaId={prediction.media_id}
                  alt={`Gambar prediksi #${prediction.prediction_id}`}
                  className="size-24 shrink-0"
                  sizes="96px"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    <AiProcessingBadge status={prediction.processing_status} />
                    <AiVerificationBadge status={prediction.verification_status} />
                    <StatusBadge label="Dihasilkan AI" variant="info" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {prediction.predictedSpecies?.common_name ??
                      (prediction.predicted_species_id !== null
                        ? `Spesies #${prediction.predicted_species_id}`
                        : "Spesies tidak terdeteksi")}
                  </p>
                  <p className="text-xs text-muted">
                    #{prediction.prediction_id} · {formatDate(prediction.processed_at)}
                  </p>
                </div>
              </div>

              <AiConfidence value={prediction.confidence} />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <Link
                  href={`/ai/vision/${prediction.prediction_id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
                >
                  <Eye aria-hidden="true" className="size-3.5" />
                  Lihat detail
                </Link>
              </div>

              <AiPredictionVerification
                predictionId={prediction.prediction_id}
                defaultSpeciesId={prediction.predicted_species_id}
                onVerified={() => void pendingQuery.refetch()}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
