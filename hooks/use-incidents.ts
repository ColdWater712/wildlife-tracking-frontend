"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createIncidentReport,
  getIncidentReportById,
  getIncidentReports,
  getPendingSyncReports,
  updateIncidentReport,
} from "@/services/incident.service";
import type {
  CreateIncidentReportPayload,
  UpdateIncidentReportPayload,
} from "@/services/incident.service";
import type { IncidentReport, IncidentReportListParams } from "@/types/incident.type";
import type { ApiResponse } from "@/types/api.type";

type IncidentReportApiResponse = ApiResponse<IncidentReport[]>;

const invalidateIncidentQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["incident-reports"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
  ]);
};

export const useIncidentReports = (params?: IncidentReportListParams) => {
  return useQuery<IncidentReportApiResponse>({
    queryKey: ["incident-reports", params],
    queryFn: () => getIncidentReports(params),
  });
};

export const useInfiniteIncidentReports = (params: IncidentReportListParams) => {
  return useInfiniteQuery<IncidentReportApiResponse>({
    queryKey: ["incident-reports-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getIncidentReports({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
  });
};

export const useIncidentReportById = (id: number) => {
  return useQuery<ApiResponse<IncidentReport | null>>({
    queryKey: ["incident-reports", id],
    queryFn: () => getIncidentReportById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const usePendingSyncReports = () => {
  return useQuery<IncidentReportApiResponse>({
    queryKey: ["incident-reports", "pending-sync"],
    queryFn: () => getPendingSyncReports(),
  });
};

export const useCreateIncidentReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateIncidentReportPayload) =>
      createIncidentReport(payload),
    onSuccess: async () => invalidateIncidentQueries(queryClient),
  });
};

export const useIncidentReportUpdate = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateIncidentReportPayload) =>
      updateIncidentReport(id, payload),
    onSuccess: async () => {
      await Promise.all([
        invalidateIncidentQueries(queryClient),
        queryClient.invalidateQueries({ queryKey: ["incident-reports", id] }),
      ]);
    },
  });
};
