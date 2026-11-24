"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
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
import {
  useTrackingDeviceById,
  useTrackingDeviceUpdate,
} from "@/hooks/use-devices";
import {
  firstIssueMessage,
  issuesToFieldErrors,
  stringOrEmpty,
  type FormErrors,
} from "@/lib/form";
import {
  formatApiError,
  getApiFieldErrors,
  toApiErrorState,
} from "@/services/api";
import type {
  DeviceCondition,
  TYPE_TRACKING_DEVICE_PAYLOAD,
} from "@/types/device.type";

type DeviceFormState = {
  model: string;
  installation_date: string;
  battery_life_months: number;
  battery_level: number;
  signal_strength: number;
  is_active: boolean;
  device_condition: DeviceCondition;
  last_recorded_at: string;
};

type FieldName = keyof DeviceFormState;

const INITIAL_FORM: DeviceFormState = {
  model: "",
  installation_date: "",
  battery_life_months: 12,
  battery_level: 100,
  signal_strength: 0,
  is_active: true,
  device_condition: "normal",
  last_recorded_at: "",
};

const DEVICE_FIELDS: FieldName[] = [
  "model",
  "installation_date",
  "battery_life_months",
  "battery_level",
  "signal_strength",
  "is_active",
  "device_condition",
  "last_recorded_at",
];

const DEVICE_CONDITIONS = [
  { value: "normal", label: "Normal" },
  { value: "damaged", label: "Rusak" },
  { value: "lost", label: "Hilang" },
] as const;

const deviceSchema = z.object({
  model: z
    .string()
    .trim()
    .min(1, "Model perangkat wajib diisi.")
    .max(100, "Model perangkat maksimal 100 karakter."),
  installation_date: z
    .string()
    .refine(
      (value) =>
        value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Format tanggal pemasangan tidak valid.",
    ),
  battery_life_months: z
    .number()
    .int("Masa pakai baterai harus bilangan bulat.")
    .min(1, "Masa pakai baterai minimal 1 bulan.")
    .max(120, "Masa pakai baterai maksimal 120 bulan."),
  battery_level: z
    .number()
    .int("Level baterai harus bilangan bulat.")
    .min(0, "Level baterai minimal 0.")
    .max(100, "Level baterai maksimal 100."),
  signal_strength: z
    .number()
    .int("Kekuatan sinyal harus bilangan bulat.")
    .min(0, "Kekuatan sinyal minimal 0.")
    .max(100, "Kekuatan sinyal maksimal 100."),
  is_active: z.boolean(),
  device_condition: z
    .string()
    .refine(
      (value) => value === "normal" || value === "damaged" || value === "lost",
      "Kondisi perangkat tidak valid.",
    ),
  last_recorded_at: z.string(),
});

