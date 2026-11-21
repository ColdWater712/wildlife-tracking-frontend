"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";

import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import {
  FormActions,
  FormAlert,
  FormField,
  FormGrid,
  FormSection,
  SelectInput,
  TextInput,
} from "@/components/ui/form";
import {
  useSpeciesCreate,
  useSpeciesUpdate,
} from "@/hooks/use-species";
import {
  firstIssueMessage,
  issuesToFieldErrors,
  type FormErrors,
} from "@/lib/form";
import { formatApiError, getApiFieldErrors } from "@/services/api";
import type { TYPE_SPECIES, TYPE_SPECIES_PAYLOAD } from "@/types/species.type";
import {
  TYPE_CONSERVATION_STATUS_LABELS,
  TYPE_CONSERVATION_STATUSES,
} from "@/types/species.type";

type SpeciesFormProps = {
  species: TYPE_SPECIES | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type FieldName = keyof TYPE_SPECIES_PAYLOAD;

const INITIAL_SPECIES_FORM: TYPE_SPECIES_PAYLOAD = {
  common_name: "",
  scientific_name: "",
  conservation_status: "Vulnerable",
};

const SPECIES_FIELDS: FieldName[] = [
  "common_name",
  "scientific_name",
  "conservation_status",
];

const speciesSchema = z.object({
  common_name: z
    .string()
    .trim()
    .min(1, "Nama umum wajib diisi.")
    .max(100, "Nama umum maksimal 100 karakter."),
  scientific_name: z
    .string()
    .trim()
    .min(1, "Nama ilmiah wajib diisi.")
    .max(150, "Nama ilmiah maksimal 150 karakter."),
  conservation_status: z
    .string()
    .refine(
      (value) =>
        TYPE_CONSERVATION_STATUSES.includes(
          value as TYPE_SPECIES_PAYLOAD["conservation_status"],
        ),
      "Status konservasi tidak valid.",
    ),
});

export function SpeciesForm({
  species,
  onSuccess,
  onCancel,
}: SpeciesFormProps) {
  const isEditMode = Boolean(species);
  const { showToast } = useToast();
  const createMutation = useSpeciesCreate();
  const updateMutation = useSpeciesUpdate(species?.species_id ?? 0);

  const [form, setForm] = useState<TYPE_SPECIES_PAYLOAD>(() =>
    species
      ? {
          common_name: species.common_name,
          scientific_name: species.scientific_name,
          conservation_status: species.conservation_status,
        }
      : INITIAL_SPECIES_FORM,
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors<FieldName>>({});

  const isPending =
    createMutation.isPending || updateMutation.isPending;
  const mutationError = isEditMode
    ? updateMutation.error
    : createMutation.error;
  const summaryMessage =
    validationError ??
    (mutationError
      ? formatApiError(
          mutationError,
          isEditMode
            ? "Gagal memperbarui spesies."
            : "Gagal menambahkan spesies.",
        )
      : null);

  const setField = <K extends FieldName>(key: K, value: TYPE_SPECIES_PAYLOAD[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setValidationError(null);
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) return;

    setValidationError(null);
    setFieldErrors({});

    const parsed = speciesSchema.safeParse(form);

    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues, SPECIES_FIELDS));
      setValidationError(
        firstIssueMessage(parsed.error.issues, "Periksa kembali isian form."),
      );
      return;
    }

    const payload = parsed.data as TYPE_SPECIES_PAYLOAD;

    try {
      const response = isEditMode
        ? await updateMutation.mutateAsync(payload)
        : await createMutation.mutateAsync(payload);

      showToast(
        response.message ??
          (isEditMode
            ? "Data spesies berhasil diperbarui."
            : "Spesies berhasil ditambahkan."),
        "success",
      );
      onSuccess();
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error) as FormErrors<FieldName>);
      showToast(
        formatApiError(
          error,
          isEditMode
            ? "Gagal memperbarui spesies."
            : "Gagal menambahkan spesies.",
        ),
        "error",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormSection
        title="Identitas Spesies"
        description="Gunakan nama umum dan nama ilmiah sesuai data taksonomi."
      >
        <FormGrid>
          <FormField
            label="Nama Umum"
            htmlFor="common_name"
            required
            error={fieldErrors.common_name}
          >
            <TextInput
              id="common_name"
              required
              maxLength={100}
              value={form.common_name}
              onChange={(event) => setField("common_name", event.target.value)}
              placeholder="Contoh: Harimau Sumatra"
              invalid={fieldErrors.common_name !== undefined}
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Nama Ilmiah"
            htmlFor="scientific_name"
            required
            error={fieldErrors.scientific_name}
          >
            <TextInput
              id="scientific_name"
              required
              maxLength={150}
              value={form.scientific_name}
              onChange={(event) =>
                setField("scientific_name", event.target.value)
              }
              placeholder="Contoh: Panthera tigris sumatrae"
              invalid={fieldErrors.scientific_name !== undefined}
              disabled={isPending}
              className="italic"
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection
        title="Klasifikasi"
        description="Status konservasi mengikuti kategori yang digunakan backend."
      >
        <FormField
          label="Status Konservasi"
          htmlFor="conservation_status"
          required
          error={fieldErrors.conservation_status}
        >
          <SelectInput
            id="conservation_status"
            required
            value={form.conservation_status}
            onChange={(event) =>
              setField(
                "conservation_status",
                event.target.value as TYPE_SPECIES_PAYLOAD["conservation_status"],
              )
            }
            invalid={fieldErrors.conservation_status !== undefined}
            disabled={isPending}
          >
            {TYPE_CONSERVATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TYPE_CONSERVATION_STATUS_LABELS[status]}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </FormSection>

      {summaryMessage ? <FormAlert message={summaryMessage} /> : null}

      <FormActions>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Batal
        </Button>
        <Button type="submit" loading={isPending}>
          {isPending
            ? "Menyimpan..."
            : isEditMode
              ? "Simpan Perubahan"
              : "Tambah Spesies"}
        </Button>
      </FormActions>
    </form>
  );
}
