import { api, unwrapData } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type {
  GpsReading,
  GpsReadingBulkResult,
  GpsReadingCreatePayload,
  GpsReadingListParams,
} from "@/types/tracking.type";

const sortByRecordedAt = (readings: GpsReading[]): GpsReading[] =>
  [...readings].sort(
    (left, right) =>
      new Date(right.recorded_at).getTime() -
      new Date(left.recorded_at).getTime(),
  );

const toApiParams = (params?: GpsReadingListParams) => {
  if (!params) return undefined;

  const {
    animalId,
    deviceId,
    ...rest
  } = params;

  return {
    ...rest,
    animal_id: params.animal_id ?? animalId,
    device_id: params.device_id ?? deviceId,
  };
};

export const getGpsReadings = async (
  params?: GpsReadingListParams,
): Promise<ApiResponse<GpsReading[]>> => {
  const result = await api.requestList<ApiResponse<GpsReading[]>>(
    "GET",
    "/gps-readings",
    { params: toApiParams(params) },
  );

  return {
    success: result.body.success,
    message: result.body.message ?? "OK",
    data: sortByRecordedAt(unwrapData(result.body)),
    errors: result.body.errors,
    meta: result.meta,
  };
};

export const getGpsReadingById = async (
  id: number,
): Promise<ApiResponse<GpsReading | null>> => {
  const response = await api.get<ApiResponse<GpsReading>>(
    `/gps-readings/${id}`,
  );

  return {
    success: true,
    message: response.message ?? "OK",
    data: unwrapData(response) ?? null,
  };
};

export const getGpsReadingsByAnimal = async (
  animalId: number,
): Promise<ApiResponse<GpsReading[]>> => getGpsReadings({ animal_id: animalId });

export const getGpsReadingsByDevice = async (
  deviceId: number,
): Promise<ApiResponse<GpsReading[]>> =>
  getGpsReadings({ device_id: deviceId });

export const getDeviceLatestReading = async (
  deviceId: number,
): Promise<ApiResponse<GpsReading | null>> => {
  const response = await api.get<ApiResponse<GpsReading | null>>(
    `/devices/${deviceId}/latest-reading`,
  );

  return {
    success: true,
    message: response.message ?? "OK",
    data: unwrapData(response) ?? null,
  };
};

export const getDeviceGpsReadings = async (
  deviceId: number,
  params?: { start_date?: string; end_date?: string; limit?: number },
): Promise<ApiResponse<GpsReading[]>> => {
  const response = await api.get<ApiResponse<GpsReading[]>>(
    `/devices/${deviceId}/gps-readings`,
    { params },
  );

  return {
    success: true,
    message: response.message ?? "OK",
    data: sortByRecordedAt(unwrapData(response)),
  };
};

export const createGpsReading = async (
  payload: GpsReadingCreatePayload,
): Promise<ApiResponse<GpsReading>> => {
  const response = await api.post<ApiResponse<GpsReading>>("/gps-readings", {
    body: payload,
  });

  return {
    success: true,
    message: response.message,
    data: unwrapData(response),
  };
};

export const createBulkGpsReadings = async (
  readings: GpsReadingCreatePayload[],
): Promise<ApiResponse<GpsReadingBulkResult>> => {
  const response = await api.post<ApiResponse<GpsReadingBulkResult>>(
    "/gps-readings/bulk",
    { body: { readings }, timeoutMs: 120_000 },
  );

  return {
    success: true,
    message: response.message,
    data: unwrapData(response),
  };
};
