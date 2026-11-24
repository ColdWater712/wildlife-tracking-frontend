import type { TYPE_SPECIES } from "@/types/species.type";

export type AiProcessingStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "unrecognized";

export type AiVerificationStatus = "pending" | "confirmed" | "rejected";
export type AiAnalysisType = "image" | "audio";
export type AiMediaType = "image" | "video" | "audio";
export type AiThreatLevel = "none" | "low" | "medium" | "high" | "critical";
export type AiPhysicalCondition =
  | "healthy"
  | "injured"
  | "sick"
  | "emaciated"
  | "unknown";
export type AiBehavior =
  | "foraging"
  | "resting"
  | "moving"
  | "running"
  | "drinking"
  | "social"
  | "parenting"
  | "mating"
  | "alert"
  | "aggressive"
  | "unknown";
export type AiSoundCategory =
  | "animal_call"
  | "gunshot"
  | "chainsaw"
  | "tree_falling"
  | "fire"
  | "engine"
  | "vehicle"
  | "human_voice"
  | "dog_bark"
  | "environment"
  | "unknown";

export type AiSpecies = Pick<
  TYPE_SPECIES,
  "species_id" | "common_name" | "scientific_name" | "conservation_status"
>;

export type AiAnimal = {
  animal_id: number;
  name_animal?: string;
  name?: string;
  species_id?: number;
};

export type AiVerifier = {
  user_id: number;
  username?: string;
  full_name?: string;
  name?: string;
};

export type AiZone = { zone_id: number; zone_name: string; zone_type?: string };
export type AiDevice = { device_id: number; model?: string; device_type?: string };

export type AiMediaUpload = {
  media_id: number;
  uploaded_by: number;
  report_id?: number | null;
  device_id?: number | null;
  zone_id?: number | null;
  media_type: AiMediaType;
  file_path: string;
  mime_type?: string | null;
  file_size?: number | string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  captured_at?: string | null;
  uploaded_at?: string | null;
  uploader?: AiVerifier | null;
  zone?: AiZone | null;
  device?: AiDevice | null;
  report?: {
    report_id: number;
    incident_type?: string;
    description?: string;
  } | null;
  predictions?: AiPrediction[];
};

export type AiDetectedObject = {
  label: string;
  score?: number | string | null;
  box?: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  } | null;
};

export type AiFace = {
  status: "staff" | "possible_staff" | "unknown" | string;
  label?: string;
  name?: string;
  user_id?: number | null;
  similarity?: number | string | null;
  bbox?: unknown;
  detection_confidence?: number | string | null;
  time_seconds?: number | string | null;
};

export type AiPrediction = {
  prediction_id: number;
  media_id: number;
  analysis_type: AiAnalysisType;
  predicted_species_id: number | null;
  confidence: number | string | null;
  detected_label?: string | null;
  individual_count?: number | null;
  predicted_animal_id?: number | null;
  animal_match_confidence?: number | string | null;
  animal_match_method?: string | null;
  physical_condition?: AiPhysicalCondition | null;
  condition_notes?: string | null;
  behavior?: AiBehavior | null;
  behavior_notes?: string | null;
  sound_category?: AiSoundCategory | null;
  sound_label?: string | null;
  threat_level?: AiThreatLevel | null;
  detected_objects?: AiDetectedObject[] | null;
  faces?: AiFace[] | null;
  staff_face_count?: number;
  unknown_face_count?: number;
  ai_summary?: string | null;
  raw_response?: unknown;
  model_version: string;
  processing_status: AiProcessingStatus;
  processed_at?: string | null;
  verification_status: AiVerificationStatus;
  verified_species_id?: number | null;
  verified_animal_id?: number | null;
  verified_by?: number | null;
  verified_at?: string | null;
  media?: AiMediaUpload | null;
  predictedSpecies?: AiSpecies | null;
  predictedAnimal?: AiAnimal | null;
  verifiedSpecies?: AiSpecies | null;
  verifiedAnimal?: AiAnimal | null;
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
  analysis_type?: AiAnalysisType;
  threat_level?: AiThreatLevel;
  physical_condition?: AiPhysicalCondition;
  behavior?: AiBehavior;
  sound_category?: AiSoundCategory;
  predicted_species_id?: number;
  predicted_animal_id?: number;
  verified_species_id?: number;
  device_id?: number;
  zone_id?: number;
  min_threat?: AiThreatLevel;
  min_confidence?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
};

