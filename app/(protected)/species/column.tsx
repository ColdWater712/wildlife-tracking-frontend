import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/status";
import type { BadgeVariant } from "@/components/status";

import type {
  TYPE_CONSERVATION_STATUS,
  TYPE_SPECIES,
} from "@/types/species.type";
import { TYPE_CONSERVATION_STATUS_LABELS } from "@/types/species.type";

const CONSERVATION_VARIANT: Record<
  TYPE_CONSERVATION_STATUS,
  BadgeVariant
> = {
  "Least Concern": "success",
  "Near Threatened": "info",
  Vulnerable: "info",
  Endangered: "warning",
  "Critically Endangered": "danger",
  Extinct: "neutral",
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
        <p className="font-medium text-forest-black">
          {row.original.common_name}
        </p>
        <p className="text-xs text-sage">
          #{row.original.species_id}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "scientific_name",
    header: "Nama Ilmiah",
    cell: ({ row }) => (
      <span className="italic text-olive-dark">
        {row.original.scientific_name}
      </span>
    ),
  },
  {
    accessorKey: "conservation_status",
    header: "Status Konservasi",
    cell: ({ row }) => (
      <StatusBadge
        label={
          TYPE_CONSERVATION_STATUS_LABELS[row.original.conservation_status]
        }
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
      <span className="tabular-nums text-olive-dark">
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
          className="inline-flex items-center gap-2 rounded-lg border border-natural-muted px-3 py-2 text-sm font-medium text-forest-deep transition hover:bg-natural-muted/30"
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
          className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger-soft"
        >
          <Trash2 size={15} />
          Hapus
        </button>
      </div>
    ),
  },
];
