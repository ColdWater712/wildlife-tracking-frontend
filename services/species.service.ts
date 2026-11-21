import { api, unwrapData } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";

import type {
  TYPE_SPECIES,
  TYPE_SPECIES_GET_ALL_RESPONSE,
  TYPE_SPECIES_GET_BY_ID_RESPONSE,
  TYPE_SPECIES_PAYLOAD,
} from "@/types/species.type";

const buildGetAllResponse = (
  items: TYPE_SPECIES[],
): ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE> => ({
  success: true,
  message: "OK",
  data: {
    items,
    meta: {
      total: items.length,
      page: 1,
      per_page: items.length,
      total_pages: 1,
      total_items: items.length,
    },
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
    params?: Partial<QUERY_PARAMS_API_GET_ALL>,
  ): Promise<ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE>> => {
    const response = await api.get<ApiResponse<TYPE_SPECIES[]>>("/species", {
      params,
    });

    const species = unwrapData(response);

    return buildGetAllResponse(species);
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_SPECIES_GET_BY_ID_RESPONSE>> => {
    const response = await api.get<ApiResponse<TYPE_SPECIES>>(
      `/species/${id}`,
    );

    const species = unwrapData(response);

    return buildGetByIdResponse(species ?? null);
  },

  CREATE: async (
    payload: TYPE_SPECIES_PAYLOAD,
  ): Promise<ApiResponse<TYPE_SPECIES>> => {
    return api.post<ApiResponse<TYPE_SPECIES>>("/species", {
      body: payload,
    });
  },

  UPDATE: async (
    id: number,
    payload: TYPE_SPECIES_PAYLOAD,
  ): Promise<ApiResponse<TYPE_SPECIES>> => {
    return api.put<ApiResponse<TYPE_SPECIES>>(`/species/${id}`, {
      body: payload,
    });
  },

  DELETE: async (id: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(`/species/${id}`);
  },
} as const;
