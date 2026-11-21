
"use client";

import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Cpu,
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

const TYPE_OPTIONS = [
  { label: "Semua jenis", value: "all" },
  { label: "Zona berisiko", value: "risk_zone" },
  { label: "Peringatan perangkat", value: "device_alert" },
  { label: "Sistem", value: "system" },
];

const UNREAD_OPTIONS = [
  { label: "Semua", value: "all" },
  { label: "Belum dibaca", value: "unread" },
];

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

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useNotifications(load);

  const markAsRead = useMarkNotificationAsRead();
  const { showToast } = useToast();
  const notifications = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pemantauan"
        title="Notifikasi"
        description="Pantau peringatan risiko zona dan kondisi perangkat pelacak."
      />

      <section className="ui-panel p-5">
        <div className="mb-4">
          <h2 className="text-base font-bold text-ink">Filter Notifikasi</h2>
          <p className="mt-1 text-sm text-muted">
            Temukan notifikasi berdasarkan jenis dan status baca.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="notif-type"
              className="ui-label"
            >
              Jenis Notifikasi
            </label>

            <select
              id="notif-type"
              value={filters.type}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  type: event.target.value,
                }))
              }
              className="ui-input"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="notif-unread"
              className="ui-label"
            >
              Status Baca
            </label>

            <select
              id="notif-unread"
              value={filters.unread}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  unread: event.target.value,
                }))
              }
              className="ui-input"
            >
              {UNREAD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

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
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Bell className="size-8" />
          </div>

          <h3 className="mt-5 text-lg font-semibold text-zinc-900">
            Tidak ada notifikasi
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Belum ada peringatan yang sesuai dengan filter saat ini.
            Notifikasi risiko zona dan kondisi perangkat akan muncul di sini
            ketika tersedia.
          </p>
        </div>
      ) : (
        <section className="overflow-hidden ui-panel">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
            <div>
              <h3 className="font-bold text-ink">
                Daftar Notifikasi
              </h3>

              <p className="mt-1 text-sm text-muted">
                Informasi terbaru terkait pemantauan kawasan.
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {notifications.length} notifikasi
            </span>
          </div>

          <ul className="divide-y divide-zinc-100">
            {notifications.map((notification) => {
              const unread =
                notification.is_read === false ||
                notification.is_read === 0;

              const isRisk =
                notification.notification_type === "risk_zone";

              const isDevice =
                notification.notification_type === "device_alert";

              return (
                <li
                  key={notification.notif_id}
                  className={`px-5 py-5 transition-colors hover:bg-zinc-50 ${
                    unread ? "bg-emerald-50/50" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                        isRisk
                          ? "bg-red-100 text-red-700"
                          : isDevice
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isRisk ? (
                        <AlertTriangle className="size-6" />
                      ) : isDevice ? (
                        <Cpu className="size-6" />
                      ) : (
                        <Bell className="size-6" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-6 text-zinc-900">
                          {notification.message}
                        </p>

                        {unread && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                            <span className="size-1.5 rounded-full bg-emerald-600" />
                            Belum dibaca
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-muted">
                        {formatDate(notification.created_at)}
                      </p>

                      <div className="mt-3">
                        <StatusBadge
                          label={
                            isRisk
                              ? "Zona Berisiko"
                              : isDevice
                                ? "Peringatan Perangkat"
                                : "Sistem"
                          }
                          variant={
                            isRisk
                              ? "danger"
                              : isDevice
                                ? "warning"
                                : "info"
                          }
                        />
                      </div>

                      {unread ? (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead.mutate(notification.notif_id, {
                              onSuccess: () => {
                                showToast(
                                  "Notifikasi berhasil ditandai sudah dibaca.",
                                  "success",
                                );
                              },
                              onError: (error) => {
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
                          className="mt-3 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {markAsRead.isPending
                            ? "Memproses..."
                            : "Tandai sudah dibaca"}
                        </button>

                      ) : (
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                          <CheckCircle className="size-4 text-emerald-700" />
                          Sudah dibaca
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
