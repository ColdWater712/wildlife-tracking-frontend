import {
  api,
  buildFallbackMeta,
  unwrapData,
} from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type {
  TYPE_SPECIES,
  TYPE_SPECIES_GET_ALL_RESPONSE,
  TYPE_SPECIES_GET_BY_ID_RESPONSE,
  TYPE_SPECIES_PAYLOAD,
} from "@/types/species.type";

const buildGetAllResponse = (
  items: TYPE_SPECIES[],
  meta: TYPE_META_PAGGINATION | null,
): ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE> => ({
  success: true,
  message: "OK",
  data: {
    items,
    meta: meta ?? buildFallbackMeta(items.length),
  },
});

const buildGetByIdResponse = (
  item: TYPE_SPECIES | null,
): ApiResponse<TYPE_SPECIES_GET_BY_ID_RESPONSE> => ({
  success: true,
  message: "OK",
  data: {
    items: item,
    meta: null,
  },
});

export const SPECIES_SERVICE = {
  GET_ALL: async (
    params?: Partial<QUERY_PARAMS_API_GET_ALL> & {
      conservation_status?: string;
    },
  ): Promise<ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE>> => {
    const result = await api.requestList<ApiResponse<TYPE_SPECIES[]>>(
      "GET",
      "/species",
      { params },
    );

    return buildGetAllResponse(
      unwrapData(result.body),
      result.meta,
    );
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_SPECIES_GET_BY_ID_RESPONSE>> => {
    const response = await api.get<ApiResponse<TYPE_SPECIES>>(
      `/species/${id}`,
    );

    return buildGetByIdResponse(unwrapData(response) ?? null);
  },

  CREATE: async (
    payload: TYPE_SPECIES_PAYLOAD,
  ): Promise<ApiResponse<TYPE_SPECIES>> =>
    api.post<ApiResponse<TYPE_SPECIES>>("/species", {
      body: payload,
    }),

  UPDATE: async (
    id: number,
    payload: TYPE_SPECIES_PAYLOAD,
  ): Promise<ApiResponse<TYPE_SPECIES>> =>
    api.put<ApiResponse<TYPE_SPECIES>>(`/species/${id}`, {
      body: payload,
    }),

  DELETE: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/species/${id}`),
} as const;
