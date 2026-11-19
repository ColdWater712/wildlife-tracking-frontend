
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getGeoZones,
  getGeoZoneById,
  createGeoZone,
  updateGeoZone,
  deleteGeoZone,
} from "@/services/geo-zone.service";

import type {
  GeoZoneCreatePayload,
  GeoZoneUpdatePayload,
} from "@/services/geo-zone.service";

import type { GeoZoneListParams } from "@/types/geo-zone";

// READ: Mengambil daftar zona
export function useGeoZones(params?: GeoZoneListParams) {
  return useQuery({
    queryKey: ["geo-zones", params],
    queryFn: () => getGeoZones(params),
  });
}

// READ: Mengambil detail zona
export function useGeoZoneById(id: number) {
  return useQuery({
    queryKey: ["geo-zones", id],
    queryFn: () => getGeoZoneById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

// CREATE: Menambahkan zona
export function useGeoZoneCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GeoZoneCreatePayload) =>
      createGeoZone(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["geo-zones"],
      });
    },
  });
}

// UPDATE: Memperbarui zona
export function useGeoZoneUpdate(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GeoZoneUpdatePayload) =>
      updateGeoZone(id, payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["geo-zones"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["geo-zones", id],
        }),
      ]);
    },
  });
}

// DELETE: Menghapus zona
export function useGeoZoneDelete(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteGeoZone(id),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["geo-zones"],
        }),
        queryClient.removeQueries({
          queryKey: ["geo-zones", id],
        }),
      ]);
    },
  });
}
