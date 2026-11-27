"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardRecentData,
  getDashboardSummary,
} from "@/services/dashboard.service";
import type { ApiResponse } from "@/types/api.type";
import type {
  DashboardCharts,
  DashboardStats,
  DashboardSummary,
  DashboardPeriodParams,
} from "@/types/dashboard.type";
import type { GpsReading } from "@/types/tracking.type";
import type { Notification } from "@/types/notification.type";
import type { IncidentReport } from "@/types/incident.type";
import type { DeviceAlert } from "@/types/device.type";
import { getDashboardCharts, getDashboardStats } from "@/services/dashboard.service";

export type DashboardSummaryView = DashboardSummary & {
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

const toView = (
  summary: DashboardSummary,
  recent: Awaited<ReturnType<typeof getDashboardRecentData>>["data"],
): DashboardSummaryView => ({
  ...summary,
  totalAnimals: summary.total_animals,
  activeAnimals: summary.active_animals,
  totalSpecies: summary.total_species,
  totalDevices: summary.total_devices,
  lowBatteryDevices: summary.low_battery_devices,
  deviceAlerts: summary.device_alerts ?? [],
  totalReadings: summary.total_readings,
  latestReadings: recent.latestReadings,
  latestNotifications: recent.latestNotifications,
  latestIncidentReports: (summary.latest_incidents ?? []).map((incident) => ({
    ...incident,
    animal_code:
      incident.animal_code ??
      incident.animal?.name_animal ??
      incident.animal?.animal_code ??
      null,
  })),
  degradedSources: [],
});

export const useDashboardSummary = () =>
  useQuery<ApiResponse<DashboardSummaryView>>({
    queryKey: ["dashboard-summary"],
    staleTime: 60_000,
    queryFn: async () => {
      const summaryResponse = await getDashboardSummary();
      const summary = summaryResponse.data;

      // Backend /api/dashboard now returns latest_readings & latest_notifications in a single round-trip.
      // Keep fallback only for older backend builds that omit those fields.
      const recent =
        Array.isArray(summary.latest_readings) && Array.isArray(summary.latest_notifications)
          ? {
              latestReadings: summary.latest_readings,
              latestNotifications: summary.latest_notifications,
            }
          : (await getDashboardRecentData()).data;

      return {
        success: summaryResponse.success,
        message: summaryResponse.message,
        data: toView(summary, recent),
        errors: summaryResponse.errors,
      };
    },
  });

export const useDashboardStats = (params: DashboardPeriodParams = {}) =>
  useQuery<ApiResponse<DashboardStats>>({
    queryKey: ["dashboard-stats", params],
    queryFn: () => getDashboardStats(params),
  });

export const useDashboardCharts = (params: DashboardPeriodParams = {}) =>
  useQuery<ApiResponse<DashboardCharts>>({
    queryKey: ["dashboard-charts", params],
    queryFn: () => getDashboardCharts(params),
  });
