import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { AiPredictionImage } from "./ai-prediction-image";
import { AiPredictionVerification } from "./ai-prediction-verification";
import {
  AiConfidence,
  AiProcessingBadge,
  AiVerificationBadge,
} from "./ai-status";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/status";
import { formatDate } from "@/utils/format";
import type { AiPrediction } from "@/types/ai.type";

type AiPredictionResultProps = {
  prediction: AiPrediction;
  canVerify?: boolean;
  onVerified?: () => void;
  detailHref?: string;
};

const speciesName = (prediction: AiPrediction): string => {
  if (prediction.predictedSpecies?.common_name) {
    return prediction.predictedSpecies.common_name;
  }
  if (prediction.predicted_species_id !== null) {
    return `Spesies #${prediction.predicted_species_id}`;
  }
  return "Spesies tidak terdeteksi";
};

export function AiPredictionResult({
  prediction,
  canVerify = false,
  onVerified,
  detailHref,
}: AiPredictionResultProps) {
  return (
    <Panel className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-ink">Hasil Analisis AI</h3>
          <p className="mt-1 text-xs text-muted">
            Model {prediction.model_version} · Prediksi #{prediction.prediction_id}
          </p>
        </div>
        <StatusBadge label="Dihasilkan AI" variant="info" />
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <AiPredictionImage
          mediaId={prediction.media_id}
          alt={`Gambar prediksi AI #${prediction.prediction_id}`}
          className="aspect-[4/3] w-full"
          sizes="(max-width: 768px) 100vw, 288px"
        />

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <AiProcessingBadge status={prediction.processing_status} />
            <AiVerificationBadge status={prediction.verification_status} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Spesies Terprediksi
            </p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {speciesName(prediction)}
            </p>
            {prediction.predictedSpecies?.scientific_name ? (
              <p className="text-sm italic text-ink-soft">
                {prediction.predictedSpecies.scientific_name}
              </p>
            ) : null}
          </div>

          <AiConfidence value={prediction.confidence} className="max-w-md" />

          <div className="grid gap-3 text-xs text-muted sm:grid-cols-2">
            <div>
              <p className="font-semibold text-ink-soft">Diproses</p>
              <p>{formatDate(prediction.processed_at)}</p>
            </div>
            <div>
              <p className="font-semibold text-ink-soft">Status Verifikasi</p>
              <p>
                {prediction.verifiedSpecies?.common_name ??
                  (prediction.verification_status === "pending"
                    ? "Belum diverifikasi"
                    : "Spesies verifikasi tidak tersedia")}
              </p>
            </div>
          </div>

          {detailHref ? (
            <Link
              href={detailHref}
              className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              <Sparkles aria-hidden="true" className="size-3.5" />
              Lihat detail prediksi
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      {canVerify && prediction.verification_status === "pending" ? (
        <div className="border-t border-line pt-4">
          <p className="mb-3 text-sm font-semibold text-ink">Verifikasi Manusia</p>
          <AiPredictionVerification
            predictionId={prediction.prediction_id}
            defaultSpeciesId={prediction.predicted_species_id}
            onVerified={onVerified}
          />
        </div>
      ) : null}
    </Panel>
  );
}
