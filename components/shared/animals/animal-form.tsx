"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";

import {
  useAnimalCreate,
  useAnimalUpdate,
} from "@/hooks/use-animals";
import { useSpecies } from "@/hooks/use-species";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { FormActions, FormAlert } from "@/components/ui/form";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { formatApiError, getApiFieldErrors } from "@/services/api";
import type {
  TYPE_ANIMAL,
  TYPE_ANIMAL_GENDER,
  TYPE_ANIMAL_PAYLOAD_GENDER,
} from "@/types/animal.type";

type AnimalFormProps = {
  animal?: TYPE_ANIMAL | null;
  onSuccess: () => void;
  onCancel: () => void;
  standalone?: boolean;
};

type AnimalFormState = {
  species_id: number;
  animal_code: string;
  birth_date: string | null;
  gender: TYPE_ANIMAL_GENDER;
  is_active: boolean;
};

type AnimalFieldErrors = Partial<Record<keyof AnimalFormState, string>>;

const INITIAL_FORM: AnimalFormState = {
  species_id: 0,
  animal_code: "",
  birth_date: null,
  gender: "Jantan",
  is_active: true,
};

const ANIMAL_FIELDS: (keyof AnimalFormState)[] = [
  "species_id",
  "animal_code",
  "birth_date",
  "gender",
  "is_active",
];

const animalSchema = z.object({
  species_id: z.number().int().positive("Silakan pilih spesies satwa."),
  animal_code: z
    .string()
    .trim()
    .min(1, "Kode satwa wajib diisi.")
    .max(100, "Kode satwa maksimal 100 karakter."),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir tidak valid.")
    .refine((value) => {
      const selected = new Date(`${value}T00:00:00`);
      if (Number.isNaN(selected.getTime())) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected <= today;
    }, "Tanggal lahir tidak boleh melebihi hari ini.")
    .nullable(),
  gender: z
    .string()
    .refine(
      (value): value is TYPE_ANIMAL_PAYLOAD_GENDER =>
        value === "Jantan" || value === "Betina",
      "Backend hanya menerima jenis kelamin Jantan atau Betina.",
    ),
  is_active: z.boolean(),
});

const mapFieldErrors = (
  errors: Record<string, string>,
): AnimalFieldErrors => {
  const mapped: AnimalFieldErrors = {};

  for (const field of ANIMAL_FIELDS) {
    if (errors[field]) mapped[field] = errors[field];
  }

  if (errors.name) mapped.animal_code = errors.name;

  return mapped;
};

