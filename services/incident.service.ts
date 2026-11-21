import { api, unwrapData } from "@/services/api";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type {
  ApiIncidentReport,
  CreateIncidentReportPayload,
  IncidentReport,
  IncidentReportListParams,
  IncidentSyncStatus,
  UpdateIncidentReportPayload,
} from "@/types/incident.type";

const mapSyncStatus = (value: string | undefined): IncidentSyncStatus => {
  if (value === "synced") return "synced";
  if (value === "failed") return "failed";
  return "pending_sync";
};

const mapIncidentFromApi = (report: ApiIncidentReport): IncidentReport => ({
  report_id: report.report_id,
  user_id: report.user_id ?? report.reported_by ?? null,
  reported_by: report.reported_by ?? report.user_id ?? null,
  incident_type: report.incident_type,
  description: report.description,
  timestamp: report.timestamp,
  latitude: report.latitude,
  longitude: report.longitude,
  location: report.location ?? "Lokasi Tidak Diketahui",
  animal_id: report.animal_id ?? null,
  species_id: report.species_id ?? null,
  status: report.status ?? "pending",
  sync_status: mapSyncStatus(report.sync_status),
  animal_code: report.animal?.name ?? report.animal?.animal_code ?? null,
  photo_url: null,
  animal: report.animal ?? null,
  species: report.species ?? null,
});

const filterReports = (
  reports: IncidentReport[],
  params?: IncidentReportListParams,
): IncidentReport[] =>
  reports.filter((report) => {
    const matchesType =
      params?.incidentType === undefined ||
      report.incident_type === params.incidentType;

    const matchesSync =
      params?.syncStatus === undefined ||
      report.sync_status === params.syncStatus;

    return matchesType && matchesSync;
  });

export const getIncidentReports = async (
  params?: Partial<QUERY_PARAMS_API_GET_ALL> & IncidentReportListParams,
): Promise<ApiResponse<IncidentReport[]>> => {
  const response = await api.get<ApiResponse<ApiIncidentReport[]>>("/incidents", {
    params,
  });

  const reports = unwrapData(response).map(mapIncidentFromApi);

  return {
    success: true,
    message: "OK",
    data: filterReports(reports, params).sort(
      (left, right) =>
        new Date(right.timestamp).getTime() -
        new Date(left.timestamp).getTime(),
    ),
  };
};

export const getIncidentReportById = async (
  id: number,
): Promise<ApiResponse<IncidentReport | null>> => {
  const response = await api.get<ApiResponse<ApiIncidentReport>>(
    `/incidents/${id}`,
  );

  const report = unwrapData(response);

  return {
    success: true,
    message: response.message ?? "OK",
    data: report ? mapIncidentFromApi(report) : null,
  };
};

export const createIncidentReport = async (
  payload: CreateIncidentReportPayload,
): Promise<ApiResponse<IncidentReport>> => {
  const response = await api.post<ApiResponse<ApiIncidentReport>>("/incidents", {
    body: payload,
  });

  return {
    success: true,
    message: response.message ?? "Laporan insiden berhasil dibuat.",
    data: mapIncidentFromApi(unwrapData(response)),
  };
};

export const updateIncidentReport = async (
  id: number,
  payload: UpdateIncidentReportPayload,
): Promise<ApiResponse<IncidentReport>> => {
  const response = await api.put<ApiResponse<ApiIncidentReport>>(
    `/incidents/${id}`,
    { body: payload },
  );

  return {
    success: true,
    message: response.message ?? "Laporan insiden diperbarui.",
    data: mapIncidentFromApi(unwrapData(response)),
  };
};

export const getPendingSyncReports = async (): Promise<
  ApiResponse<IncidentReport[]>
> => {
  const response = await getIncidentReports();

  return {
    success: true,
    message: "OK",
    data: (response.data ?? []).filter(
      (report) => report.sync_status !== "synced",
    ),
  };
};
