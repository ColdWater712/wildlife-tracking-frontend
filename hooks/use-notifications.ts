"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
} from "@/services/notification.service";
import type { Notification, NotificationListParams } from "@/types/notification.type";
import type { ApiResponse } from "@/types/api.type";

type NotificationApiResponse = ApiResponse<Notification[]>;

export const useNotifications = (params?: NotificationListParams) => {
  return useQuery<NotificationApiResponse>({
    queryKey: ["notifications", params],
    queryFn: () => getNotifications(params),
  });
};

export const useInfiniteNotifications = (
  params: Omit<NotificationListParams, "page">,
) => {
  return useInfiniteQuery<NotificationApiResponse>({
    queryKey: ["notifications-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getNotifications({ ...params, page: pageParam as number } as NotificationListParams),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
  });
};

export const useNotificationById = (id: number) => {
  return useQuery<NotificationApiResponse>({
    queryKey: ["notifications", id],
    queryFn: () => getNotifications({ onlyUnread: false }),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useUnreadNotifications = () => {
  return useQuery<NotificationApiResponse>({
    queryKey: ["notifications-unread"],
    queryFn: () => getUnreadNotifications(),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["notifications"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["notifications-unread"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["notifications-infinite"],
        }),
      ]);
    },
  });
};