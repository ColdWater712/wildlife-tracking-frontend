
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  PawPrint,
  Radio,
  Trees,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import {
  DataFilters,
  type FilterField,
  type FilterValues,
} from "@/components/ui/data-filters";

import {
  useAnimals,
  useAnimalDelete,
} from "@/hooks/use-animals";
import { useSpecies } from "@/hooks/use-species";
import { useGpsReadings } from "@/hooks/use-tracking";
import { useToast } from "@/components/providers/toast-provider";
import { formatApiError, toApiErrorState } from "@/services/api";

import type { TYPE_ANIMAL } from "@/types/animal.type";

type AnimalFilterValues = FilterValues & {
  search: string;
  species_id: string;
  status: string;
};

const INITIAL_FILTERS: AnimalFilterValues = {
  search: "",
  species_id: "all",
  status: "all",
};

type AnimalRow = TYPE_ANIMAL;

export default function AnimalListView() {
  const router = useRouter();
  const [filters, setFilters] =
    useState<AnimalFilterValues>(INITIAL_FILTERS);

  const [selectedDeleteAnimal, setSelectedDeleteAnimal] =
    useState<TYPE_ANIMAL | null>(null);

  const { showToast } = useToast();

  const animalQuery = useAnimals();
  const speciesQuery = useSpecies();
  const gpsQuery = useGpsReadings();

  const deleteAnimalMutation = useAnimalDelete(
    selectedDeleteAnimal?.animal_id ?? 0,
  );

  const animals = animalQuery.data?.data?.items ?? [];
  const speciesList = speciesQuery.data?.data?.items ?? [];
  const gpsReadings = gpsQuery.data?.data ?? [];

  const isLoading =
    animalQuery.isLoading ||
    speciesQuery.isLoading ||
    gpsQuery.isLoading;

  const closeDeleteDialog = () => {
    if (deleteAnimalMutation.isPending) return;

    setSelectedDeleteAnimal(null);
    deleteAnimalMutation.reset();
  };

  const handleDeleteAnimal = () => {
    if (!selectedDeleteAnimal) return;

    deleteAnimalMutation.mutate(undefined, {
      onSuccess: () => {
        showToast("Satwa berhasil dihapus.", "success");
        setSelectedDeleteAnimal(null);
      },
      onError: (error) => {
        showToast(
          formatApiError(error, "Gagal menghapus satwa. Silakan coba lagi."),
          "error",
        );
      },
    });
  };

  const latestGpsByDevice = useMemo(() => {
    const gpsMap = new Map<
      number,
      (typeof gpsReadings)[number]
    >();

    const sortedReadings = [...gpsReadings].sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() -
        new Date(a.recorded_at).getTime(),
    );

    sortedReadings.forEach((reading) => {
      const deviceId = Number(reading.device_id);

      if (!gpsMap.has(deviceId)) {
        gpsMap.set(deviceId, reading);
      }
    });

    return gpsMap;
  }, [gpsReadings]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        key: "search",
        kind: "search",
        label: "Cari Satwa",
        placeholder: "Cari nama, kode, atau perangkat GPS...",
      },
      {
        key: "species_id",
        kind: "select",
        label: "Spesies",
        options: [
          {
            label: "Semua Spesies",
            value: "all",
          },
          ...speciesList.map((species) => ({
            label: species.common_name,
            value: String(species.species_id),
          })),
        ],
      },
      {
        key: "status",
        kind: "select",
        label: "Status",
        options: [
          {
            label: "Semua Status",
            value: "all",
          },
          {
            label: "Terpantau",
            value: "active",
          },
          {
            label: "Tidak Terpantau",
            value: "inactive",
          },
        ],
      },
    ],
    [speciesList],
  );

  const filteredAnimals = useMemo(() => {
    const search = filters.search.toLowerCase().trim();

    return animals.filter((animal) => {
      const matchesSearch =
        !search ||
        animal.animal_code.toLowerCase().includes(search) ||
        String(animal.animal_id).includes(search) ||
        (animal.species?.common_name
          .toLowerCase()
          .includes(search) ?? false) ||
        (animal.trackingDevice?.model
          .toLowerCase()
          .includes(search) ?? false);

      const matchesSpecies =
        filters.species_id === "all" ||
        animal.species_id === Number(filters.species_id);

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active"
          ? animal.is_active
          : !animal.is_active);

      return (
        matchesSearch &&
        matchesSpecies &&
        matchesStatus
      );
    });
  }, [animals, filters]);

  const columns = useMemo<ColumnDef<AnimalRow>[]>(
    () => [
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
        accessorFn: (animal) =>
          animal.species?.common_name ?? "",
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
              {new Date(birthDate).toLocaleDateString(
                "id-ID",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                },
              )}
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
          const deviceId =
            row.original.trackingDevice?.device_id;

          const reading = deviceId
            ? latestGpsByDevice.get(Number(deviceId))
            : undefined;

          return reading ? (
            <div className="text-sm text-olive-dark">
              <p>
                Lat:{" "}
                {Number(reading.latitude).toFixed(6)}
              </p>
              <p>
                Long:{" "}
                {Number(reading.longitude).toFixed(6)}
              </p>
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
          const deviceId =
            row.original.trackingDevice?.device_id;

          const reading = deviceId
            ? latestGpsByDevice.get(Number(deviceId))
            : undefined;

          const recordedAt = reading?.recorded_at;

          return recordedAt ? (
            <span className="text-sm text-olive-dark">
              {new Date(recordedAt).toLocaleString(
                "id-ID",
                {
                  dateStyle: "medium",
                  timeStyle: "short",
                },
              )}
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
              onClick={() =>
                router.push(`/animals/${row.original.animal_id}/update`)
              }
              className="inline-flex items-center gap-2 rounded-lg border border-natural-muted px-3 py-2 text-sm font-medium text-forest-deep transition hover:bg-natural-muted/30"
            >
              <Pencil size={15} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDeleteAnimal(row.original);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger-soft"
            >
              <Trash2 size={15} />
              Hapus
            </button>
          </div>
        ),
      },
    ],
    [latestGpsByDevice, router],
  );

  const activeCount = animals.filter(
    (animal) => animal.is_active,
  ).length;

  const sourceError =
    animalQuery.error ?? speciesQuery.error ?? gpsQuery.error;

  if (sourceError) {
    const error = toApiErrorState(sourceError);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => {
          void animalQuery.refetch();
          void speciesQuery.refetch();
          void gpsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Master Data"
        title="Data Satwa"
        description="Pantau individu satwa, informasi spesies, dan aktivitas pelacakan di Taman Nasional Gunung Leuser."
        actions={
          <Button
            icon={<Plus className="size-4" />}
            onClick={() => router.push("/animals/create")}
          >
            Tambah Satwa
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Satwa"
          value={isLoading ? "..." : String(animals.length)}
          hint="Seluruh individu terdaftar"
          icon={<PawPrint className="size-5" />}
        />
        <StatCard
          label="Satwa Terpantau"
          value={isLoading ? "..." : String(activeCount)}
          hint="Status aktif menurut data satwa"
          tone="positive"
          icon={<Radio className="size-5" />}
        />
        <StatCard
          label="Total Spesies"
          value={speciesQuery.isLoading ? "..." : String(speciesList.length)}
          hint="Jenis spesies terdaftar"
          icon={<Trees className="size-5" />}
        />
      </div>

      <section className="ui-panel">
        <div className="border-b border-line bg-surface-muted px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-soft p-2 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Cari dan Filter Satwa</h2>
              <p className="mt-1 text-sm text-muted">
                Temukan data berdasarkan kode, spesies, atau status.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <DataFilters
            fields={filterFields}
            values={filters}
            onFilterChange={(values) =>
              setFilters((previous) => ({
                ...previous,
                ...values,
              }))
            }
            onReset={() =>
              setFilters({ ...INITIAL_FILTERS })
            }
          />
        </div>
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-ink">Daftar Individu Satwa</h2>
            <p className="mt-1 text-sm text-muted">
              Menampilkan {filteredAnimals.length} dari {animals.length} data satwa.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark">
            <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
            Data API
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <DataTable
            data={filteredAnimals}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => String(row.animal_id)}
            label="daftar satwa"
            emptyTitle="Belum ada satwa"
            emptyDescription="Tidak ada satwa yang cocok dengan filter saat ini."
          />
        </div>
      </section>

      <ConfirmationDialog
        open={selectedDeleteAnimal !== null}
        title="Hapus Data Satwa?"
        description={
          <>
            <p>Apakah kamu yakin ingin menghapus satwa berikut?</p>
            <p className="mt-2 rounded-lg bg-natural-muted/30 p-3 text-sm font-semibold text-olive-dark">
              {selectedDeleteAnimal?.animal_code}
            </p>
            <p className="mt-3 text-xs text-danger">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </>
        }
        isPending={deleteAnimalMutation.isPending}
        error={
          deleteAnimalMutation.isError
            ? formatApiError(
                deleteAnimalMutation.error,
                "Gagal menghapus data satwa. Silakan coba lagi.",
              )
            : null
        }
        onConfirm={handleDeleteAnimal}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
