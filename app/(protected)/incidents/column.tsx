import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { StatusBadge } from "@/components/status";
import { formatDate } from "@/utils/format";
import type {
  IncidentReport,
  IncidentSyncStatus,
} from "@/types/incident.type";

const SYNC_LABEL: Record<IncidentSyncStatus, string> = {
  synced: "Tersinkron",
  pending_sync: "Menunggu Sinkron",
  failed: "Gagal Sinkron",
};

export const COLUMNS: ColumnDef<IncidentReport, unknown>[] = [
  {
    accessorKey: "timestamp",
    header: "Tanggal",
    cell: ({ row }) => (
      <span className="tabular-nums text-olive-dark">
        {formatDate(row.original.timestamp)}
      </span>
    ),
  },
  {
    accessorKey: "incident_type",
    header: "Jenis",
    cell: ({ row }) => (
      <span className="text-olive-dark">
        {row.original.incident_type.replaceAll("_", " ")}
      </span>
    ),
  },
  {
    accessorKey: "location",
    header: "Lokasi",
    cell: ({ row }) => (
      <span className="text-olive-dark">
        {row.original.location}
      </span>
    ),
  },
  {
    accessorKey: "animal_code",
    header: "Kode Satwa",
    cell: ({ row }) =>
      row.original.animal_code ? (
        <span className="font-medium text-forest-black">
          {row.original.animal_code}
        </span>
      ) : (
        <span className="text-sage">-</span>
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
        href={`/incidents/${row.original.report_id}/edit`}
        className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-3 py-2 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-primary"
      >
        <Pencil size={15} />
        Edit
      </Link>
    ),
  },
];
