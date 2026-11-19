
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { useAnimals } from "@/hooks/animal.hook";
import {
  useTrackingDeviceCreate,
  useTrackingDeviceUpdate,
} from "@/hooks/tracking-device.hook";
import { useToast } from "@/components/providers/toast-provider";

import type { TrackingDevice, DeviceCondition } from "@/types/tracking-device.type";
import type {
  TYPE_TRACKING_DEVICE_PAYLOAD,
  TYPE_TRACKING_DEVICE_UPDATE_PAYLOAD,
} from "@/services/tracking-device.service";

type DeviceFormProps = {
  device?: TrackingDevice | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type DeviceFormState = {
  animal_id: number | null;
  model: string;
  installation_date: string;
  battery_life_months: string;
  battery_level: string;
  signal_strength: string;
  device_condition: DeviceCondition;
  is_active: boolean;
};

const INITIAL_FORM: DeviceFormState = {
  animal_id: null,
  model: "",
  installation_date: "",
  battery_life_months: "",
  battery_level: "",
  signal_strength: "",
  device_condition: "normal",
  is_active: true,
};

export function DeviceForm({
  device,
  onSuccess,
  onCancel,
}: DeviceFormProps) {
  const isEditMode = Boolean(device);

  const { showToast } = useToast();

  const createMutation = useTrackingDeviceCreate();
  const updateMutation = useTrackingDeviceUpdate(
    device?.device_id ?? 0,
  );

  const animalsQuery = useAnimals();
  const animals = animalsQuery.data?.data?.items ?? [];

  const [form, setForm] = useState<DeviceFormState>(INITIAL_FORM);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (device) {
      setForm({
        animal_id: device.animal_id,
        model: device.model,
        installation_date: device.installation_date?.slice(0, 10) ?? "",
        battery_life_months:
          device.battery_life_months?.toString() ?? "",
        battery_level: device.battery_level?.toString() ?? "",
        signal_strength: device.signal_strength?.toString() ?? "",
        device_condition: device.device_condition,
        is_active: Boolean(device.is_active),
      });
    } else {
      setForm({ ...INITIAL_FORM });
    }

    setValidationError(null);
    createMutation.reset();
    updateMutation.reset();
  }, [device]);

  const isPending =
    createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    const model = form.model.trim();

    if (!model) {
      setValidationError("Model perangkat wajib diisi.");
      return;
    }

    if (model.length > 100) {
      setValidationError("Model perangkat maksimal 100 karakter.");
      return;
    }

    if (animalsQuery.isLoading || animalsQuery.isError) {
      setValidationError("Daftar satwa belum berhasil dimuat. Silakan coba lagi.");
      return;
    }

    if (
      form.animal_id !== null &&
      !animals.some((animal) => animal.animal_id === form.animal_id)
    ) {
      setValidationError("Satwa yang dipilih tidak valid.");
      return;
    }

    if (form.installation_date) {
      const selectedDate = new Date(`${form.installation_date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (
        Number.isNaN(selectedDate.getTime()) ||
        selectedDate > today
      ) {
        setValidationError("Tanggal pemasangan tidak boleh melebihi hari ini.");
        return;
      }
    }

    const batteryLife = form.battery_life_months === ""
      ? null
      : Number(form.battery_life_months);

    if (
      batteryLife !== null &&
      (!Number.isInteger(batteryLife) || batteryLife < 1 || batteryLife > 60)
    ) {
      setValidationError("Umur baterai harus berupa angka 1 sampai 60 bulan.");
      return;
    }

    const batteryLevel = form.battery_level === ""
      ? null
      : Number(form.battery_level);

    if (
      batteryLevel !== null &&
      (!Number.isInteger(batteryLevel) || batteryLevel < 0 || batteryLevel > 100)
    ) {
      setValidationError("Level baterai harus berupa angka 0 sampai 100.");
      return;
    }

    const signalStrength = form.signal_strength === ""
      ? null
      : Number(form.signal_strength);

    if (
      signalStrength !== null &&
      (!Number.isInteger(signalStrength) || signalStrength < 0 || signalStrength > 5)
    ) {
      setValidationError("Kekuatan sinyal harus berupa angka 0 sampai 5.");
      return;
    }

    try {
      if (device) {
        const payload: TYPE_TRACKING_DEVICE_UPDATE_PAYLOAD = {
          animal_id: form.animal_id,
          model,
          installation_date: form.installation_date || null,
          battery_life_months: batteryLife,
          battery_level: batteryLevel,
          signal_strength: signalStrength,
          device_condition: form.device_condition,
          is_active: form.is_active,
        };

        await updateMutation.mutateAsync(payload);
        showToast("Data perangkat berhasil diperbarui.", "success");
      } else {
        const payload: TYPE_TRACKING_DEVICE_PAYLOAD = {
          animal_id: form.animal_id,
          model,
          installation_date: form.installation_date || null,
          battery_life_months: batteryLife,
          battery_level: batteryLevel,
          signal_strength: signalStrength,
          device_condition: form.device_condition,
        };

        await createMutation.mutateAsync(payload);
        showToast("Perangkat berhasil ditambahkan.", "success");
      }

      onSuccess();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data perangkat.",
        "error",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="device-model" className="mb-1 block text-sm font-medium">
          Model Perangkat <span className="text-red-500">*</span>
        </label>
        <input
          id="device-model"
          required
          maxLength={100}
          value={form.model}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              model: event.target.value,
            }))
          }
          disabled={isPending}
          placeholder="Contoh: GPS Tracker TK-102"
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
        />
      </div>

      <div>
        <label htmlFor="device-animal" className="mb-1 block text-sm font-medium">
          Pasangkan dengan Satwa
        </label>
        <select
          id="device-animal"
          value={form.animal_id ?? ""}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              animal_id: event.target.value ? Number(event.target.value) : null,
            }))
          }
          disabled={isPending || animalsQuery.isLoading || animalsQuery.isError}
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
        >
          <option value="">Belum dipasangkan</option>
          {animals.map((animal) => (
            <option key={animal.animal_id} value={animal.animal_id}>
              {animal.animal_code}
            </option>
          ))}
        </select>
        {animalsQuery.isLoading && (
          <p className="mt-1 text-xs text-zinc-500">Memuat daftar satwa...</p>
        )}
      </div>

      <div>
        <label htmlFor="device-installation" className="mb-1 block text-sm font-medium">
          Tanggal Pemasangan
        </label>
        <input
          id="device-installation"
          type="date"
          max={new Date().toLocaleDateString("en-CA")}
          value={form.installation_date}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              installation_date: event.target.value,
            }))
          }
          disabled={isPending}
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
        />
      </div>

      <div>
        <label htmlFor="device-battery-life" className="mb-1 block text-sm font-medium">
          Umur Baterai (bulan)
        </label>
        <input
          id="device-battery-life"
          type="number"
          min={1}
          max={60}
          value={form.battery_life_months}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              battery_life_months: event.target.value,
            }))
          }
          disabled={isPending}
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="device-battery" className="mb-1 block text-sm font-medium">
            Level Baterai (%)
          </label>
          <input
            id="device-battery"
            type="number"
            min={0}
            max={100}
            value={form.battery_level}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                battery_level: event.target.value,
              }))
            }
            disabled={isPending}
            className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
          />
        </div>

        <div>
          <label htmlFor="device-signal" className="mb-1 block text-sm font-medium">
            Kekuatan Sinyal (0–5)
          </label>
          <input
            id="device-signal"
            type="number"
            min={0}
            max={5}
            value={form.signal_strength}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                signal_strength: event.target.value,
              }))
            }
            disabled={isPending}
            className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="device-condition" className="mb-1 block text-sm font-medium">
          Kondisi Perangkat <span className="text-red-500">*</span>
        </label>
        <select
          id="device-condition"
          value={form.device_condition}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              device_condition: event.target.value as DeviceCondition,
            }))
          }
          disabled={isPending}
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
        >
          <option value="normal">Normal</option>
          <option value="damaged">Rusak</option>
          <option value="lost">Hilang</option>
        </select>
      </div>

      {isEditMode && (
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
            disabled={isPending}
          />
          Status aktif
        </label>
      )}

      {validationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {validationError}
        </div>
      )}

      {(createMutation.error || updateMutation.error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {(createMutation.error || updateMutation.error)?.message ||
            "Gagal menyimpan data perangkat."}
        </div>
      )}

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
          disabled={isPending || animalsQuery.isLoading || animalsQuery.isError}
          className="rounded-lg bg-[#286747] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Menyimpan..."
            : isEditMode
              ? "Simpan Perubahan"
              : "Simpan Perangkat"}
        </button>
      </div>
    </form>
  );
}
