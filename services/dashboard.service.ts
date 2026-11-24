import { api, unwrapData } from "@/services/api";
import { getGpsReadings } from "@/services/tracking.service";
import { getNotifications } from "@/services/notification.service";

import type { ApiResponse } from "@/types/api.type";
import type {
  DashboardCharts,
  DashboardPeriodParams,
  DashboardRecentData,
  DashboardStats,
  DashboardSummary,
} from "@/types/dashboard.type";

const MAX_RECENT_ITEMS = 5;

export const getDashboardSummary = async (): Promise<
  ApiResponse<DashboardSummary>
> => api.get<ApiResponse<DashboardSummary>>("/dashboard");

export const getDashboardStats = async (
  params: DashboardPeriodParams = {},
): Promise<ApiResponse<DashboardStats>> =>
  api.get<ApiResponse<DashboardStats>>("/dashboard/stats", { params });

export const getDashboardCharts = async (
  params: DashboardPeriodParams = {},
): Promise<ApiResponse<DashboardCharts>> =>
  api.get<ApiResponse<DashboardCharts>>("/dashboard/charts", { params });

export const getDashboardRecentData = async (): Promise<
  ApiResponse<DashboardRecentData>
> => {
  const [readings, notifications] = await Promise.all([
    getGpsReadings({ limit: MAX_RECENT_ITEMS }),
    getNotifications({ page: 1, per_page: MAX_RECENT_ITEMS }),
  ]);

  return {
    success: true,
    message: "OK",
    data: {
      latestReadings: unwrapData(readings).slice(0, MAX_RECENT_ITEMS),
      latestNotifications: unwrapData(notifications).slice(0, MAX_RECENT_ITEMS),
    },
  };
};
