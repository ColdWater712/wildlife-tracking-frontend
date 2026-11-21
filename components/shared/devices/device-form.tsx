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
import { Panel, SectionHeader } from "@/components/ui/panel";
import { useToast } from "@/components/providers/toast-provider";
import {
  useTrackingDeviceCreate,
  useTrackingDeviceUpdate,
} from "@/hooks/use-devices";
import { formatApiError, getApiFieldErrors } from "@/services/api";
import type {
  TYPE_TRACKING_DEVICE_PAYLOAD,
  TYPE_TRACKING_DEVICE_UPDATE_PAYLOAD,
} from "@/services/device.service";
import type {
  DeviceCondition,
  TrackingDevice,
} from "@/types/device.type";

type DeviceFormProps = {
  device?: TrackingDevice | null;
  onSuccess: () => void;
  onCancel: () => void;
  standalone?: boolean;
};

type DeviceFormState = {
  model: string;
  installation_date: string;
  battery_life_months: string;
  device_condition: DeviceCondition;
  battery_level: string;
  signal_strength: string;
  is_active: boolean;
};

type DeviceFieldErrors = Partial<Record<keyof DeviceFormState, string>>;

const INITIAL_FORM: DeviceFormState = {
  model: "",
  installation_date: "",
  battery_life_months: "",
  device_condition: "normal",
  battery_level: "",
  signal_strength: "",
  is_active: true,
};

const DEVICE_FIELDS: (keyof DeviceFormState)[] = [
  "model",
  "installation_date",
  "battery_life_months",
  "device_condition",
  "battery_level",
  "signal_strength",
  "is_active",
];

const DEVICE_CONDITIONS: DeviceCondition[] = [
  "normal",
  "damaged",
  "lost",
];

const CONDITION_LABELS: Record<DeviceCondition, string> = {
  normal: "Normal",
  damaged: "Rusak",
  lost: "Hilang",
};

const optionalInteger = (min: number, max: number, message: string) =>
  z.string().refine((value) => {
    if (value.trim() === "") return true;

    const parsed = Number(value);

    return Number.isInteger(parsed) && parsed >= min && parsed <= max;
  }, message);

const deviceSchema = z.object({
  model: z.string().trim().min(1, "Model perangkat wajib diisi.").max(100),
  installation_date: z.string(),
  battery_life_months: optionalInteger(
    0,
    65535,
    "Masa pakai baterai harus berupa bilangan bulat 0 sampai 65535.",
  ),
  device_condition: z.enum(["normal", "damaged", "lost"]),
  battery_level: optionalInteger(0, 100, "Level baterai harus 0 sampai 100."),
  signal_strength: optionalInteger(
    0,
    100,
    "Kekuatan sinyal harus 0 sampai 100.",
  ),
  is_active: z.boolean(),
});

const stringOrEmpty = (value: number | string | null | undefined): string =>
  value === null || value === undefined ? "" : String(value);

