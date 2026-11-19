
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import type { BadgeVariant } from "@/components/ui/status-badge";

import type {
  TYPE_CONSERVATION_STATUS,
  TYPE_SPECIES,
} from "@/types/species.type";

const CONSERVATION_VARIANT: Record<
  TYPE_CONSERVATION_STATUS,
  BadgeVariant
> = {
  "Critically Endangered": "danger",
  Endangered: "warning",
  Vulnerable: "info",
};

type SpeciesColumnActions = {
  onEdit: (species: TYPE_SPECIES) => void;
  onDelete: (species: TYPE_SPECIES) => void;
};

export const getSpeciesColumns = ({
  onEdit,
  onDelete,
}: SpeciesColumnActions): ColumnDef<TYPE_SPECIES, unknown>[] => [
  {
    accessorKey: "common_name",
    header: "Nama Umum",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-zinc-900">
          {row.original.common_name}
        </p>
        <p className="text-xs text-zinc-500">
          #{row.original.species_id}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "scientific_name",
    header: "Nama Ilmiah",
    cell: ({ row }) => (
      <span className="italic text-zinc-700">
        {row.original.scientific_name}
      </span>
    ),
  },
  {
    accessorKey: "conservation_status",
    header: "Status Konservasi",
    cell: ({ row }) => (
      <StatusBadge
        label={row.original.conservation_status}
        variant={
          CONSERVATION_VARIANT[row.original.conservation_status]
        }
      />
    ),
  },
  {
    accessorKey: "animal_count",
    header: "Jumlah Satwa",
    cell: ({ row }) => (
      <span className="tabular-nums text-zinc-700">
        {row.original.animal_count ?? 0}
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
