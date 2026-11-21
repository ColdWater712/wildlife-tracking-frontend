"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  FormActions,
  FormAlert,
  FormField,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/ui/form";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { useToast } from "@/components/providers/toast-provider";
import {
  useCreateIncidentReport,
  useIncidentReportUpdate,
} from "@/hooks/use-incidents";
import { useAnimals } from "@/hooks/use-animals";
import { useSpecies } from "@/hooks/use-species";
import { formatApiError, getApiFieldErrors } from "@/services/api";
import type {
  CreateIncidentReportPayload,
  UpdateIncidentReportPayload,
} from "@/services/incident.service";
import type { IncidentReport } from "@/types/incident.type";

type IncidentReportFormProps = {
  report?: IncidentReport | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type FormState = {
  incident_type: string;
  description: string;
  timestamp: string;
  latitude: string;
  longitude: string;
  location: string;
  animal_id: string;
  species_id: string;
  status: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INCIDENT_FIELDS: (keyof FormState)[] = [
  "incident_type",
  "description",
  "timestamp",
  "latitude",
  "longitude",
  "location",
  "animal_id",
  "species_id",
  "status",
];

const INCIDENT_TYPE_SUGGESTIONS = [
  "observasi",
  "konflik",
  "perambahan",
  "device_alert",
  "system",
];

const incidentSchema = z.object({
  incident_type: z
    .string()
    .trim()
    .min(1, "Jenis insiden wajib diisi."),
  description: z
    .string()
    .trim()
    .min(1, "Deskripsi wajib diisi."),
  timestamp: z
    .string()
    .min(1, "Waktu kejadian wajib diisi.")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Format waktu kejadian tidak valid.",
    ),
  latitude: z
    .string()
    .refine((value) => {
      const latitude = Number(value);
      return (
        value.trim() !== "" &&
        Number.isFinite(latitude) &&
        latitude >= -90 &&
        latitude <= 90
      );
    }, "Latitude harus berada antara -90 sampai 90."),
  longitude: z
    .string()
    .refine((value) => {
      const longitude = Number(value);
      return (
        value.trim() !== "" &&
        Number.isFinite(longitude) &&
        longitude >= -180 &&
        longitude <= 180
      );
    }, "Longitude harus berada antara -180 sampai 180."),
  location: z.string(),
  animal_id: z.string(),
  species_id: z.string(),
  status: z.string(),
});

const toDateTimeLocal = (value: string | undefined): string => {
  if (!value) {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export function IncidentReportForm({
  report,
  onSuccess,
  onCancel,
}: IncidentReportFormProps) {
  const isEditMode = Boolean(report);
  const { showToast } = useToast();
  const createMutation = useCreateIncidentReport();
  const updateMutation = useIncidentReportUpdate(report?.report_id ?? 0);
  const animalsQuery = useAnimals();
  const speciesQuery = useSpecies();

  const animals = animalsQuery.data?.data?.items ?? [];
  const species = speciesQuery.data?.data?.items ?? [];

  const [form, setForm] = useState<FormState>(() => ({
    incident_type: report?.incident_type ?? "observasi",
    description: report?.description ?? "",
    timestamp: toDateTimeLocal(report?.timestamp),
    latitude:
      report?.latitude === null || report?.latitude === undefined
        ? ""
        : String(report.latitude),
    longitude:
      report?.longitude === null || report?.longitude === undefined
        ? ""
        : String(report.longitude),
    location: report?.location ?? "",
    animal_id: report?.animal_id ? String(report.animal_id) : "",
    species_id: report?.species_id ? String(report.species_id) : "",
    status: report?.status ?? "pending",
  }));
  const [errors, setErrors] = useState<FormErrors>({});

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = isEditMode
    ? updateMutation.error
    : createMutation.error;

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) return;

    const parsed = incidentSchema.safeParse(form);

    if (!parsed.success) {
      const nextErrors: FormErrors = {};

      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "") as keyof FormState;

        if (INCIDENT_FIELDS.includes(field)) {
          nextErrors[field] = issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    setErrors({});

    const status = parsed.data.status.trim();
    const payload: CreateIncidentReportPayload = {
      incident_type: parsed.data.incident_type,
      description: parsed.data.description,
      timestamp: parsed.data.timestamp,
      latitude: Number(parsed.data.latitude),
      longitude: Number(parsed.data.longitude),
      location: parsed.data.location.trim() || null,
      animal_id: parsed.data.animal_id
        ? Number(parsed.data.animal_id)
        : null,
      species_id: parsed.data.species_id
        ? Number(parsed.data.species_id)
        : null,
      ...(status === "" ? {} : { status }),
    };

    try {
      const response = isEditMode
        ? await updateMutation.mutateAsync(
            payload as UpdateIncidentReportPayload,
          )
        : await createMutation.mutateAsync({
            ...payload,
            status: status || "pending",
          });

      showToast(
        response.message ??
          (isEditMode
            ? "Laporan insiden berhasil diperbarui."
            : "Laporan insiden berhasil dibuat."),
        "success",
      );
      onSuccess();
    } catch (error) {
      setErrors(getApiFieldErrors(error) as FormErrors);
      showToast(
        formatApiError(
          error,
          isEditMode
            ? "Gagal memperbarui laporan insiden."
            : "Gagal menambahkan laporan insiden.",
        ),
        "error",
      );
    }
  };

  return (
    <Panel>
      <SectionHeader
        title={isEditMode ? "Ubah Laporan Insiden" : "Tambah Laporan Insiden"}
        description="Masukkan informasi kejadian yang ditemukan di lapangan."
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {animalsQuery.isError || speciesQuery.isError ? (
          <FormAlert message="Sebagian daftar related tidak dapat dimuat. Pilihan yang tersedia tetap dapat digunakan." />
        ) : null}

        <FormField
          label="Jenis Insiden"
          htmlFor="incident_type"
          required
          error={errors.incident_type}
        >
          <TextInput
            id="incident_type"
            name="incident_type"
            list="incident-type-options"
            value={form.incident_type}
            onChange={handleChange}
            invalid={errors.incident_type !== undefined}
            disabled={isPending}
            placeholder="Contoh: konflik"
          />
          <datalist id="incident-type-options">
            {INCIDENT_TYPE_SUGGESTIONS.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Waktu Kejadian"
            htmlFor="incident_timestamp"
            required
            error={errors.timestamp}
          >
            <TextInput
              id="incident_timestamp"
              name="timestamp"
              type="datetime-local"
              value={form.timestamp}
              onChange={handleChange}
              invalid={errors.timestamp !== undefined}
              disabled={isPending}
            />
          </FormField>

          <FormField label="Status" htmlFor="incident_status" error={errors.status}>
            <TextInput
              id="incident_status"
              name="status"
              value={form.status}
              onChange={handleChange}
              placeholder="pending"
              disabled={isPending}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Latitude"
            htmlFor="incident_latitude"
            required
            error={errors.latitude}
          >
            <TextInput
              id="incident_latitude"
              name="latitude"
              type="number"
              step="any"
              min={-90}
              max={90}
              value={form.latitude}
              onChange={handleChange}
              placeholder="3.600000"
              invalid={errors.latitude !== undefined}
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Longitude"
            htmlFor="incident_longitude"
            required
            error={errors.longitude}
          >
            <TextInput
              id="incident_longitude"
              name="longitude"
              type="number"
              step="any"
              min={-180}
              max={180}
              value={form.longitude}
              onChange={handleChange}
              placeholder="98.000000"
              invalid={errors.longitude !== undefined}
              disabled={isPending}
            />
          </FormField>
        </div>

        <FormField label="Lokasi" htmlFor="incident_location" error={errors.location}>
          <TextInput
            id="incident_location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Contoh: Blok Sekunder Bukit Lawang"
            disabled={isPending}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Satwa Terkait"
            htmlFor="incident_animal"
            error={
              animalsQuery.isError ? "Daftar satwa tidak dapat dimuat." : undefined
            }
          >
            <SelectInput
              id="incident_animal"
              name="animal_id"
              value={form.animal_id}
              onChange={handleChange}
              disabled={isPending || animalsQuery.isPending || animalsQuery.isError}
              invalid={errors.animal_id !== undefined}
            >
              <option value="">Tidak ada</option>
              {animals
                .filter((animal) => String(animal.animal_id) !== form.animal_id)
                .map((animal) => (
                  <option key={animal.animal_id} value={animal.animal_id}>
                    {animal.animal_code}
                  </option>
                ))}
              {form.animal_id !== "" &&
              !animals.some(
                (animal) => String(animal.animal_id) === form.animal_id,
              ) ? (
                <option value={form.animal_id}>
                  Satwa #{form.animal_id}
                </option>
              ) : null}
            </SelectInput>
          </FormField>

          <FormField
            label="Spesies Terkait"
            htmlFor="incident_species"
            error={
              speciesQuery.isError
                ? "Daftar spesies tidak dapat dimuat."
                : undefined
            }
          >
            <SelectInput
              id="incident_species"
              name="species_id"
              value={form.species_id}
              onChange={handleChange}
              disabled={isPending || speciesQuery.isPending || speciesQuery.isError}
              invalid={errors.species_id !== undefined}
            >
              <option value="">Tidak ada</option>
              {species
                .filter(
                  (item) => String(item.species_id) !== form.species_id,
                )
                .map((item) => (
                  <option key={item.species_id} value={item.species_id}>
                    {item.common_name}
                  </option>
                ))}
              {form.species_id !== "" &&
              !species.some(
                (item) => String(item.species_id) === form.species_id,
              ) ? (
                <option value={form.species_id}>
                  Spesies #{form.species_id}
                </option>
              ) : null}
            </SelectInput>
          </FormField>
        </div>

        <FormField
          label="Deskripsi"
          htmlFor="incident_description"
          required
          error={errors.description}
        >
          <TextArea
            id="incident_description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Jelaskan kejadian yang ditemukan..."
            rows={4}
            invalid={errors.description !== undefined}
            disabled={isPending}
          />
        </FormField>

        {mutationError ? (
          <FormAlert
            message={formatApiError(
              mutationError,
              "Gagal menyimpan laporan insiden.",
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
                : "Simpan Laporan"}
          </Button>
        </FormActions>
      </form>
    </Panel>
  );
}
