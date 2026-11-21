"use client";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  RadioTower,
  Shield,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useNotifications,
  useMarkNotificationAsRead,
} from "@/hooks/use-notifications";
import { toApiErrorState } from "@/services/api";
import { formatDate } from "@/utils/format";
import type { NotificationType } from "@/types/notification.type";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type NotificationItem = {
  notif_id: number; // Diubah ke number agar sesuai dengan hook
  message: string;
  notification_type: NotificationType;
  is_read: boolean | number;
  created_at: string;
};

// ─────────────────────────────────────────────────────────────
// Filter Options
// ─────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { label: "Semua", value: "all" },
  { label: "Zona Berisiko", value: "risk_zone" },
  { label: "Perangkat", value: "device_alert" },
  { label: "Sistem", value: "system" },
] as const;

const UNREAD_OPTIONS = [
  { label: "Semua", value: "all" },
  { label: "Belum Dibaca", value: "unread" },
] as const;

// ─────────────────────────────────────────────────────────────
// Icon & Style Mapping
// ─────────────────────────────────────────────────────────────

function getNotificationConfig(type: NotificationType) {
  switch (type) {
    case "risk_zone":
      return {
        icon: AlertTriangle,
        label: "Zona Berisiko",
        variant: "danger" as const,
        iconBg: "bg-danger-soft",
        iconColor: "text-danger",
      };
    case "device_alert":
      return {
        icon: RadioTower,
        label: "Peringatan Perangkat",
        variant: "warning" as const,
        iconBg: "bg-warning-soft",
        iconColor: "text-warning-dark",
      };
    case "system":
    default:
      return {
        icon: Info,
        label: "Sistem",
        variant: "info" as const,
        iconBg: "bg-primary-soft",
        iconColor: "text-primary",
      };
  }
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export function NotificationListView() {
  const [filters, setFilters] = useState({
    type: "all",
    unread: "all",
  });

  const load = useMemo(
    () => ({
      type:
        filters.type === "all"
          ? undefined
          : (filters.type as NotificationType),
      onlyUnread: filters.unread === "unread",
    }),
    [filters.type, filters.unread],
  );

  const { data, isLoading, error, refetch } = useNotifications(load);
  const markAsRead = useMarkNotificationAsRead();
  const { showToast } = useToast();
  
  // Explicit type casting to avoid implicit any
  const notifications = (data?.data as NotificationItem[]) ?? [];

  const unreadCount = notifications.filter(
    (n) => n.is_read === false || n.is_read === 0,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pemantauan"
        title="Notifikasi"
        description="Pantau peringatan risiko zona dan kondisi perangkat pelacak."
      />

      {/* Combined Filter & List Header */}
      <section className="ui-panel p-5">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink">
                Filter Notifikasi
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                Temukan notifikasi berdasarkan jenis dan status baca.
              </p>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-dark">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {unreadCount} belum dibaca
                  </span>
                )}
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-ink-soft">
                  {notifications.length} total
                </span>
              </div>
            )}
          </div>

          {/* Pill Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Type Filter */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <label className="text-xs font-semibold text-ink-soft">
                Jenis:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        type: option.value,
                      }))
                    }
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                      filters.type === option.value
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface-muted text-ink-soft hover:bg-line hover:text-ink",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />

            {/* Unread Filter */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <label className="text-xs font-semibold text-ink-soft">
                Status:
              </label>
              <div className="flex gap-1.5">
                {UNREAD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        unread: option.value,
                      }))
                    }
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                      filters.unread === option.value
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface-muted text-ink-soft hover:bg-line hover:text-ink",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      {error ? (
        <ErrorState
          kind={toApiErrorState(error).kind}
          message={toApiErrorState(error).message}
          status={toApiErrorState(error).status}
          errors={toApiErrorState(error).errors}
          onRetry={refetch}
        />
      ) : isLoading ? (
        <div className="ui-panel py-16">
          <Loading label="Memuat notifikasi..." />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <NotificationList
          notifications={notifications}
          markAsRead={markAsRead}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="ui-panel px-6 py-20 text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft to-primary-soft/50 ring-1 ring-primary/20">
        <Bell className="size-10 text-primary" />
      </div>

      <h3 className="mt-6 text-lg font-bold text-ink">
        Tidak ada notifikasi
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        Belum ada peringatan yang sesuai dengan filter saat ini. Notifikasi
        risiko zona dan kondisi perangkat akan muncul di sini ketika tersedia.
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
        <Shield className="size-4" />
        <span>Sistem pemantauan aktif 24/7</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Notification List
// ─────────────────────────────────────────────────────────────

type NotificationListProps = {
  notifications: NotificationItem[];
  markAsRead: ReturnType<typeof useMarkNotificationAsRead>;
  showToast: (message: string, type: "success" | "error") => void;
};

function NotificationList({
  notifications,
  markAsRead,
  showToast,
}: NotificationListProps) {
  return (
    <section className="overflow-hidden ui-panel">
      <ul className="divide-y divide-line">
        {notifications.map((notification) => {
          const unread =
            notification.is_read === false || notification.is_read === 0;
          const config = getNotificationConfig(notification.notification_type);
          const Icon = config.icon;

          return (
            <li
              key={notification.notif_id}
              className={cn(
                "group relative px-5 py-4 transition-colors",
                unread
                  ? "bg-primary-soft/30 hover:bg-primary-soft/50"
                  : "bg-surface hover:bg-surface-muted/50",
              )}
            >
              {/* Unread indicator */}
              {unread && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                />
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    config.iconBg,
                    config.iconColor,
                  )}
                >
                  <Icon className="size-5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm leading-6",
                          unread
                            ? "font-semibold text-ink"
                            : "font-medium text-ink-soft",
                        )}
                      >
                        {notification.message}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <StatusBadge
                          label={config.label}
                          variant={config.variant}
                        />
                        <span className="text-xs text-muted">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    {unread ? (
                      <button
                        type="button"
                        onClick={() =>
                          markAsRead.mutate(Number(notification.notif_id), {
                            onSuccess: () => {
                              showToast(
                                "Notifikasi berhasil ditandai sudah dibaca.",
                                "success",
                              );
                            },
                            onError: (error: unknown) => {
                              showToast(
                                error instanceof Error
                                  ? error.message
                                  : "Gagal menandai notifikasi sudah dibaca.",
                                "error",
                              );
                            },
                          })
                        }
                        disabled={markAsRead.isPending}
                        className="shrink-0 rounded-lg border border-primary/30 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark transition hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {markAsRead.isPending ? "Memproses..." : "Tandai Dibaca"}
                      </button>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
                        <CheckCircle2 className="size-3.5" />
                        Dibaca
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}