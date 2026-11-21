import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { formatDisplayValue } from "@/utils/format";
import type { GeoZone } from "@/types/geo-zone.type";

type GeoZoneColumnActions = {
  onDetail: (zone: GeoZone) => void;
  onEdit: (zone: GeoZone) => void;
  onDelete: (zone: GeoZone) => void;
};

export const getGeoZoneColumns = ({
  onDetail,
  onEdit,
  onDelete,
}: GeoZoneColumnActions): ColumnDef<GeoZone>[] => [
  {
    accessorKey: "zone_name",
    header: "Nama Zona",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-zinc-900">{row.original.zone_name}</p>
        <p className="text-xs text-zinc-500">#{row.original.zone_id}</p>
      </div>
    ),
  },
  {
    accessorKey: "zone_type",
    header: "Jenis Zona",
    cell: ({ row }) => (
      <span className="text-sm text-zinc-700">{row.original.zone_type}</span>
    ),
  },
  {
    accessorKey: "center_lat",
    header: "Latitude",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-zinc-700">
        {formatDisplayValue(row.original.center_lat)}
      </span>
    ),
  },
  {
    accessorKey: "center_lon",
    header: "Longitude",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-zinc-700">
        {formatDisplayValue(row.original.center_lon)}
      </span>
    ),
  },
  {
    accessorKey: "radius_km",
    header: "Radius (km)",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-zinc-700">
        {formatDisplayValue(row.original.radius_km)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDetail(row.original);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-surface-muted"
        >
          <Eye size={15} />
          Detail
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.original);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-[#D8E8DA] px-3 py-2 text-sm font-medium text-[#286747] transition hover:bg-[#F0F7F0]"
        >
          <Pencil size={15} />
          Edit
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.original);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash2 size={15} />
          Hapus
        </button>
      </div>
    ),
  },
];
