export type NotificationType = "risk_zone" | "device_alert" | "system";

export type Notification = {
  notif_id: number;
  user_id: number;
  notification_type: NotificationType;
  message: string;
  animal_id: number | null;
  zone_id: number | null;
  device_id: number | null;
  report_id?: number | null;
  prediction_id?: number | null;
  is_read: boolean | number;
  created_at: string;
  animal?: unknown | null;
  zone?: unknown | null;
  device?: unknown | null;
  report?: unknown | null;
  prediction?: unknown | null;
};

export type NotificationListParams = {
  onlyUnread?: boolean;
  unread?: boolean;
  is_read?: boolean;
  type?: NotificationType;
  notification_type?: NotificationType;
  page?: number;
  per_page?: number;
};

export type NotificationUnreadCount = { unread: number };
export type NotificationMutationResult =
  | { updated: number }
  | { deleted: number };

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  risk_zone: "Zona Risiko",
  device_alert: "Alert Perangkat",
  system: "Sistem",
};
