import type { DeviceAlert } from "@/types/device.type";
import type { GpsReading } from "@/types/tracking.type";
import type { Notification } from "@/types/notification.type";
import type { IncidentReport } from "@/types/incident.type";

export type DashboardSummary = {
  totalAnimals: number;
  activeAnimals: number;
  totalSpecies: number;
  totalDevices: number;
  lowBatteryDevices: number;
  deviceAlerts: DeviceAlert[];
  totalReadings: number;
  latestReadings: GpsReading[];
  latestNotifications: Notification[];
  latestIncidentReports: IncidentReport[];
  degradedSources: string[];
};