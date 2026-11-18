
"use client";

import { useEffect, useState } from "react";
import { useAnimalCreate, useAnimalUpdate } from "@/hooks/animal.hook";
import { useSpecies } from "@/hooks/species.hook";
import type { TYPE_ANIMAL, TYPE_ANIMAL_PAYLOAD } from "@/types/animal.type";

type AnimalFormProps = {
  animal?: TYPE_ANIMAL | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function AnimalForm({
  animal,
  onSuccess,
  onCancel,
}: AnimalFormProps) {
  const isEditMode = Boolean(animal);

  const createMutation = useAnimalCreate();
  const updateMutation = useAnimalUpdate(animal?.animal_id ?? 0);
  const speciesQuery = useSpecies();

  const species = speciesQuery.data?.data?.items ?? [];

  const [form, setForm] = useState<TYPE_ANIMAL_PAYLOAD>({
    species_id: 0,
    animal_code: "",
    birth_date: null,
    gender: "Tidak Diketahui",
    is_active: true,
  });

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
      setForm({
        species_id: 0,
        animal_code: "",
        birth_date: null,
        gender: "Tidak Diketahui",
        is_active: true,
      });
    }
  }, [animal]);

  const isPending =
    createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      if (animal) {
        await updateMutation.mutateAsync(form);
      } else {
        await createMutation.mutateAsync(form);
      }

      onSuccess();
    } catch {
      // Error ditampilkan melalui state mutation.
    }
  };

  const mutationError = isEditMode
    ? updateMutation.error
    : createMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          Spesies
        </label>

        <select
          required
          value={form.species_id || ""}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              species_id: Number(event.target.value),
            }))
          }
          className="w-full rounded-lg border px-3 py-2"
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
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Kode Satwa
        </label>

        <input
          required
          maxLength={100}
          value={form.animal_code}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              animal_code: event.target.value,
            }))
          }
          placeholder="Contoh: SATWA-999"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Tanggal Lahir
        </label>

        <input
          type="date"
          value={form.birth_date ?? ""}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              birth_date: event.target.value || null,
            }))
          }
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Jenis Kelamin
        </label>

        <select
          required
          value={form.gender}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              gender: event.target.value as TYPE_ANIMAL_PAYLOAD["gender"],
            }))
          }
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="Jantan">Jantan</option>
          <option value="Betina">Betina</option>
          <option value="Tidak Diketahui">
            Tidak Diketahui
          </option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                is_active: event.target.checked,
              }))
            }
          />
          Status aktif
        </label>
      </div>

      {speciesQuery.isError && (
        <p className="text-sm text-red-600">
          Gagal mengambil daftar spesies.
        </p>
      )}

      {mutationError && (
        <p className="text-sm text-red-600">
          {mutationError.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isPending || speciesQuery.isLoading}
          className="rounded-lg bg-[#286747] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
