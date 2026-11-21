
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Pencil,
  Plus,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataFilters } from "@/components/ui/data-filters";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useIncidentReports } from "@/hooks/use-incidents";
import { formatDate } from "@/utils/format";
import { toApiErrorState } from "@/services/api";
import type {
  IncidentReport,
  IncidentSyncStatus,
} from "@/types/incident.type";

const SYNC_LABEL: Record<IncidentSyncStatus, string> = {
  synced: "Tersinkron",
  pending_sync: "Menunggu Sinkron",
  failed: "Gagal Sinkron",
};

const DEFAULT_FILTERS = {
  date_from: "",
  date_to: "",
  incident_type: "all",
  sync_status: "all",
};

type IncidentFilters = typeof DEFAULT_FILTERS;

const COLUMNS: ColumnDef<IncidentReport, unknown>[] = [
  {
    accessorKey: "timestamp",
    header: "Tanggal",
    cell: ({ row }) => (
      <span className="tabular-nums text-zinc-700">
        {formatDate(row.original.timestamp)}
      </span>
    ),
  },
  {
    accessorKey: "incident_type",
    header: "Jenis",
    cell: ({ row }) => (
      <span className="text-zinc-800">
        {row.original.incident_type.replaceAll("_", " ")}
      </span>
    ),
  },
  {
    accessorKey: "location",
    header: "Lokasi",
    cell: ({ row }) => (
      <span className="text-zinc-700">
        {row.original.location}
      </span>
    ),
  },
  {
    accessorKey: "animal_code",
    header: "Kode Satwa",
    cell: ({ row }) =>
      row.original.animal_code ? (
        <span className="font-medium text-zinc-900">
          {row.original.animal_code}
        </span>
      ) : (
        <span className="text-zinc-400">-</span>
      ),
  },
  {
    accessorKey: "sync_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.sync_status;

      return (
        <StatusBadge
          label={SYNC_LABEL[status]}
          variant={
            status === "synced"
              ? "success"
              : status === "pending_sync"
                ? "warning"
                : "danger"
          }
        />
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <Link
        href={`/incidents/${row.original.report_id}/update`}
        className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-3 py-2 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-primary"
      >
        <Pencil size={15} />
        Edit
      </Link>
    ),
  },
];

const isWithinRange = (
  value: string,
  from: string,
  to: string,
): boolean => {
  const time = new Date(value).getTime();

  if (Number.isNaN(time)) return true;

  if (from !== "") {
    const startTime = new Date(`${from}T00:00:00`).getTime();
    if (time < startTime) return false;
  }

  if (to !== "") {
    const endTime = new Date(`${to}T23:59:59.999`).getTime();
    if (time > endTime) return false;
  }

  return true;
};

export function IncidentListView() {
  const router = useRouter();
  const [filters, setFilters] =
    useState<IncidentFilters>(DEFAULT_FILTERS);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useIncidentReports();

  const reports = data?.data ?? [];

  const visibleReports = useMemo(
    () =>
      reports.filter((report: IncidentReport) => {
        const matchesType =
          filters.incident_type === "all" ||
          report.incident_type === filters.incident_type;

        const matchesSync =
          filters.sync_status === "all" ||
          report.sync_status === filters.sync_status;

        const matchesRange = isWithinRange(
          report.timestamp,
          filters.date_from,
          filters.date_to,
        );

        return matchesType && matchesSync && matchesRange;
      }),
    [reports, filters],
  );

  const statistics = [
    {
      label: "Total Insiden",
      value: visibleReports.length,
      tone: "neutral" as const,
      icon: <ClipboardList className="size-5" />,
    },
    {
      label: "Tersinkron",
      value: visibleReports.filter((item) => item.sync_status === "synced").length,
      tone: "positive" as const,
      icon: <CheckCircle2 className="size-5" />,
    },
    {
      label: "Menunggu Sinkron",
      value: visibleReports.filter((item) => item.sync_status === "pending_sync").length,
      tone: "warning" as const,
      icon: <Clock3 className="size-5" />,
    },
    {
      label: "Gagal Sinkron",
      value: visibleReports.filter((item) => item.sync_status === "failed").length,
      tone: "danger" as const,
      icon: <XCircle className="size-5" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operasional"
        title="Laporan Insiden"
        description="Pantau kejadian lapangan dan status sinkronisasi laporan."
        actions={
          <Button
            icon={<Plus className="size-4" />}
            onClick={() => router.push("/incidents/create")}
          >
            Tambah Laporan
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={String(item.value)}
            tone={item.tone}
            icon={item.icon}
          />
        ))}
      </div>

      <section className="ui-panel p-5">
        <div className="mb-4">
          <h3 className="font-bold text-ink">
            Filter Laporan
          </h3>
          <p className="mt-1 text-sm text-muted">
            Cari laporan berdasarkan tanggal, jenis, dan status sinkron.
          </p>
        </div>

        <DataFilters
          fields={[
            {
              key: "date_from",
              kind: "date",
              label: "Dari Tanggal",
            },
            {
              key: "date_to",
              kind: "date",
              label: "Sampai Tanggal",
            },
            {
              key: "incident_type",
              kind: "select",
              label: "Jenis Insiden",
              options: [
                { label: "Semua jenis", value: "all" },
                { label: "Observasi", value: "observasi" },
                { label: "Konflik", value: "konflik" },
                { label: "Perambahan", value: "perambahan" },
                {
                  label: "Peringatan Perangkat",
                  value: "device_alert",
                },
              ],
            },
            {
              key: "sync_status",
              kind: "select",
              label: "Status Sinkron",
              options: [
                { label: "Semua status", value: "all" },
                { label: "Tersinkron", value: "synced" },
                {
                  label: "Menunggu sinkron",
                  value: "pending_sync",
                },
                { label: "Gagal sinkron", value: "failed" },
              ],
            },
          ]}
          values={filters}
          onFilterChange={(values) =>
            setFilters((previous) => ({
              ...previous,
              ...values,
            }))
          }
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-bold text-ink">
            Daftar Laporan Insiden
          </h3>
          <p className="mt-1 text-sm text-muted">
            Informasi kejadian dan status sinkronisasi data.
          </p>
        </div>

        <div className="p-4">
          {error ? (
            <ErrorState
              kind={toApiErrorState(error).kind}
              message={toApiErrorState(error).message}
              status={toApiErrorState(error).status}
              errors={toApiErrorState(error).errors}
              onRetry={refetch}
            />
          ) : (
            <DataTable
              data={visibleReports}
              columns={COLUMNS}
              loading={isLoading}
              getRowId={(row) => String(row.report_id)}
              label="daftar laporan insiden"
              emptyTitle="Belum ada laporan insiden"
              emptyDescription="Belum ada laporan yang sesuai dengan filter yang dipilih."
            />
          )}
        </div>
      </section>
    </div>
  );
}
