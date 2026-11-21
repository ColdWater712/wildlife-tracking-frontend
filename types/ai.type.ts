import type { TYPE_SPECIES } from "@/types/species.type";

export type AiProcessingStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "unrecognized";

export type AiVerificationStatus = "pending" | "confirmed" | "rejected";

export type AiSpecies = Pick<
  TYPE_SPECIES,
  "species_id" | "common_name" | "scientific_name" | "conservation_status"
>;

export type AiVerifier = {
  user_id: number;
  username?: string;
  full_name?: string;
  name?: string;
};

export type AiMediaUpload = {
  media_id: number;
  uploaded_by: number;
  report_id?: number | null;
  media_type: "image" | "video";
  file_path: string;
  uploaded_at?: string | null;
  uploader?: AiVerifier | null;
  report?: {
    report_id: number;
    incident_type?: string;
    description?: string;
  } | null;
};

export type AiPrediction = {
  prediction_id: number;
  media_id: number;
  predicted_species_id: number | null;
  confidence: number | string | null;
  model_version: string;
  processing_status: AiProcessingStatus;
  processed_at?: string | null;
  verification_status: AiVerificationStatus;
  verified_species_id?: number | null;
  verified_by?: number | null;
  verified_at?: string | null;
  media?: AiMediaUpload | null;
  predictedSpecies?: AiSpecies | null;
  verifiedSpecies?: AiSpecies | null;
  verifier?: AiVerifier | null;
};

export type AiPredictionUploadResult = {
  media: AiMediaUpload;
  prediction: AiPrediction;
};

export type AiPredictionListParams = {
  media_id?: number;
  processing_status?: AiProcessingStatus | "all";
  verification_status?: AiVerificationStatus | "all";
  model_version?: string;
  predicted_species_id?: number;
  min_confidence?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
};

export type AiPredictionVerifyPayload = {
  verification_status: Extract<
    AiVerificationStatus,
    "confirmed" | "rejected"
  >;
  verified_species_id: number;
};

export type AiSummaryReportParams = {
  start_date?: string;
  end_date?: string;
};

export type AiSummaryStatistics = {
  total_animals?: number;
  total_species?: number;
  total_readings?: number;
  total_incidents?: number;
  total_predictions?: number;
  total_verified_predictions?: number;
  average_confidence?: number | string | null;
  active_devices?: number;
  [key: string]: number | string | null | undefined;
};

export type AiSpeciesBreakdownItem = {
  species_id?: number;
  name?: string;
  common_name?: string;
  scientific_name?: string;
  count?: number;
  total?: number;
  status?: string;
  percentage?: number | string | null;
  [key: string]: number | string | null | undefined;
};

export type AiRecommendation = {
  priority: "high" | "critical" | "medium" | "low" | string;
  icon?: string;
  title: string;
  message: string;
};

export type AiSummaryReport = {
  success: boolean;
  period: {
    start: string;
    end: string;
  };
  summary: string;
  used_ai: boolean;
  statistics: AiSummaryStatistics;
  species_breakdown: AiSpeciesBreakdownItem[];
  incidents_by_type?: Record<string, number>;
  recommendations?: AiRecommendation[];
  generated_at?: string;
};

export const AI_PROCESSING_STATUS_LABELS: Record<
  AiProcessingStatus,
  string
> = {
  queued: "Antrean",
  processing: "Diproses",
  completed: "Selesai",
  failed: "Gagal",
  unrecognized: "Tidak Dikenali",
};

export const AI_VERIFICATION_STATUS_LABELS: Record<
  AiVerificationStatus,
  string
> = {
  pending: "Menunggu Verifikasi",
  confirmed: "Terkonfirmasi",
  rejected: "Ditolak",
};

export const AI_ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const AI_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