export function DeviceForm({
  device,
  onSuccess,
  onCancel,
  standalone = false,
}: DeviceFormProps) {
  const isEditMode = Boolean(device);
  const { showToast } = useToast();
  const createMutation = useTrackingDeviceCreate();
  const updateMutation = useTrackingDeviceUpdate(device?.device_id ?? 0);

  const [form, setForm] = useState<DeviceFormState>(() => ({
    model: device?.model ?? INITIAL_FORM.model,
    installation_date:
      device?.installation_date ?? INITIAL_FORM.installation_date,
    battery_life_months: stringOrEmpty(device?.battery_life_months),
    device_condition:
      device?.device_condition ?? INITIAL_FORM.device_condition,
    battery_level: stringOrEmpty(device?.battery_level),
    signal_strength: stringOrEmpty(device?.signal_strength),
    is_active:
      device === null || device === undefined
        ? INITIAL_FORM.is_active
        : device.is_active === true || device.is_active === 1,
  }));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<DeviceFieldErrors>({});

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = isEditMode
    ? updateMutation.error
    : createMutation.error;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) return;

    setValidationError(null);
    setFieldErrors({});

    const parsed = deviceSchema.safeParse(form);

    if (!parsed.success) {
      const nextErrors: DeviceFieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "") as keyof DeviceFormState;

        if (DEVICE_FIELDS.includes(field)) {
          nextErrors[field] = issue.message;
        }
      }

      setFieldErrors(nextErrors);
      setValidationError(
        parsed.error.issues[0]?.message ?? "Periksa kembali isian form.",
      );
      return;
    }

    const payload: TYPE_TRACKING_DEVICE_PAYLOAD = {
      model: parsed.data.model,
      installation_date: parsed.data.installation_date || undefined,
      battery_life_months:
        parsed.data.battery_life_months === ""
          ? undefined
          : Number(parsed.data.battery_life_months),
      device_condition: parsed.data.device_condition,
      battery_level:
        parsed.data.battery_level === ""
          ? undefined
          : Number(parsed.data.battery_level),
      signal_strength:
        parsed.data.signal_strength === ""
          ? undefined
          : Number(parsed.data.signal_strength),
      is_active: parsed.data.is_active,
    };

    try {
      if (device) {
        const updatePayload: TYPE_TRACKING_DEVICE_UPDATE_PAYLOAD = payload;
        await updateMutation.mutateAsync(updatePayload);
        showToast("Data perangkat berhasil diperbarui.", "success");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("Perangkat berhasil ditambahkan.", "success");
      }

      onSuccess();
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error) as DeviceFieldErrors);
      showToast(
        formatApiError(error, "Gagal menyimpan data perangkat."),
        "error",
      );
    }
  };

  const formNode = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              model: event.target.value,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({ ...previous, model: undefined }));
          }}
          placeholder="Contoh: GPS Tracker TK-102"
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Tanggal Pasang"
        htmlFor="device-installation-date"
        error={fieldErrors.installation_date}
      >
        <TextInput
          id="device-installation-date"
          type="date"
          value={form.installation_date}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              installation_date: event.target.value,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              installation_date: undefined,
            }));
          }}
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Masa Pakai Baterai (bulan)"
        htmlFor="device-battery-life"
        error={fieldErrors.battery_life_months}
      >
        <TextInput
          id="device-battery-life"
          type="number"
          min={0}
          max={65535}
          value={form.battery_life_months}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              battery_life_months: event.target.value,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              battery_life_months: undefined,
            }));
          }}
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Kondisi"
        htmlFor="device-condition"
        required
        error={fieldErrors.device_condition}
      >
        <SelectInput
          id="device-condition"
          value={form.device_condition}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              device_condition: event.target.value as DeviceCondition,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              device_condition: undefined,
            }));
          }}
          disabled={isPending}
        >
          {DEVICE_CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {CONDITION_LABELS[condition]}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField
        label="Level Baterai (%)"
        htmlFor="device-battery"
        error={fieldErrors.battery_level}
      >
        <TextInput
          id="device-battery"
          type="number"
          min={0}
          max={100}
          value={form.battery_level}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              battery_level: event.target.value,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              battery_level: undefined,
            }));
          }}
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Kekuatan Sinyal"
        htmlFor="device-signal"
        error={fieldErrors.signal_strength}
      >
        <TextInput
          id="device-signal"
          type="number"
          min={0}
          max={100}
          value={form.signal_strength}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              signal_strength: event.target.value,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              signal_strength: undefined,
            }));
          }}
          disabled={isPending}
        />
      </FormField>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              is_active: event.target.checked,
            }));
            setFieldErrors((previous) => ({
              ...previous,
              is_active: undefined,
            }));
          }}
          disabled={isPending}
        />
        Perangkat aktif
      </label>

      {validationError ? <FormAlert message={validationError} /> : null}

      {mutationError ? (
        <FormAlert
          message={formatApiError(
            mutationError,
            "Gagal menyimpan data perangkat.",
          )}
        />
      ) : null}

      <FormActions>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Batal
        </Button>
        <Button type="submit" loading={isPending}>
          {isPending
            ? "Menyimpan..."
            : isEditMode
              ? "Simpan Perubahan"
              : "Tambah Perangkat"}
        </Button>
      </FormActions>
    </form>
  );

  if (standalone) {
    return (
      <Panel>
        <SectionHeader
          title={isEditMode ? "Ubah Perangkat" : "Tambah Perangkat"}
          description="Kontrak penulisan mengikuti controller TrackingDevice Laravel."
        />
        {formNode}
      </Panel>
    );
  }

  return formNode;
}
