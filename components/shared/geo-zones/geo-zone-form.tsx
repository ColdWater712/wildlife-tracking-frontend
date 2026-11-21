"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  FormActions,
  FormAlert,
  FormField,
  TextArea,
  TextInput,
} from "@/components/ui/form";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { useToast } from "@/components/providers/toast-provider";
import {
  useGeoZoneCreate,
  useGeoZoneUpdate,
} from "@/hooks/use-geo-zones";
import { formatApiError, getApiFieldErrors } from "@/services/api";
import type {
  GeoZoneCreatePayload,
  GeoZoneUpdatePayload,
} from "@/services/geo-zone.service";
import type { GeoZone } from "@/types/geo-zone.type";

type GeoZoneFormProps = {
  zone?: GeoZone | null;
  onSuccess: () => void;
  onCancel: () => void;
  standalone?: boolean;
};

type GeoZoneFormState = {
  zone_name: string;
  zone_type: string;
  center_lat: string;
  center_lon: string;
  radius_km: string;
  polygon_geojson: string;
};

type GeoZoneFieldErrors = Partial<Record<keyof GeoZoneFormState, string>>;

const INITIAL_FORM: GeoZoneFormState = {
  zone_name: "",
  zone_type: "",
  center_lat: "",
  center_lon: "",
  radius_km: "",
  polygon_geojson: "",
};

const GEO_ZONE_FIELDS: (keyof GeoZoneFormState)[] = [
  "zone_name",
  "zone_type",
  "center_lat",
  "center_lon",
  "radius_km",
  "polygon_geojson",
];

const ZONE_TYPE_SUGGESTIONS = [
  "permukiman",
  "jalan_raya",
  "perkebunan",
  "koridor_ekologis",
];

const optionalNumber = (
  min: number,
  max: number,
  message: string,
) =>
  z.string().refine((value) => {
    if (value.trim() === "") return true;

    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed >= min && parsed <= max;
  }, message);

const geoZoneSchema = (requirePolygon: boolean) =>
  z
    .object({
      zone_name: z
        .string()
        .trim()
        .min(1, "Nama zona wajib diisi.")
        .max(150, "Nama zona maksimal 150 karakter."),
      zone_type: z.string().trim().min(1, "Jenis zona wajib diisi.").max(50),
      center_lat: optionalNumber(-90, 90, "Latitude harus -90 sampai 90."),
      center_lon: optionalNumber(-180, 180, "Longitude harus -180 sampai 180."),
      radius_km: optionalNumber(0, Number.MAX_SAFE_INTEGER, "Radius tidak valid."),
      polygon_geojson: z.string(),
    })
    .superRefine((value, context) => {
      const polygon = value.polygon_geojson.trim();

      if (polygon === "") {
        if (requirePolygon) {
          context.addIssue({
            code: "custom",
            path: ["polygon_geojson"],
            message: "Polygon GeoJSON wajib diisi.",
          });
        }
        return;
      }

      try {
        const parsed: unknown = JSON.parse(polygon);

        if (
          typeof parsed !== "object" ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          context.addIssue({
            code: "custom",
            path: ["polygon_geojson"],
            message: "Polygon harus berupa object JSON yang valid.",
          });
        }
      } catch {
        context.addIssue({
          code: "custom",
          path: ["polygon_geojson"],
          message: "Format JSON polygon tidak valid.",
        });
      }
    });

const stringifyPolygon = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
};

const stringOrEmpty = (value: number | string | null | undefined): string =>
  value === null || value === undefined ? "" : String(value);

