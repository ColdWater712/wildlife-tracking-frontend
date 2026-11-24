import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import type { useGpsReadings } from "@/hooks/use-tracking";
import type { TYPE_ANIMAL } from "@/types/animal.type";

export type AnimalGpsReading = NonNullable<
  NonNullable<ReturnType<typeof useGpsReadings>["data"]>["data"]
>[number];

type AnimalColumnActions = {
  latestGpsByDevice: Map<number, AnimalGpsReading>;
  onEdit: (animal: TYPE_ANIMAL) => void;
  onDelete: (animal: TYPE_ANIMAL) => void;
};

export const getAnimalColumns = ({
  latestGpsByDevice,
  onEdit,
  onDelete,
}: AnimalColumnActions): ColumnDef<TYPE_ANIMAL>[] => [
  {
    accessorKey: "animal_code",
    header: "Kode Satwa",
    cell: ({ row }) => (
      <Link
        href={`/animals/${row.original.animal_id}/detail`}
        className="group inline-flex flex-col"
      >
        <span className="font-medium text-forest-primary underline-offset-2 group-hover:underline">
          {row.original.animal_code}
        </span>
        <span className="text-xs text-sage">
          #{row.original.animal_id}
        </span>
      </Link>
    ),
  },
  {
    id: "species",
    header: "Spesies",
    accessorFn: (animal) => animal.species?.common_name ?? "",
    cell: ({ row }) =>
      row.original.species ? (
        <div>
          <p className="font-medium text-olive-dark">
            {row.original.species.common_name}
          </p>
          <p className="text-xs italic text-sage">
            {row.original.species.scientific_name}
          </p>
        </div>
      ) : (
        <span className="text-xs text-sage">
          Spesies #{row.original.species_id}
        </span>
      ),
  },
  {
    id: "device",
    header: "Perangkat GPS",
    cell: ({ row }) => (
      <span className="text-sm text-olive-dark">
        {row.original.trackingDevice?.model ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "gender",
    header: "Jenis Kelamin",
    cell: ({ row }) => {
      const gender = row.original.gender;

      return (
        <span className="text-sm font-semibold text-olive-dark">
          {gender === "Jantan"
            ? "♂"
            : gender === "Betina"
              ? "♀"
              : "?"}
        </span>
      );
    },
  },
  {
    accessorKey: "birth_date",
    header: "Tanggal Lahir",
    cell: ({ row }) => {
      const birthDate = row.original.birth_date;

      return birthDate ? (
        <span className="text-sm text-olive-dark">
          {new Date(birthDate).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ) : (
        <span className="text-sage">-</span>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.is_active;

      return (
        <span
          className={
            isActive
              ? "inline-flex rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success"
              : "inline-flex rounded-full bg-natural-muted/50 px-2.5 py-1 text-xs font-medium text-sage"
          }
        >
          {isActive ? "Terpantau" : "Tidak Terpantau"}
        </span>
      );
    },
  },
  {
    id: "coordinates",
    header: "Koordinat",
    cell: ({ row }) => {
      const deviceId = row.original.trackingDevice?.device_id;

      const reading = deviceId
        ? latestGpsByDevice.get(Number(deviceId))
        : undefined;

      return reading ? (
        <div className="text-sm text-olive-dark">
          <p>Lat: {Number(reading.latitude).toFixed(6)}</p>
          <p>Long: {Number(reading.longitude).toFixed(6)}</p>
        </div>
      ) : (
        <span className="text-sage">-</span>
      );
    },
  },
  {
    id: "recordedAt",
    header: "Waktu Pencatatan",
    cell: ({ row }) => {
      const deviceId = row.original.trackingDevice?.device_id;

      const reading = deviceId
        ? latestGpsByDevice.get(Number(deviceId))
        : undefined;

      const recordedAt = reading?.recorded_at;

      return recordedAt ? (
        <span className="text-sm text-olive-dark">
          {new Date(recordedAt).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      ) : (
        <span className="text-sage">-</span>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(row.original)}
          className="inline-flex items-center gap-2 rounded-lg border border-natural-muted px-3 py-2 text-sm font-medium text-forest-deep transition hover:bg-natural-muted/30"
        >
          <Pencil size={15} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(row.original)}
          className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger-soft"
        >
          <Trash2 size={15} />
          Hapus
        </button>
      </div>
    ),
  },
];
