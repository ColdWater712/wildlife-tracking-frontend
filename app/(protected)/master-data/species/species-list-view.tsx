
"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Leaf,
  SlidersHorizontal,
  Plus,
  X,
  Trash2,
} from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { DataFilters } from "@/components/ui/data-filters";
import { ErrorState } from "@/components/ui/error-state";

import { getSpeciesColumns } from "@/app/(protected)/master-data/species/columns";

import {
  CONSERVATION_OPTIONS,
  DEFAULT_SPECIES_FILTERS,
} from "@/app/(protected)/master-data/species/filter";

import {
  useSpecies,
  useSpeciesCreate,
  useSpeciesUpdate,
  useSpeciesDelete,
} from "@/hooks/species.hook";

import { useAnimals } from "@/hooks/animal.hook";

import { useToast } from "@/components/providers/toast-provider";
import { toApiErrorState } from "@/services/api-client";

import type {
  TYPE_CONSERVATION_STATUS,
  TYPE_SPECIES,
  TYPE_SPECIES_PAYLOAD,
} from "@/types/species.type";

const INITIAL_SPECIES_FORM: TYPE_SPECIES_PAYLOAD = {
  common_name: "",
  scientific_name: "",
  conservation_status: "Vulnerable",
};

export function SpeciesListView() {
  const router = useRouter();
  const { showToast } = useToast();

  const [filters, setFilters] = useState(DEFAULT_SPECIES_FILTERS);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] =
    useState<TYPE_SPECIES | null>(null);

  const [selectedDeleteSpecies, setSelectedDeleteSpecies] =
    useState<TYPE_SPECIES | null>(null);

  const [formData, setFormData] =
    useState<TYPE_SPECIES_PAYLOAD>(INITIAL_SPECIES_FORM);

  const [formError, setFormError] = useState("");

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
  const animalQuery = useAnimals();

  const createMutation = useSpeciesCreate();
  const updateMutation = useSpeciesUpdate(
    selectedSpecies?.species_id ?? 0,
  );
  const deleteMutation = useSpeciesDelete(
    selectedDeleteSpecies?.species_id ?? 0,
  );

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  const columns = useMemo(
    () =>
      getSpeciesColumns({
        onEdit: (species) => {
          setSelectedDeleteSpecies(null);
          setSelectedSpecies(species);
          setFormData({
            common_name: species.common_name,
            scientific_name: species.scientific_name,
            conservation_status: species.conservation_status,
          });
          setFormError("");
          setIsFormOpen(true);
        },
        onDelete: (species) => {
          setSelectedDeleteSpecies(species);
        },
      }),
    [],
  );

  const handleRowClick = useCallback(
    (row: TYPE_SPECIES) => {
      router.push(
        `/master-data/species/${row.species_id}/detail`,
      );
    },
    [router],
  );

  const closeForm = () => {
    if (isSaving) return;

    setIsFormOpen(false);
    setSelectedSpecies(null);
    setFormData(INITIAL_SPECIES_FORM);
    setFormError("");
    createMutation.reset();
    updateMutation.reset();
  };

  const openCreateForm = () => {
    setSelectedSpecies(null);
    setSelectedDeleteSpecies(null);
    setFormData(INITIAL_SPECIES_FORM);
    setFormError("");
    setIsFormOpen(true);
  };

  const handleFormSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFormError("");

    const payload: TYPE_SPECIES_PAYLOAD = {
      common_name: formData.common_name.trim(),
      scientific_name: formData.scientific_name.trim(),
      conservation_status: formData.conservation_status,
    };

    if (
      !payload.common_name ||
      !payload.scientific_name
    ) {
      setFormError("Nama umum dan nama ilmiah wajib diisi.");
      return;
    }

    const mutation = selectedSpecies
      ? updateMutation
      : createMutation;

    mutation.mutate(payload, {
      onSuccess: () => {
        showToast(
          selectedSpecies
            ? "Data spesies berhasil diperbarui."
            : "Spesies berhasil ditambahkan.",
          "success",
        );

        setIsFormOpen(false);
        setSelectedSpecies(null);
        setFormData(INITIAL_SPECIES_FORM);
        setFormError("");
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : selectedSpecies
              ? "Gagal memperbarui spesies."
              : "Gagal menambahkan spesies.";

        setFormError(errorMessage);
        showToast(errorMessage, "error");
      },
    });
  };

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
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Gagal menghapus spesies. Silakan coba lagi.";

        showToast(errorMessage, "error");
      },
    });
  };

  if (query.isPending || animalQuery.isPending) {
    return (
      <DataTable
        data={[]}
        columns={columns}
        loading
        label="daftar spesies"
      />
    );
  }

  if (query.isError || animalQuery.isError) {
    const error = toApiErrorState(
      query.error ?? animalQuery.error,
    );

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => {
          void query.refetch();
          void animalQuery.refetch();
        }}
      />
    );
  }

  const speciesItems = query.data?.data?.items ?? [];
  const animalItems = animalQuery.data?.data?.items ?? [];

  const items: TYPE_SPECIES[] = speciesItems.map(
    (species) => ({
      ...species,
      animal_count: animalItems.filter(
        (animal) => animal.species_id === species.species_id,
      ).length,
    }),
  );

  return (
    <div className="min-h-full space-y-6 bg-[#F7F9F6] p-1">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#E5F0E7] p-2 text-[#174C35]">
            <Leaf size={22} />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#174C35]">
            Data Spesies
          </h2>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-zinc-600">
          Kelola informasi spesies satwa endemik Taman Nasional
          Gunung Leuser beserta status konservasinya.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#DDE8DE] bg-white shadow-sm">
        <div className="border-b border-[#E7EEE7] bg-[#F4F8F3] px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[#E1EDE2] p-2 text-[#286747]">
              <SlidersHorizontal size={20} />
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#174C35]">
                Cari dan Filter Spesies
              </h3>

              <p className="mt-1 text-sm leading-5 text-zinc-600">
                Cari berdasarkan nama umum, nama ilmiah,
                atau status konservasi.
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

      <section className="overflow-hidden rounded-2xl border border-[#DDE8DE] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E7EEE7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-[#174C35]">
              Daftar Spesies
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Menampilkan {items.length} spesies pada halaman ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D8E8DA] bg-[#F0F7F0] px-3 py-1.5 text-xs font-medium text-[#286747]">
              <span className="h-2 w-2 rounded-full bg-[#43845A]" />
              Data API
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#286747] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174C35]"
            >
              <Plus size={16} />
              Tambah Spesies
            </button>
          </div>
        </div>

        <div className="p-0">
          <DataTable
            data={items}
            columns={columns}
            loading={
              query.isFetching || animalQuery.isFetching
            }
            onRowClick={handleRowClick}
            getRowId={(row) => String(row.species_id)}
            label="daftar spesies"
            emptyTitle="Belum ada spesies"
            emptyDescription="Tidak ada spesies yang cocok dengan filter saat ini."
          />
        </div>
      </section>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="species-form-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="species-form-title"
                className="text-lg font-bold text-[#174C35]"
              >
                {selectedSpecies
                  ? "Edit Data Spesies"
                  : "Tambah Spesies Baru"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                aria-label="Tutup form"
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="common_name"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Nama Umum
                </label>

                <input
                  id="common_name"
                  type="text"
                  value={formData.common_name}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      common_name: event.target.value,
                    }))
                  }
                  required
                  maxLength={255}
                  placeholder="Contoh: Harimau Sumatra"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#286747] focus:ring-2 focus:ring-[#286747]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="scientific_name"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Nama Ilmiah
                </label>

                <input
                  id="scientific_name"
                  type="text"
                  value={formData.scientific_name}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      scientific_name: event.target.value,
                    }))
                  }
                  required
                  maxLength={255}
                  placeholder="Contoh: Panthera tigris sumatrae"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm italic outline-none transition focus:border-[#286747] focus:ring-2 focus:ring-[#286747]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="conservation_status"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Status Konservasi
                </label>

                <select
                  id="conservation_status"
                  value={formData.conservation_status}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      conservation_status:
                        event.target.value as TYPE_CONSERVATION_STATUS,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#286747] focus:ring-2 focus:ring-[#286747]/10"
                >
                  <option value="Critically Endangered">
                    Kritis (Critically Endangered)
                  </option>
                  <option value="Endangered">
                    Terancam (Endangered)
                  </option>
                  <option value="Vulnerable">
                    Rentan (Vulnerable)
                  </option>
                </select>
              </div>

              {formError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSaving}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-[#286747] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174C35] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving
                    ? "Menyimpan..."
                    : selectedSpecies
                      ? "Simpan Perubahan"
                      : "Tambah Spesies"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDeleteSpecies && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-species-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3 text-red-600">
                <Trash2 size={22} />
              </div>

              <h2
                id="delete-species-title"
                className="text-lg font-bold text-zinc-800"
              >
                Hapus Data Spesies?
              </h2>
            </div>

            <p className="mb-2 text-sm leading-6 text-zinc-600">
              Apakah kamu yakin ingin menghapus spesies berikut?
            </p>

            <div className="mb-4 rounded-lg bg-zinc-50 p-3">
              <p className="text-sm font-semibold text-zinc-800">
                {selectedDeleteSpecies.common_name}
              </p>
              <p className="text-xs italic text-zinc-500">
                {selectedDeleteSpecies.scientific_name}
              </p>
            </div>

            <p className="mb-5 text-xs text-red-600">
              Tindakan ini tidak dapat dibatalkan. Penghapusan
              juga dapat ditolak backend jika spesies masih
              memiliki data satwa terkait.
            </p>

            {deleteMutation.isError && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {deleteMutation.error instanceof Error
                  ? deleteMutation.error.message
                  : "Gagal menghapus spesies. Silakan coba lagi."}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={deleteMutation.isPending}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeleteSpecies}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={15} />
                {deleteMutation.isPending
                  ? "Menghapus..."
                  : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
