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
  FormCheckbox,
  FormField,
  FormGrid,
  FormSection,
  SelectInput,
  TextInput,
} from "@/components/form";
import { useAnimalCreate } from "@/hooks/use-animals";
import { useSpecies } from "@/hooks/use-species";
import {
  firstIssueMessage,
  issuesToFieldErrors,
  type FormErrors,
} from "@/lib/form";
import { formatApiError, getApiFieldErrors } from "@/services/api";

type AnimalFormState = {
  species_id: number;
  animal_code: string;
  birth_date: string | null;
  gender: "Jantan" | "Betina" | "Tidak Diketahui";
  is_active: boolean;
};

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

const GENDERS: AnimalFormState["gender"][] = [
  "Jantan",
  "Betina",
  "Tidak Diketahui",
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
    .refine((value): value is AnimalFormState["gender"] =>
      GENDERS.includes(value as AnimalFormState["gender"]),
    "Jenis kelamin tidak valid."),
  is_active: z.boolean(),
});

const mapFieldErrors = (
  errors: Record<string, string>,
): FormErrors<keyof AnimalFormState> => {
  const mapped: FormErrors<keyof AnimalFormState> = {};

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

export default function AnimalCreatePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const createMutation = useAnimalCreate();
  const speciesQuery = useSpecies();

  const species = speciesQuery.data?.data?.items ?? [];

  const [form, setForm] = useState<AnimalFormState>(INITIAL_FORM);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] =
    useState<FormErrors<keyof AnimalFormState>>({});

  const isPending = createMutation.isPending;
  const mutationError = createMutation.error;
  const speciesError = speciesQuery.isError
    ? "Daftar spesies tidak dapat dimuat."
    : undefined;
  const summaryMessage =
    validationError ??
    (mutationError
      ? formatApiError(
          mutationError,
          "Gagal menyimpan data satwa. Silakan coba lagi.",
        )
      : null);

  const setField = <K extends keyof AnimalFormState>(
    key: K,
    value: AnimalFormState[K],
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setValidationError(null);
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) return;

    setValidationError(null);
    setFieldErrors({});

    if (speciesQuery.isLoading) {
      setValidationError("Daftar spesies masih dimuat. Silakan tunggu.");
      return;
    }

    if (speciesQuery.isError) {
      setValidationError("Gagal mengambil daftar spesies. Silakan coba lagi.");
      return;
    }

    const parsed = animalSchema.safeParse(form);

    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues, ANIMAL_FIELDS));
      setValidationError(
        firstIssueMessage(parsed.error.issues, "Periksa kembali isian form."),
      );
      return;
    }

    if (
      !species.some((item) => item.species_id === parsed.data.species_id)
    ) {
      setValidationError("Spesies yang dipilih tidak valid.");
      return;
    }

    try {
      await createMutation.mutateAsync(parsed.data);
      showToast("Satwa berhasil ditambahkan.", "success");

      router.push("/animals");
    } catch (error) {
      setFieldErrors(mapFieldErrors(getApiFieldErrors(error)));
      showToast(
        formatApiError(error, "Gagal menyimpan data satwa. Silakan coba lagi."),
        "error",
      );
    }
  };

  const formNode = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormSection
        title="Informasi Dasar"
        description="Identitas individu satwa yang akan dipantau di lapangan."
      >
        <FormGrid>
          <FormField
            label="Kode Satwa"
            htmlFor="animal-code"
            required
            error={fieldErrors.animal_code}
            hint="Gunakan kode collar, contoh: ORN-01."
          >
            <TextInput
              id="animal-code"
              required
              maxLength={100}
              value={form.animal_code}
              onChange={(event) => setField("animal_code", event.target.value)}
              placeholder="Contoh: ORN-01"
              invalid={fieldErrors.animal_code !== undefined}
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Tanggal Lahir"
            htmlFor="animal-birth-date"
            error={fieldErrors.birth_date}
          >
            <TextInput
              id="animal-birth-date"
              type="date"
              max={todayInputValue()}
              value={form.birth_date ?? ""}
              onChange={(event) =>
                setField("birth_date", event.target.value || null)
              }
              invalid={fieldErrors.birth_date !== undefined}
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Jenis Kelamin"
            htmlFor="animal-gender"
            required
            error={fieldErrors.gender}
          >
            <SelectInput
              id="animal-gender"
              required
              value={form.gender}
              onChange={(event) =>
                setField(
                  "gender",
                  event.target.value as AnimalFormState["gender"],
                )
              }
              invalid={fieldErrors.gender !== undefined}
              disabled={isPending}
            >
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection
        title="Spesies dan Status"
        description="Hubungkan satwa dengan spesies yang terdaftar dan tentukan status pantauannya."
      >
        <FormField
          label="Spesies"
          htmlFor="animal-species"
          required
          error={fieldErrors.species_id ?? speciesError}
          hint={
            speciesQuery.isPending ? "Memuat daftar spesies..." : undefined
          }
        >
          <SelectInput
            id="animal-species"
            required
            value={form.species_id || ""}
            onChange={(event) =>
              setField("species_id", Number(event.target.value))
            }
            disabled={speciesQuery.isPending || speciesQuery.isError || isPending}
            invalid={fieldErrors.species_id !== undefined || speciesError !== undefined}
          >
            <option value="">Pilih spesies</option>
            {species.map((item) => (
              <option key={item.species_id} value={item.species_id}>
                {item.common_name}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormCheckbox
          id="animal-is-active"
          label="Status aktif"
          description="Satwa aktif terus muncul dalam pemantauan."
          checked={form.is_active}
          onChange={(event) => setField("is_active", event.target.checked)}
          disabled={isPending}
          error={fieldErrors.is_active}
        />
      </FormSection>

      {summaryMessage ? <FormAlert message={summaryMessage} /> : null}

      <FormActions>
        <Button
          variant="outline"
          onClick={() => router.push("/animals")}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button
          type="submit"
          loading={isPending}
          disabled={speciesQuery.isPending || speciesQuery.isError}
        >
          {isPending ? "Menyimpan..." : "Tambah Satwa"}
        </Button>
      </FormActions>
    </form>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Master Data"
        title="Tambah Satwa"
        description="Kelola identitas, spesies, dan status pemantauan individu satwa."
        className="mb-4"
        actions={
          <Link
            href="/animals"
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
