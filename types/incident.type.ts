export type IncidentSyncStatus = "pending_sync" | "synced" | "failed";
export type IncidentSource = "manual" | "ai" | string;

export type IncidentReporter = {
  user_id: number;
  username?: string;
  full_name?: string;
  email?: string;
};

export type IncidentZone = {
  zone_id: number;
  zone_name: string;
  zone_type?: string;
};

export type IncidentMedia = {
  media_id: number;
  media_type?: string;
  file_path?: string;
  captured_at?: string | null;
  uploaded_at?: string | null;
  predictions?: unknown[];
};

export type IncidentReport = {
  report_id: number;
  user_id: number | null;
  reported_by: number | null;
  incident_type: string;
  description: string;
  timestamp: string;
  latitude: number | string | null;
  longitude: number | string | null;
  location: string | null;
  animal_id: number | null;
  species_id: number | null;
  zone_id: number | null;
  photo_url: string | null;
  status: string;
  sync_status: IncidentSyncStatus;
  source: IncidentSource;
  animal_code?: string | null;
  reporter?: IncidentReporter | null;
  animal?: {
    animal_id: number;
    name_animal?: string;
    name?: string;
    animal_code?: string;
  } | null;
  species?: {
    species_id: number;
    common_name?: string;
  } | null;
  zone?: IncidentZone | null;
  media?: IncidentMedia[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type IncidentReportListParams = {
  incidentType?: string;
  syncStatus?: IncidentSyncStatus;
  incident_type?: string;
  status?: string;
  sync_status?: IncidentSyncStatus;
  source?: string;
  animal_id?: number;
  species_id?: number;
  zone_id?: number;
  user_id?: number;
  reported_by?: number;
  animal_code?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
};

export type CreateIncidentReportPayload = {
  incident_type: string;
  description: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  location?: string | null;
  animal_id?: number | null;
  species_id?: number | null;
  zone_id?: number | null;
  photo_url?: string | null;
  status?: string;
};

export type UpdateIncidentReportPayload =
  Partial<CreateIncidentReportPayload>;

export type ApiIncidentReport = {
  report_id: number;
  user_id?: number | null;
  reported_by?: number | null;
  incident_type: string;
  description: string;
  timestamp: string;
  latitude: number | string | null;
  longitude: number | string | null;
  location?: string | null;
  animal_id?: number | null;
  species_id?: number | null;
  zone_id?: number | null;
  photo_url?: string | null;
  status?: string;
  sync_status?: string;
  source?: string;
  animal?: {
    animal_id: number;
    name_animal?: string;
    name?: string;
    animal_code?: string;
  } | null;
  species?: {
    species_id: number;
    common_name?: string;
  } | null;
  zone?: IncidentZone | null;
  reporter?: IncidentReporter | null;
  media?: IncidentMedia[];
  created_at?: string | null;
  updated_at?: string | null;
};

export const INCIDENT_TYPES = [
  "konflik",
  "perambahan",
  "perburuan",
  "observasi",
  "device_alert",
] as const;

export const INCIDENT_TYPE_LABELS: Record<(typeof INCIDENT_TYPES)[number], string> = {
  konflik: "Konflik Satwa",
  perambahan: "Perambahan",
  perburuan: "Perburuan",
  observasi: "Observasi",
  device_alert: "Alert Perangkat",
};

export const INCIDENT_STATUSES = [
  "pending",
  "investigating",
  "resolved",
  "dismissed",
] as const;

export const INCIDENT_STATUS_LABELS: Record<(typeof INCIDENT_STATUSES)[number], string> = {
  pending: "Menunggu",
  investigating: "Diselidiki",
  resolved: "Selesai",
  dismissed: "Ditolak",
};