export type AiMediaUploadListParams = {
  uploaded_by?: number;
  report_id?: number;
  device_id?: number;
  zone_id?: number;
  media_type?: AiMediaType;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
};

export type AiUploadPayload = {
  file: File;
  report_id?: number | null;
  device_id?: number | null;
  zone_id?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  captured_at?: string | null;
};

export type AiPredictionVerifyPayload = {
  verification_status: Extract<AiVerificationStatus, "confirmed" | "rejected">;
  verified_species_id?: number | null;
  verified_animal_id?: number | null;
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
  ai_insights?: Record<string, unknown>;
  ai_recap?: AiRecap | null;
  recommendations?: AiRecommendation[];
  generated_at?: string;
};

export type AiRecap = {
  period?: { start: string; end: string };
  totals?: Record<string, number | Record<string, number>>;
  species?: Array<Record<string, number | string | null>>;
  other_labels?: Record<string, number>;
  individuals?: Array<Record<string, number | string | string[] | null>>;
  faces?: Record<string, unknown>;
  sounds?: Array<Record<string, number | string>>;
  threats?: Record<string, unknown>;
  physical_conditions?: Record<string, number>;
  behaviors?: Record<string, number>;
  by_zone?: Array<Record<string, number | string>>;
  daily?: Array<Record<string, number | string>>;
  models?: string[];
};

export type AiHealth = {
  success: boolean;
  ai_service: {
    status: "not_configured" | "ok" | "error";
    message: string;
    models?: Record<string, string>;
  };
  audio_service: string | Record<string, unknown>;
  vision_service: string | Record<string, unknown>;
  queue: string;
  timestamp: string;
};

export type AiVocabulary = {
  physical_conditions: Record<string, string>;
  behaviors: Record<string, string>;
  sound_categories: string[];
  threat_levels: Record<string, string>;
  device_types: Record<string, string>;
};

export type AiDetectObjectsResult = {
  success: boolean;
  model: string;
  objects: AiDetectedObject[];
  object_count: number;
  species: AiSpecies | null;
  physical_condition: AiPhysicalCondition | null;
  behavior: AiBehavior | null;
  human_activity: Record<string, boolean | string>;
  summary: string | null;
};

export type AiThreatListParams = {
  min_level?: AiThreatLevel;
  analysis_type?: AiAnalysisType;
  start_date?: string;
  page?: number;
  per_page?: number;
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

export const AI_THREAT_LEVEL_LABELS: Record<AiThreatLevel, string> = {
  none: "Tidak Ada",
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  critical: "Kritis",
};

export const AI_PHYSICAL_CONDITION_LABELS: Record<
  AiPhysicalCondition,
  string
> = {
  healthy: "Sehat",
  injured: "Terluka",
  sick: "Sakit",
  emaciated: "Kurus",
  unknown: "Tidak Diketahui",
};

export const AI_BEHAVIOR_LABELS: Record<AiBehavior, string> = {
  foraging: "Mencari Makan",
  resting: "Istirahat",
  moving: "Bergerak",
  running: "Berlari",
  drinking: "Minum",
  social: "Sosial",
  parenting: "Merawat Anak",
  mating: "Kawin",
  alert: "Waspada",
  aggressive: "Agresif",
  unknown: "Tidak Diketahui",
};

export const AI_SOUND_CATEGORY_LABELS: Record<AiSoundCategory, string> = {
  animal_call: "Suara Satwa",
  gunshot: "Tembakan",
  chainsaw: "Gergaji Mesin",
  tree_falling: "Pohon Tumbang",
  fire: "Kebakaran",
  engine: "Mesin",
  vehicle: "Kendaraan",
  human_voice: "Suara Manusia",
  dog_bark: "Gonggongan Anjing",
  environment: "Lingkungan",
  unknown: "Tidak Diketahui",
};

export const AI_ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/wav",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/flac",
] as const;

export const AI_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const AI_DETECT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