const todayInputValue = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function AnimalForm({
  animal,
  onSuccess,
  onCancel,
  standalone = false,
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
    useState<AnimalFormState>(() => ({
      species_id: animal?.species_id ?? INITIAL_FORM.species_id,
      animal_code: animal?.animal_code ?? "",
      birth_date: animal?.birth_date
        ? animal.birth_date.slice(0, 10)
        : null,
      gender: animal?.gender ?? INITIAL_FORM.gender,
      is_active: animal?.is_active ?? INITIAL_FORM.is_active,
    }));

  const [validationError, setValidationError] =
    useState<string | null>(null);
  const [fieldErrors, setFieldErrors] =
    useState<AnimalFieldErrors>({});

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

    if (isPending) return;

    setValidationError(null);
    setFieldErrors({});

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

    const parsed = animalSchema.safeParse(form);

    if (!parsed.success) {
      const nextErrors: AnimalFieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = String(
          issue.path[0] ?? "",
        ) as keyof AnimalFormState;

        if (ANIMAL_FIELDS.includes(field)) {
          nextErrors[field] = issue.message;
        }
      }

      setFieldErrors(nextErrors);
      setValidationError(
        parsed.error.issues[0]?.message ??
          "Periksa kembali isian form.",
      );
      return;
    }

    if (
      !species.some(
        (item) => item.species_id === parsed.data.species_id,
      )
    ) {
      setValidationError(
        "Spesies yang dipilih tidak valid.",
      );
      return;
    }

    try {
      if (animal) {
        await updateMutation.mutateAsync(parsed.data);

        showToast(
          "Data satwa berhasil diperbarui.",
          "success",
        );
      } else {
        await createMutation.mutateAsync(parsed.data);

        showToast(
          "Satwa berhasil ditambahkan.",
          "success",
        );
      }

      onSuccess();
    } catch (error) {
      setFieldErrors(mapFieldErrors(getApiFieldErrors(error)));
      showToast(
        formatApiError(error, "Gagal menyimpan data satwa. Silakan coba lagi."),
        "error",
      );
    }
  };

  const formNode = (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
    >
      <div>
        <label
          htmlFor="animal-species"
          className="ui-label"
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
            setFieldErrors((previous) => ({
              ...previous,
              species_id: undefined,
            }));
          }}
          disabled={speciesQuery.isLoading || isPending}
          aria-invalid={fieldErrors.species_id !== undefined}
          className="ui-input"
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

        {fieldErrors.species_id ? (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {fieldErrors.species_id}
          </p>
        ) : null}

        {speciesQuery.isLoading ? (
          <p className="mt-1 text-xs text-zinc-500">
            Memuat daftar spesies...
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="animal-code"
          className="ui-label"
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
            setFieldErrors((previous) => ({
              ...previous,
              animal_code: undefined,
            }));
          }}
          placeholder="Contoh: ORN-01"
          disabled={isPending}
          aria-invalid={fieldErrors.animal_code !== undefined}
          className="ui-input"
        />

        {fieldErrors.animal_code ? (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {fieldErrors.animal_code}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="animal-birth-date"
          className="ui-label"
        >
          Tanggal Lahir
        </label>

        <input
          id="animal-birth-date"
          type="date"
          max={todayInputValue()}
          value={form.birth_date ?? ""}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              birth_date: event.target.value || null,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              birth_date: undefined,
            }));
          }}
          disabled={isPending}
          aria-invalid={fieldErrors.birth_date !== undefined}
          className="ui-input"
        />

        {fieldErrors.birth_date ? (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {fieldErrors.birth_date}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="animal-gender"
          className="ui-label"
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
              gender: event.target.value as TYPE_ANIMAL_GENDER,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              gender: undefined,
            }));
          }}
          disabled={isPending}
          aria-invalid={fieldErrors.gender !== undefined}
          className="ui-input"
        >
          <option value="Jantan">Jantan</option>
          <option value="Betina">Betina</option>
          <option value="Tidak Diketahui">Tidak Diketahui</option>
        </select>

        {fieldErrors.gender ? (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {fieldErrors.gender}
          </p>
        ) : null}
      </div>

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
              setValidationError(null);
              setFieldErrors((previous) => ({
                ...previous,
                is_active: undefined,
              }));
            }}
            disabled={isPending}
          />
          Status aktif
        </label>

        {fieldErrors.is_active ? (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {fieldErrors.is_active}
          </p>
        ) : null}
      </div>

      {validationError ? <FormAlert message={validationError} /> : null}

      {mutationError ? (
        <FormAlert
          message={formatApiError(
            mutationError,
            "Gagal menyimpan data satwa. Silakan coba lagi.",
          )}
        />
      ) : null}

      <FormActions>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Batal
        </Button>
        <Button
          type="submit"
          loading={isPending}
          disabled={speciesQuery.isLoading || speciesQuery.isError}
        >
          {isPending
            ? "Menyimpan..."
            : isEditMode
              ? "Simpan Perubahan"
              : "Simpan Satwa"}
        </Button>
      </FormActions>
    </form>
  );

  if (standalone) {
    return (
      <Panel>
        <SectionHeader
          title={isEditMode ? "Ubah Satwa" : "Tambah Satwa"}
          description="Data satwa akan disimpan ke backend Laravel."
        />
        {formNode}
      </Panel>
    );
  }

  return formNode;
}
