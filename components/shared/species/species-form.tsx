"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  FormActions,
  FormAlert,
  FormField,
  SelectInput,
  TextInput,
} from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Panel, SectionHeader } from "@/components/ui/panel";
import type {
  TYPE_CONSERVATION_STATUS,
  TYPE_SPECIES,
  TYPE_SPECIES_PAYLOAD,
} from "@/types/species.type";
import {
  TYPE_CONSERVATION_STATUS_LABELS,
  TYPE_CONSERVATION_STATUSES,
} from "@/types/species.type";

type SpeciesFormProps = {
  species: TYPE_SPECIES | null;
  isSaving: boolean;
  errorMessage: string;
  fieldErrors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (payload: TYPE_SPECIES_PAYLOAD) => void;
  standalone?: boolean;
};

const INITIAL_SPECIES_FORM: TYPE_SPECIES_PAYLOAD = {
  common_name: "",
  scientific_name: "",
  conservation_status: "Vulnerable",
};

type FieldErrors = {
  common_name?: string;
  scientific_name?: string;
  conservation_status?: string;
};

const SPECIES_FIELDS: (keyof FieldErrors)[] = [
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
      (value): value is TYPE_CONSERVATION_STATUS =>
        TYPE_CONSERVATION_STATUSES.includes(
          value as TYPE_CONSERVATION_STATUS,
        ),
      "Status konservasi tidak valid.",
    ),
});

export function SpeciesForm({
  species,
  isSaving,
  errorMessage,
  fieldErrors = {},
  onClose,
  onSubmit,
  standalone = false,
}: SpeciesFormProps) {
  const [formData, setFormData] = useState<TYPE_SPECIES_PAYLOAD>(() =>
    species
      ? {
          common_name: species.common_name,
          scientific_name: species.scientific_name,
          conservation_status: species.conservation_status,
        }
      : INITIAL_SPECIES_FORM,
  );
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});

  const errors: FieldErrors = {
    common_name: localErrors.common_name ?? fieldErrors.common_name,
    scientific_name: localErrors.scientific_name ?? fieldErrors.scientific_name,
    conservation_status:
      localErrors.conservation_status ?? fieldErrors.conservation_status,
  };

  const clearError = (field: keyof FieldErrors) => {
    setLocalErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) return;

    const parsed = speciesSchema.safeParse(formData);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = String(
          issue.path[0] ?? "",
        ) as keyof FieldErrors;

        if (SPECIES_FIELDS.includes(field)) {
          nextErrors[field] = issue.message;
        }
      }

      setLocalErrors(nextErrors);
      return;
    }

    setLocalErrors({});
    onSubmit(parsed.data);
  };

  const form = (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        label="Nama Umum"
        htmlFor="common_name"
        required
        error={errors.common_name}
      >
        <TextInput
          id="common_name"
          type="text"
          value={formData.common_name}
          onChange={(event) => {
            setFormData((previous) => ({
              ...previous,
              common_name: event.target.value,
            }));
            clearError("common_name");
          }}
          maxLength={100}
          placeholder="Contoh: Harimau Sumatra"
          invalid={errors.common_name !== undefined}
        />
      </FormField>

      <FormField
        label="Nama Ilmiah"
        htmlFor="scientific_name"
        required
        error={errors.scientific_name}
      >
        <TextInput
          id="scientific_name"
          type="text"
          value={formData.scientific_name}
          onChange={(event) => {
            setFormData((previous) => ({
              ...previous,
              scientific_name: event.target.value,
            }));
            clearError("scientific_name");
          }}
          maxLength={150}
          placeholder="Contoh: Panthera tigris sumatrae"
          invalid={errors.scientific_name !== undefined}
          className="italic"
        />
      </FormField>

      <FormField
        label="Status Konservasi"
        htmlFor="conservation_status"
        required
        error={errors.conservation_status}
      >
        <SelectInput
          id="conservation_status"
          value={formData.conservation_status}
          onChange={(event) => {
            setFormData((previous) => ({
              ...previous,
              conservation_status: event.target
                .value as TYPE_CONSERVATION_STATUS,
            }));
            clearError("conservation_status");
          }}
          invalid={errors.conservation_status !== undefined}
        >
          {TYPE_CONSERVATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TYPE_CONSERVATION_STATUS_LABELS[status]}
            </option>
          ))}
        </SelectInput>
      </FormField>

      {errorMessage !== "" ? <FormAlert message={errorMessage} /> : null}

      <FormActions>
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button type="submit" loading={isSaving}>
          {isSaving
            ? "Menyimpan..."
            : species
              ? "Simpan Perubahan"
              : "Tambah Spesies"}
        </Button>
      </FormActions>
    </form>
  );

  if (standalone) {
    return (
      <Panel>
        <SectionHeader
          title={species ? "Ubah Spesies" : "Tambah Spesies"}
          description="Lengkapi identitas spesies sesuai data taksonomi."
        />
        {form}
      </Panel>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={species ? "Edit Data Spesies" : "Tambah Spesies Baru"}
      description="Lengkapi identitas spesies sesuai data taksonomi."
    >
      {form}
    </Modal>
  );
}
