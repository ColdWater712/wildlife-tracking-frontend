import { api, unwrapData } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type {
  Notification,
  NotificationListParams,
  NotificationMutationResult,
  NotificationUnreadCount,
} from "@/types/notification.type";

const toApiParams = (params?: NotificationListParams) => ({
  is_read: params?.is_read,
  onlyUnread: params?.onlyUnread,
  unread: params?.unread,
  type: params?.type,
  notification_type: params?.notification_type,
  page: params?.page,
  per_page: params?.per_page,
});

export const getNotifications = async (
  params?: NotificationListParams,
): Promise<ApiResponse<Notification[]>> => {
  const result = await api.requestList<ApiResponse<Notification[]>>(
    "GET",
    "/notifications",
    { params: toApiParams(params) },
  );

  return {
    success: result.body.success,
    message: result.body.message ?? "OK",
    data: unwrapData(result.body),
    errors: result.body.errors,
    meta: result.meta,
  };
};

export const getUnreadNotifications = async (): Promise<
  ApiResponse<Notification[]>
> => getNotifications({ onlyUnread: true });

export const getUnreadNotificationCount = async (): Promise<
  ApiResponse<NotificationUnreadCount>
> => api.get<ApiResponse<NotificationUnreadCount>>("/notifications/unread-count");

export const getNotificationById = async (
  id: number,
): Promise<ApiResponse<Notification | null>> => {
  const response = await api.get<ApiResponse<Notification>>(
    `/notifications/${id}`,
  );

  return {
    success: true,
    message: response.message ?? "OK",
    data: unwrapData(response) ?? null,
  };
};

export const markNotificationAsRead = async (
  id: number,
): Promise<ApiResponse<Notification>> =>
  api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = async (): Promise<
  ApiResponse<NotificationMutationResult>
> =>
  api.patch<ApiResponse<NotificationMutationResult>>(
    "/notifications/read-all",
  );

export const deleteAllReadNotifications = async (): Promise<
  ApiResponse<NotificationMutationResult>
> => api.delete<ApiResponse<NotificationMutationResult>>("/notifications");

export const deleteNotification = async (
  id: number,
): Promise<ApiResponse<null>> =>
  api.delete<ApiResponse<null>>(`/notifications/${id}`);
