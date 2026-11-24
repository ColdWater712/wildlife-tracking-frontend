"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/panel";
import { useToast } from "@/components/toast";
import { Button } from "@/components/button";
import {
  FormActions,
  FormAlert,
  FormField,
  FormGrid,
  FormSection,
  SelectInput,
  TextInput,
} from "@/components/form";
import { useSpeciesCreate } from "@/hooks/use-species";
import {
  firstIssueMessage,
  issuesToFieldErrors,
  type FormErrors,
} from "@/lib/form";
import { formatApiError, getApiFieldErrors } from "@/services/api";
import type { TYPE_SPECIES_PAYLOAD } from "@/types/species.type";
import {
  TYPE_CONSERVATION_STATUS_LABELS,
  TYPE_CONSERVATION_STATUSES,
} from "@/types/species.type";

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

export default function SpeciesCreatePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const createMutation = useSpeciesCreate();

  const [form, setForm] = useState<TYPE_SPECIES_PAYLOAD>(INITIAL_SPECIES_FORM);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors<FieldName>>({});

  const isPending = createMutation.isPending;
  const mutationError = createMutation.error;
  const summaryMessage =
    validationError ??
    (mutationError
      ? formatApiError(mutationError, "Gagal menambahkan spesies.")
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
      const response = await createMutation.mutateAsync(payload);

      showToast(
        response.message ?? "Spesies berhasil ditambahkan.",
        "success",
      );
      router.push("/species");
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error) as FormErrors<FieldName>);
      showToast(
        formatApiError(error, "Gagal menambahkan spesies."),
        "error",
      );
    }
  };

  const formNode = (
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
        <Button
          variant="outline"
          onClick={() => router.push("/species")}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type="submit" loading={isPending}>
          {isPending ? "Menyimpan..." : "Tambah Spesies"}
        </Button>
      </FormActions>
    </form>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Master Data"
        title="Tambah Spesies"
        description="Perbarui data taksonomi dan status konservasi spesies."
        className="mb-4"
        actions={
          <Link
            href="/species"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink-soft transition hover:border-primary hover:bg-primary-soft hover:text-primary"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali
          </Link>
        }
      />

      <div className="mx-auto w-full min-w-0 max-w-5xl">{formNode}</div>
    </div>
  );
}
