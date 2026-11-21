import { api, unwrapData } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type {
  GeoZone,
  GeoZoneListParams,
} from "@/types/geo-zone.type";

export type GeoZoneCreatePayload = {
  zone_name: string;
  zone_type: string;
  center_lat?: number;
  center_lon?: number;
  radius_km?: number;
  polygon_geojson?: string;
};

export type GeoZoneUpdatePayload = Partial<GeoZoneCreatePayload>;

export const getGeoZones = async (
  params?: GeoZoneListParams,
): Promise<GeoZone[]> => {
  const query = {
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.zoneType && params.zoneType !== "all"
      ? { zone_type: params.zoneType }
      : {}),
  };

  const response = await api.get<ApiResponse<GeoZone[]>>("/geo-zones", {
    params: query,
  });

  const payload = unwrapData(response);

  return Array.isArray(payload) ? payload : [];
};

export const getGeoZoneById = async (
  id: number,
): Promise<GeoZone | null> => {
  const response = await api.get<ApiResponse<GeoZone>>(
    `/geo-zones/${id}`,
  );

  const payload = unwrapData(response);

  return payload ?? null;
};

export const createGeoZone = async (
  payload: GeoZoneCreatePayload,
): Promise<GeoZone> => {
  const response = await api.post<ApiResponse<GeoZone>>("/geo-zones", {
    body: payload,
  });

  return unwrapData(response);
};

export const updateGeoZone = async (
  id: number,
  payload: GeoZoneUpdatePayload,
): Promise<GeoZone> => {
  const response = await api.put<ApiResponse<GeoZone>>(
    `/geo-zones/${id}`,
    {
      body: payload,
    },
  );

  return unwrapData(response);
};

export const deleteGeoZone = async (
  id: number,
): Promise<void> => {
  await api.delete<ApiResponse<null>>(`/geo-zones/${id}`);
};
