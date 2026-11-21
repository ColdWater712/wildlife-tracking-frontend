
"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { DataFilters } from "@/components/ui/data-filters";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";

import { getSpeciesColumns } from "@/components/shared/species/columns";

import {
  CONSERVATION_OPTIONS,
  DEFAULT_SPECIES_FILTERS,
} from "@/components/shared/species/filter";

import {
  useSpecies,
  useSpeciesDelete,
} from "@/hooks/use-species";

import { useToast } from "@/components/providers/toast-provider";
import { formatApiError, toApiErrorState } from "@/services/api";

import type {
  TYPE_CONSERVATION_STATUS,
  TYPE_SPECIES,
} from "@/types/species.type";

export function SpeciesListView() {
  const router = useRouter();
  const { showToast } = useToast();

  const [filters, setFilters] = useState(DEFAULT_SPECIES_FILTERS);

  const [selectedDeleteSpecies, setSelectedDeleteSpecies] =
    useState<TYPE_SPECIES | null>(null);

  const debouncedSearch = useDebounce(filters.search, 500);

  const params = useMemo(
    () => ({
      page: 1,
      per_page: 25,
      search: debouncedSearch,
      conservation_status:
        filters.conservation_status === "all"
          ? undefined
          : (filters.conservation_status as TYPE_CONSERVATION_STATUS),
    }),
    [debouncedSearch, filters.conservation_status],
  );

  const query = useSpecies(params);

  const deleteMutation = useSpeciesDelete(
    selectedDeleteSpecies?.species_id ?? 0,
  );

  const columns = useMemo(
    () =>
      getSpeciesColumns({
        onEdit: (species) => {
          router.push(`/species/${species.species_id}/update`);
        },
        onDelete: (species) => {
          setSelectedDeleteSpecies(species);
        },
      }),
    [router],
  );

  const handleRowClick = useCallback(
    (row: TYPE_SPECIES) => {
      router.push(
        `/species/${row.species_id}/detail`,
      );
    },
    [router],
  );

  const closeDeleteDialog = () => {
    if (deleteMutation.isPending) return;

    setSelectedDeleteSpecies(null);
    deleteMutation.reset();
  };

  const handleDeleteSpecies = () => {
    if (!selectedDeleteSpecies) return;

    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        showToast("Spesies berhasil dihapus.", "success");
        setSelectedDeleteSpecies(null);
      },
      onError: (error) => {
        showToast(
          formatApiError(error, "Gagal menghapus spesies. Silakan coba lagi."),
          "error",
        );
      },
    });
  };

  if (query.isPending) {
    return (
      <DataTable
        data={[]}
        columns={columns}
        loading
        label="daftar spesies"
      />
    );
  }

  if (query.isError) {
    const error = toApiErrorState(query.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const items: TYPE_SPECIES[] = query.data?.data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Master Data"
        title="Data Spesies"
        description="Kelola informasi spesies satwa endemik Taman Nasional Gunung Leuser beserta status konservasinya."
        actions={
          <Button
            icon={<Plus className="size-4" />}
            onClick={() => router.push("/species/create")}
          >
            Tambah Spesies
          </Button>
        }
      />

      <section className="ui-panel">
        <div className="border-b border-line bg-surface-muted px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-soft p-2 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-ink">Cari dan Filter Spesies</h2>
              <p className="mt-1 text-sm text-muted">
                Cari berdasarkan nama umum, nama ilmiah, atau status konservasi.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <DataFilters
            fields={[
              {
                key: "search",
                kind: "search",
                label: "Cari Spesies",
                placeholder: "Nama umum atau ilmiah",
              },
              {
                key: "conservation_status",
                kind: "select",
                label: "Status Konservasi",
                options: CONSERVATION_OPTIONS,
              },
            ]}
            values={filters}
            onFilterChange={(values) =>
              setFilters({
                ...DEFAULT_SPECIES_FILTERS,
                ...values,
              })
            }
            onReset={() =>
              setFilters(DEFAULT_SPECIES_FILTERS)
            }
          />
        </div>
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-ink">Daftar Spesies</h2>
            <p className="mt-1 text-sm text-muted">
              Menampilkan {items.length} spesies pada halaman ini.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark">
            <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
            Data API
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <DataTable
            data={items}
            columns={columns}
            loading={query.isFetching}
            onRowClick={handleRowClick}
            getRowId={(row) => String(row.species_id)}
            label="daftar spesies"
            emptyTitle="Belum ada spesies"
            emptyDescription="Tidak ada spesies yang cocok dengan filter saat ini."
          />
        </div>
      </section>

      <ConfirmationDialog
        open={selectedDeleteSpecies !== null}
        title="Hapus Data Spesies?"
        description={
          <>
            <p>Apakah kamu yakin ingin menghapus spesies berikut?</p>
            <div className="mt-2 rounded-lg bg-zinc-50 p-3">
              <p className="text-sm font-semibold text-zinc-800">
                {selectedDeleteSpecies?.common_name}
              </p>
              <p className="text-xs italic text-zinc-500">
                {selectedDeleteSpecies?.scientific_name}
              </p>
            </div>
            <p className="mt-3 text-xs text-red-600">
              Tindakan ini tidak dapat dibatalkan. Penghapusan juga dapat
              ditolak backend jika spesies masih memiliki data satwa terkait.
            </p>
          </>
        }
        isPending={deleteMutation.isPending}
        error={
          deleteMutation.isError
            ? formatApiError(
                deleteMutation.error,
                "Gagal menghapus spesies. Silakan coba lagi.",
              )
            : null
        }
        onConfirm={handleDeleteSpecies}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
