
"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTrackingDevices,
  getTrackingDeviceById,
  getDeviceAlerts,
  createTrackingDevice,
  updateTrackingDevice,
  deleteTrackingDevice,
} from "@/services/tracking-device.service";

import type {
  TYPE_TRACKING_DEVICE_PAYLOAD,
  TYPE_TRACKING_DEVICE_UPDATE_PAYLOAD,
} from "@/services/tracking-device.service";

import type {
  TrackingDevice,
  DeviceAlert,
  TrackingDeviceListParams,
} from "@/types/tracking-device.type";

import type { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { ApiResponse } from "@/types/api.type";

type TrackingDeviceGetAllResponse = {
  items: TrackingDevice[];
  meta: TYPE_META_PAGGINATION;
};

type TrackingDeviceApiResponse = ApiResponse<TrackingDevice[]>;

const invalidateTrackingDeviceQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ["tracking-devices"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["tracking-devices-infinite"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["device-alerts"],
    }),
  ]);
};

export const useTrackingDevices = (
  params?: TrackingDeviceListParams,
) => {
  return useQuery<TrackingDeviceApiResponse>({
    queryKey: ["tracking-devices", params],
    queryFn: () => getTrackingDevices(params),
  });
};

export const useInfiniteTrackingDevices = (
  params: Omit<TrackingDeviceListParams, "page">,
) => {
  return useInfiniteQuery<TrackingDeviceApiResponse>({
    queryKey: ["tracking-devices-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getTrackingDevices({
        ...params,
        page: pageParam as number,
      } as TrackingDeviceListParams),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
  });
};

export const useTrackingDeviceById = (id: number) => {
  return useQuery<ApiResponse<TrackingDevice | null>>({
    queryKey: ["tracking-devices", id],
    queryFn: () => getTrackingDeviceById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useDeviceAlerts = () => {
  return useQuery<ApiResponse<DeviceAlert[]>>({
    queryKey: ["device-alerts"],
    queryFn: () => getDeviceAlerts(),
  });
};

// CREATE TRACKING DEVICE
export const useTrackingDeviceCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_TRACKING_DEVICE_PAYLOAD) =>
      createTrackingDevice(payload),

    onSuccess: async () => {
      await invalidateTrackingDeviceQueries(queryClient);
    },
  });
};

// UPDATE TRACKING DEVICE
export const useTrackingDeviceUpdate = (deviceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_TRACKING_DEVICE_UPDATE_PAYLOAD) =>
      updateTrackingDevice(deviceId, payload),

    onSuccess: async () => {
      await Promise.all([
        invalidateTrackingDeviceQueries(queryClient),
        queryClient.invalidateQueries({
          queryKey: ["tracking-devices", deviceId],
        }),
      ]);
    },
  });
};

// DELETE TRACKING DEVICE
export const useTrackingDeviceDelete = (deviceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTrackingDevice(deviceId),

    onSuccess: async () => {
      await Promise.all([
        invalidateTrackingDeviceQueries(queryClient),
        queryClient.removeQueries({
          queryKey: ["tracking-devices", deviceId],
        }),
      ]);
    },
  });
};
