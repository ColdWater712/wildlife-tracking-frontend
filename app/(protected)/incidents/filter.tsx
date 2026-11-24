import type { ComponentProps } from "react";
import { DataFilters } from "@/components/filter";
import { INCIDENT_TYPES, INCIDENT_TYPE_LABELS } from "@/types/incident.type";

export const DEFAULT_FILTERS = {
  date_from: "",
  date_to: "",
  incident_type: "all",
  sync_status: "all",
};

export type IncidentFilters = typeof DEFAULT_FILTERS;

export const FILTER_FIELDS: ComponentProps<typeof DataFilters>["fields"] = [
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
      ...INCIDENT_TYPES.map((value) => ({
        label: INCIDENT_TYPE_LABELS[value],
        value,
      })),
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
];

export const isWithinRange = (
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