export function GeoZoneForm({
  zone,
  onSuccess,
  onCancel,
  standalone = false,
}: GeoZoneFormProps) {
  const isEditMode = Boolean(zone);
  const { showToast } = useToast();
  const createMutation = useGeoZoneCreate();
  const updateMutation = useGeoZoneUpdate(zone?.zone_id ?? 0);

  const [form, setForm] = useState<GeoZoneFormState>(() => ({
    zone_name: zone?.zone_name ?? INITIAL_FORM.zone_name,
    zone_type: zone?.zone_type ?? INITIAL_FORM.zone_type,
    center_lat: stringOrEmpty(zone?.center_lat),
    center_lon: stringOrEmpty(zone?.center_lon),
    radius_km: stringOrEmpty(zone?.radius_km),
    polygon_geojson: stringifyPolygon(zone?.polygon_geojson),
  }));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<GeoZoneFieldErrors>({});

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = isEditMode
    ? updateMutation.error
    : createMutation.error;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) return;

    setValidationError(null);
    setFieldErrors({});

    const parsed = geoZoneSchema(!isEditMode).safeParse(form);

    if (!parsed.success) {
      const nextErrors: GeoZoneFieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = String(
          issue.path[0] ?? "",
        ) as keyof GeoZoneFormState;

        if (GEO_ZONE_FIELDS.includes(field)) {
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

    const polygon = parsed.data.polygon_geojson.trim();
    const payload: GeoZoneCreatePayload = {
      zone_name: parsed.data.zone_name,
      zone_type: parsed.data.zone_type,
      center_lat:
        parsed.data.center_lat === ""
          ? undefined
          : Number(parsed.data.center_lat),
      center_lon:
        parsed.data.center_lon === ""
          ? undefined
          : Number(parsed.data.center_lon),
      radius_km:
        parsed.data.radius_km === ""
          ? undefined
          : Number(parsed.data.radius_km),
      ...(polygon === "" ? {} : { polygon_geojson: polygon }),
    };

    try {
      if (zone) {
        const updatePayload: GeoZoneUpdatePayload = payload;
        await updateMutation.mutateAsync(updatePayload);
        showToast("Data zona berhasil diperbarui.", "success");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("Zona berhasil ditambahkan.", "success");
      }

      onSuccess();
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error) as GeoZoneFieldErrors);
      showToast(
        formatApiError(error, "Gagal menyimpan data zona."),
        "error",
      );
    }
  };

  const formNode = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormField
        label="Nama Zona"
        htmlFor="zone-name"
        required
        error={fieldErrors.zone_name}
      >
        <TextInput
          id="zone-name"
          required
          maxLength={150}
          value={form.zone_name}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              zone_name: event.target.value,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              zone_name: undefined,
            }));
          }}
          placeholder="Contoh: Zona Perkebunan Utara"
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Jenis Zona"
        htmlFor="zone-type"
        required
        error={fieldErrors.zone_type}
      >
        <TextInput
          id="zone-type"
          required
          list="geo-zone-type-options"
          value={form.zone_type}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              zone_type: event.target.value,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              zone_type: undefined,
            }));
          }}
          placeholder="Contoh: koridor_ekologis"
          disabled={isPending}
        />
        <datalist id="geo-zone-type-options">
          {ZONE_TYPE_SUGGESTIONS.map((type) => (
            <option key={type} value={type} />
          ))}
        </datalist>
      </FormField>

      <FormField
        label="Latitude Pusat"
        htmlFor="zone-center-lat"
        error={fieldErrors.center_lat}
      >
        <TextInput
          id="zone-center-lat"
          type="number"
          step="any"
          value={form.center_lat}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              center_lat: event.target.value,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              center_lat: undefined,
            }));
          }}
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Longitude Pusat"
        htmlFor="zone-center-lon"
        error={fieldErrors.center_lon}
      >
        <TextInput
          id="zone-center-lon"
          type="number"
          step="any"
          value={form.center_lon}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              center_lon: event.target.value,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              center_lon: undefined,
            }));
          }}
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Radius (km)"
        htmlFor="zone-radius"
        error={fieldErrors.radius_km}
      >
        <TextInput
          id="zone-radius"
          type="number"
          step="any"
          value={form.radius_km}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              radius_km: event.target.value,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              radius_km: undefined,
            }));
          }}
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Polygon GeoJSON"
        htmlFor="zone-polygon"
        required={!isEditMode}
        error={fieldErrors.polygon_geojson}
        hint="Masukkan object GeoJSON dalam format JSON yang valid."
      >
        <TextArea
          id="zone-polygon"
          rows={6}
          value={form.polygon_geojson}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              polygon_geojson: event.target.value,
            }));
            setValidationError(null);
            setFieldErrors((previous) => ({
              ...previous,
              polygon_geojson: undefined,
            }));
          }}
          placeholder={'{\n  "type": "Polygon",\n  "coordinates": []\n}'}
          disabled={isPending}
          className="font-mono"
        />
      </FormField>

      {validationError ? <FormAlert message={validationError} /> : null}

      {mutationError ? (
        <FormAlert
          message={formatApiError(
            mutationError,
            "Gagal menyimpan data zona.",
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
              : "Tambah Zona"}
        </Button>
      </FormActions>
    </form>
  );

  if (standalone) {
    return (
      <Panel>
        <SectionHeader
          title={isEditMode ? "Ubah Zona" : "Tambah Zona"}
          description="Kontrak penulisan mengikuti controller GeoZone Laravel."
        />
        {formNode}
      </Panel>
    );
  }

  return formNode;
}
