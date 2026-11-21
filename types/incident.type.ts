export type IncidentSyncStatus = "pending_sync" | "synced" | "failed";

export type IncidentReport = {
  report_id: number;
  user_id?: number | null;
  reported_by?: number | null;
  incident_type: string;
  description: string;
  timestamp: string;
  latitude: number | string | null;
  longitude: number | string | null;
  location: string | null;
  animal_id?: number | null;
  species_id?: number | null;
  status?: string;
  sync_status: IncidentSyncStatus;
  animal_code?: string | null;
  photo_url?: string | null;
  animal?: {
    animal_id: number;
    name?: string;
    animal_code?: string;
  } | null;
  species?: {
    species_id: number;
    common_name?: string;
  } | null;
};

export type IncidentReportListParams = {
  incidentType?: string;
  syncStatus?: IncidentSyncStatus;
};
