import type { DeviceAlert } from "@/types/device.type";
import type { GpsReading } from "@/types/tracking.type";
import type { Notification } from "@/types/notification.type";
import type { IncidentReport } from "@/types/incident.type";
import type { AiPrediction } from "@/types/ai.type";

export type DashboardStatistics = {
  total_animals: number;
  active_animals: number;
  total_species: number;
  total_readings: number;
  total_incidents: number;
  critical_incidents: number;
  ai_generated_incidents: number;
  total_devices: number;
  active_devices: number;
  gps_devices: number;
  camera_devices: number;
  audio_devices: number;
  low_battery_devices: number;
  zone_entries: number;
  total_predictions: number;
  total_verified_predictions: number;
  average_confidence: number | string | null;
  identified_individuals: number;
  threat_detections: number;
  avg_temperature: number | string | null;
  avg_humidity: number | string | null;
  total_rainfall: number | string | null;
};

export type DashboardSummary = DashboardStatistics & {
  unread_notifications: number;
  device_alerts: DeviceAlert[];
  latest_threats: AiPrediction[];
  latest_incidents: IncidentReport[];
  latest_readings?: GpsReading[];
  latest_notifications?: Notification[];
};

export type DashboardSpeciesBreakdownItem = {
  species_id?: number;
  name?: string;
  common_name?: string;
  scientific_name?: string;
  count?: number;
  status?: string;
};

export type DashboardStats = {
  period_days: number;
  statistics: DashboardStatistics;
  species_breakdown: DashboardSpeciesBreakdownItem[];
  incidents_by_type: Record<string, number>;
  ai_insights: Record<string, unknown>;
};

export type DashboardChartPoint = { date: string; count: number };

export type DashboardCharts = {
  incidents: DashboardChartPoint[];
  readings: DashboardChartPoint[];
  ai_detections: DashboardChartPoint[];
  threats: DashboardChartPoint[];
};

export type DashboardRecentData = {
  latestReadings: GpsReading[];
  latestNotifications: Notification[];
};

export type DashboardPeriodParams = { period?: number };