export default function DeviceUpdatePage() {
  const params = useParams<{ id: string }>();
  const recordId = Number(params.id);
  const router = useRouter();
  const { showToast } = useToast();

  const detailQuery = useTrackingDeviceById(recordId);
  const record = detailQuery.data?.data ?? null;
  const updateMutation = useTrackingDeviceUpdate(record?.device_id ?? 0);

  const [form, setForm] = useState<DeviceFormState>(() =>
    record
      ? {
          model: record.model,
          installation_date: stringOrEmpty(record.installation_date),
          battery_life_months: record.battery_life_months ?? 12,
          battery_level: record.battery_level ?? 100,
          signal_strength: record.signal_strength ?? 0,
          is_active: record.is_active === true || record.is_active === 1,
          device_condition: record.device_condition,
          last_recorded_at: stringOrEmpty(record.last_recorded_at),
        }
      : INITIAL_FORM,
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors<FieldName>>({});

  if (!Number.isInteger(recordId) || recordId <= 0) notFound();

  const queryError = detailQuery.isError
    ? toApiErrorState(detailQuery.error)
    : null;

  const isPending = updateMutation.isPending;
  const summaryMessage =
    validationError ??
    (updateMutation.error
      ? formatApiError(
          updateMutation.error,
          "Gagal menyimpan data perangkat. Silakan coba lagi.",
        )
      : null);

  const setField = <K extends FieldName>(
    key: K,
    value: DeviceFormState[K],
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

    const parsed = deviceSchema.safeParse(form);

    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues, DEVICE_FIELDS));
      setValidationError(
        firstIssueMessage(parsed.error.issues, "Periksa kembali isian form."),
      );
      return;
    }

    const payload: TYPE_TRACKING_DEVICE_PAYLOAD = {
      model: parsed.data.model,
      installation_date: parsed.data.installation_date || undefined,
      battery_life_months: parsed.data.battery_life_months,
      battery_level: parsed.data.battery_level,
      signal_strength: parsed.data.signal_strength,
      is_active: parsed.data.is_active,
      device_condition: parsed.data.device_condition as DeviceCondition,
      last_recorded_at: parsed.data.last_recorded_at || undefined,
    };

    try {
      await updateMutation.mutateAsync(payload);
      showToast("Data perangkat berhasil diperbarui.", "success");

      router.push("/devices");
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error) as FormErrors<FieldName>);
      showToast(
        formatApiError(
          error,
          "Gagal menyimpan data perangkat. Silakan coba lagi.",
        ),
        "error",
      );
    }
  };

  const formNode = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormSection
        title="Informasi Perangkat"
        description="Identitas dan waktu pemasangan collar GPS di lapangan."
      >
        <FormGrid>
          <FormField
            label="Model Perangkat"
            htmlFor="device-model"
            required
            error={fieldErrors.model}
          >
            <TextInput
              id="device-model"
              required
              maxLength={100}
              value={form.model}
              onChange={(event) => setField("model", event.target.value)}
              placeholder="Contoh: GPS Collar V4"
              invalid={fieldErrors.model !== undefined}
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Tanggal Pemasangan"
            htmlFor="device-installation-date"
            error={fieldErrors.installation_date}
          >
            <TextInput
              id="device-installation-date"
              type="date"
              value={form.installation_date ?? ""}
              onChange={(event) =>
                setField("installation_date", event.target.value)
              }
              invalid={fieldErrors.installation_date !== undefined}
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Pembacaan Terakhir"
            htmlFor="device-last-recorded"
            error={fieldErrors.last_recorded_at}
            hint="Waktu pembacaan terakhir akan diisi sistem saat perangkat mengirim data."
          >
            <TextInput
              id="device-last-recorded"
              type="datetime-local"
              value={form.last_recorded_at?.slice(0, 16) ?? ""}
              onChange={(event) =>
                setField("last_recorded_at", event.target.value)
              }
              invalid={fieldErrors.last_recorded_at !== undefined}
              disabled={isPending}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection
        title="Kondisi dan Performa"
        description="Pantau kondisi fisik, daya baterai, dan kualitas sinyal perangkat."
      >
        <FormGrid>
          <FormField
            label="Kondisi Perangkat"
            htmlFor="device-condition"
            required
            error={fieldErrors.device_condition}
          >
            <SelectInput
              id="device-condition"
              required
              value={form.device_condition}
              onChange={(event) =>
                setField(
                  "device_condition",
                  event.target.value as DeviceCondition,
                )
              }
              invalid={fieldErrors.device_condition !== undefined}
              disabled={isPending}
            >
              {DEVICE_CONDITIONS.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField
            label="Masa Pakai Baterai (bulan)"
            htmlFor="device-battery-life"
            required
            error={fieldErrors.battery_life_months}
          >
            <TextInput
              id="device-battery-life"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              required
              value={form.battery_life_months}
              onChange={(event) =>
                setField("battery_life_months", Number(event.target.value))
              }
              invalid={fieldErrors.battery_life_months !== undefined}
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Level Baterai (%)"
            htmlFor="device-battery-level"
            required
            error={fieldErrors.battery_level}
          >
            <TextInput
              id="device-battery-level"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              required
              value={form.battery_level}
              onChange={(event) =>
                setField("battery_level", Number(event.target.value))
              }
              invalid={fieldErrors.battery_level !== undefined}
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Kekuatan Sinyal"
            htmlFor="device-signal-strength"
            required
            error={fieldErrors.signal_strength}
          >
            <TextInput
              id="device-signal-strength"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              required
              value={form.signal_strength}
              onChange={(event) =>
                setField("signal_strength", Number(event.target.value))
              }
              invalid={fieldErrors.signal_strength !== undefined}
              disabled={isPending}
            />
          </FormField>
        </FormGrid>

        <FormCheckbox
          id="device-is-active"
          label="Perangkat aktif"
          description="Perangkat aktif mengirim pembacaan GPS secara berkala."
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
          onClick={() => router.push("/devices")}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type="submit" loading={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </FormActions>
    </form>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Master Data"
        title="Ubah Perangkat"
        description="Kelola identitas, kondisi, dan performa perangkat pelacak satwa."
        className="mb-4"
        actions={
          <Link
            href="/devices"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink-soft transition hover:border-primary hover:bg-primary-soft hover:text-primary"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali
          </Link>
        }
      />

      <div className="mx-auto w-full min-w-0 max-w-5xl">
        {queryError ? (
          <ErrorState
            kind={queryError.kind}
            message={queryError.message}
            status={queryError.status}
            errors={queryError.errors}
            onRetry={() => void detailQuery.refetch()}
          />
        ) : !detailQuery.isPending && !detailQuery.isError && record === null ? (
          <EmptyState
            title="Perangkat tidak ditemukan"
            description="Data tidak tersedia di backend."
          />
        ) : detailQuery.isPending ? (
          <Loading label="Memuat data perangkat..." />
        ) : (
          formNode
        )}
      </div>
    </div>
  );
}
