
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  useAnimalCreate,
  useAnimalUpdate,
} from "@/hooks/animal.hook";
import { useSpecies } from "@/hooks/species.hook";
import { useToast } from "@/components/providers/toast-provider";
import type {
  TYPE_ANIMAL,
  TYPE_ANIMAL_PAYLOAD,
} from "@/types/animal.type";

type AnimalFormProps = {
  animal?: TYPE_ANIMAL | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const INITIAL_FORM: TYPE_ANIMAL_PAYLOAD = {
  species_id: 0,
  animal_code: "",
  birth_date: null,
  gender: "Tidak Diketahui",
  is_active: true,
};

export function AnimalForm({
  animal,
  onSuccess,
  onCancel,
}: AnimalFormProps) {
  const isEditMode = Boolean(animal);

  const { showToast } = useToast();

  const createMutation = useAnimalCreate();
  const updateMutation = useAnimalUpdate(
    animal?.animal_id ?? 0,
  );
  const speciesQuery = useSpecies();

  const species = speciesQuery.data?.data?.items ?? [];

  const [form, setForm] =
    useState<TYPE_ANIMAL_PAYLOAD>(INITIAL_FORM);

  const [validationError, setValidationError] =
    useState<string | null>(null);

  useEffect(() => {
    if (animal) {
      setForm({
        species_id: animal.species_id,
        animal_code: animal.animal_code,
        birth_date: animal.birth_date
          ? animal.birth_date.slice(0, 10)
          : null,
        gender: animal.gender,
        is_active: animal.is_active,
      });
    } else {
      setForm({ ...INITIAL_FORM });
    }

    setValidationError(null);
    createMutation.reset();
    updateMutation.reset();
  }, [animal]);

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending;

  const mutationError = isEditMode
    ? updateMutation.error
    : createMutation.error;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setValidationError(null);

    const animalCode = form.animal_code.trim();

    // Validasi spesies
    if (!form.species_id || form.species_id <= 0) {
      setValidationError("Silakan pilih spesies satwa.");
      return;
    }

    // Validasi kode satwa
    if (!animalCode) {
      setValidationError("Kode satwa wajib diisi.");
      return;
    }

    if (animalCode.length > 100) {
      setValidationError(
        "Kode satwa maksimal 100 karakter.",
      );
      return;
    }

    // Validasi spesies yang dipilih
    if (
      !species.some(
        (item) => item.species_id === form.species_id,
      )
    ) {
      setValidationError(
        "Spesies yang dipilih tidak valid.",
      );
      return;
    }

    // Validasi tanggal lahir
    if (form.birth_date) {
      const selectedDate = new Date(
        `${form.birth_date}T00:00:00`,
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (
        Number.isNaN(selectedDate.getTime()) ||
        selectedDate > today
      ) {
        setValidationError(
          "Tanggal lahir tidak boleh melebihi hari ini.",
        );
        return;
      }
    }

    // Validasi jenis kelamin
    if (
      !["Jantan", "Betina", "Tidak Diketahui"].includes(
        form.gender,
      )
    ) {
      setValidationError(
        "Silakan pilih jenis kelamin yang valid.",
      );
      return;
    }

    // Validasi status pengambilan data spesies
    if (speciesQuery.isLoading) {
      setValidationError(
        "Daftar spesies masih dimuat. Silakan tunggu.",
      );
      return;
    }

    if (speciesQuery.isError) {
      setValidationError(
        "Gagal mengambil daftar spesies. Silakan coba lagi.",
      );
      return;
    }

    const payload: TYPE_ANIMAL_PAYLOAD = {
      ...form,
      animal_code: animalCode,
    };

    try {
      if (animal) {
        await updateMutation.mutateAsync(payload);

        showToast(
          "Data satwa berhasil diperbarui.",
          "success",
        );
      } else {
        await createMutation.mutateAsync(payload);

        showToast(
          "Satwa berhasil ditambahkan.",
          "success",
        );
      }

      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data satwa. Silakan coba lagi.";

      showToast(errorMessage, "error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
    >
      {/* Spesies */}
      <div>
        <label
          htmlFor="animal-species"
          className="mb-1 block text-sm font-medium"
        >
          Spesies <span className="text-red-500">*</span>
        </label>

        <select
          id="animal-species"
          required
          value={form.species_id || ""}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              species_id: Number(event.target.value),
            }));
            setValidationError(null);
          }}
          disabled={speciesQuery.isLoading || isPending}
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
        >
          <option value="">Pilih spesies</option>

          {species.map((item) => (
            <option
              key={item.species_id}
              value={item.species_id}
            >
              {item.common_name}
            </option>
          ))}
        </select>

        {speciesQuery.isLoading && (
          <p className="mt-1 text-xs text-zinc-500">
            Memuat daftar spesies...
          </p>
        )}
      </div>

      {/* Kode Satwa */}
      <div>
        <label
          htmlFor="animal-code"
          className="mb-1 block text-sm font-medium"
        >
          Kode Satwa <span className="text-red-500">*</span>
        </label>

        <input
          id="animal-code"
          required
          maxLength={100}
          value={form.animal_code}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              animal_code: event.target.value,
            }));
            setValidationError(null);
          }}
          placeholder="Contoh: SATWA-999"
          disabled={isPending}
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
        />
      </div>

      {/* Tanggal Lahir */}
      <div>
        <label
          htmlFor="animal-birth-date"
          className="mb-1 block text-sm font-medium"
        >
          Tanggal Lahir
        </label>

        <input
          id="animal-birth-date"
          type="date"
          max={(() => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(
              today.getMonth() + 1,
            ).padStart(2, "0");
            const day = String(
              today.getDate(),
            ).padStart(2, "0");

            return `${year}-${month}-${day}`;
          })()}
          value={form.birth_date ?? ""}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              birth_date: event.target.value || null,
            }));
            setValidationError(null);
          }}
          disabled={isPending}
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
        />
      </div>

      {/* Jenis Kelamin */}
      <div>
        <label
          htmlFor="animal-gender"
          className="mb-1 block text-sm font-medium"
        >
          Jenis Kelamin{" "}
          <span className="text-red-500">*</span>
        </label>

        <select
          id="animal-gender"
          required
          value={form.gender}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              gender: event.target.value as TYPE_ANIMAL_PAYLOAD["gender"],
            }));
            setValidationError(null);
          }}
          disabled={isPending}
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
        >
          <option value="Jantan">Jantan</option>
          <option value="Betina">Betina</option>
          <option value="Tidak Diketahui">
            Tidak Diketahui
          </option>
        </select>
      </div>

      {/* Status Aktif */}
      <div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                is_active: event.target.checked,
              }));
            }}
            disabled={isPending}
          />
          Status aktif
        </label>
      </div>

      {/* Pesan validasi */}
      {validationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {validationError}
        </div>
      )}

      {/* Pesan error API */}
      {mutationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {mutationError.message ||
            "Gagal menyimpan data satwa. Silakan coba lagi."}
        </div>
      )}

      {/* Tombol */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={
            isPending ||
            speciesQuery.isLoading ||
            speciesQuery.isError
          }
          className="rounded-lg bg-[#286747] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Menyimpan..."
            : isEditMode
              ? "Simpan Perubahan"
              : "Simpan Satwa"}
        </button>
      </div>
    </form>
  );
}
