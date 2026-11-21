import { api, unwrapData } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type {
  GpsReading,
  GpsReadingListParams,
} from "@/types/tracking.type";

const sortByRecordedAt = (readings: GpsReading[]): GpsReading[] =>
  [...readings].sort(
    (left, right) =>
      new Date(right.recorded_at).getTime() -
      new Date(left.recorded_at).getTime(),
  );

export const getGpsReadings = async (
  params?: Partial<QUERY_PARAMS_API_GET_ALL> & GpsReadingListParams,
): Promise<ApiResponse<GpsReading[]>> => {
  const response = await api.get<ApiResponse<GpsReading[]>>(
    "/gps-readings",
    {
      params: {
        ...params,
        ...(params?.animalId !== undefined
          ? { animal_id: params.animalId }
          : {}),
        ...(params?.deviceId !== undefined
          ? { device_id: params.deviceId }
          : {}),
      },
    },
  );

  const readings = unwrapData(response);

  return {
    success: true,
    message: "OK",
    data: sortByRecordedAt(readings),
  };
};

export const getGpsReadingsByAnimal = async (
  animalId: number,
): Promise<ApiResponse<GpsReading[]>> => {
  const response = await api.get<ApiResponse<GpsReading[]>>(
    `/animals/${animalId}/track`,
  );

  const readings = unwrapData(response);

  return {
    success: true,
    message: "OK",
    data: sortByRecordedAt(readings),
  };
};

export const getGpsReadingsByDevice = async (
  deviceId: number,
): Promise<ApiResponse<GpsReading[]>> => {
  const response = await getGpsReadings();

  const readings = response.data.filter(
    (reading) => Number(reading.device_id) === Number(deviceId),
  );

  return {
    success: true,
    message: "OK",
    data: sortByRecordedAt(readings),
  };
};
