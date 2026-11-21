import { api, unwrapData } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";

import type {
  API_ANIMAL,
  TYPE_ANIMAL,
  TYPE_ANIMAL_GET_ALL_RESPONSE,
  TYPE_ANIMAL_GET_BY_ID_RESPONSE,
  TYPE_ANIMAL_PAYLOAD,
} from "@/types/animal.type";

const mapAnimalFromApi = (animal: API_ANIMAL): TYPE_ANIMAL => ({
  animal_id: animal.animal_id,
  species_id: animal.species_id,
  animal_code: animal.name,
  birth_date: animal.birth_date,
  gender:
    animal.gender === "male"
      ? "Jantan"
      : animal.gender === "female"
        ? "Betina"
        : "Tidak Diketahui",
  is_active: animal.is_active,
  species: animal.species ?? null,
  trackingDevice: animal.trackingDevice ?? null,
  created_at: animal.created_at ?? "",
  updated_at: animal.updated_at ?? "",
});

const mapAnimalPayloadToApi = (
  payload: TYPE_ANIMAL_PAYLOAD,
) => ({
  species_id: payload.species_id,
  name: payload.animal_code,
  birth_date: payload.birth_date,
  gender:
    payload.gender === "Jantan"
      ? "male"
      : payload.gender === "Betina"
        ? "female"
        : "unknown",
  is_active: payload.is_active,
});

const buildGetAllResponse = (
  items: TYPE_ANIMAL[],
): ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE> => ({
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
  item: TYPE_ANIMAL | null,
): ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE> => ({
  success: true,
  message: "OK",
  data: {
    items: item,
    meta: null,
  },
});

export const ANIMAL_SERVICE = {
  GET_ALL: async (
    params?: Partial<QUERY_PARAMS_API_GET_ALL>,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE>> => {
    const response = await api.get<ApiResponse<API_ANIMAL[]>>("/animals", {
      params,
    });

    const animals = unwrapData(response);
    const items = animals.map(mapAnimalFromApi);

    return buildGetAllResponse(items);
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE>> => {
    const response = await api.get<ApiResponse<API_ANIMAL>>(
      `/animals/${id}`,
    );

    const animal = unwrapData(response);

    return buildGetByIdResponse(
      animal ? mapAnimalFromApi(animal) : null,
    );
  },

  CREATE: async (
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    const response = await api.post<ApiResponse<API_ANIMAL>>("/animals", {
      body: mapAnimalPayloadToApi(payload),
    });

    const animal = unwrapData(response);

    return {
      success: true,
      message: response.message,
      data: mapAnimalFromApi(animal),
    };
  },

  UPDATE: async (
    id: number,
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    const response = await api.put<ApiResponse<API_ANIMAL>>(
      `/animals/${id}`,
      {
        body: mapAnimalPayloadToApi(payload),
      },
    );

    const animal = unwrapData(response);

    return {
      success: true,
      message: response.message,
      data: mapAnimalFromApi(animal),
    };
  },

  DELETE: async (id: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(`/animals/${id}`);
  },
} as const;
