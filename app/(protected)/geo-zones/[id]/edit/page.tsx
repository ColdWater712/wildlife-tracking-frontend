"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
  FormField,
  FormGrid,
  FormSection,
  TextArea,
  TextInput,
} from "@/components/form";
import {
  useGeoZoneById,
  useGeoZoneUpdate,
} from "@/hooks/use-geo-zones";
import {
  firstIssueMessage,
  issuesToFieldErrors,
  stringOrEmpty,
  toOptionalNumber,
  type FormErrors,
} from "@/lib/form";
import {
  formatApiError,
  getApiFieldErrors,
  toApiErrorState,
} from "@/services/api";
import { GEO_ZONE_TYPES, type GeoZoneUpdatePayload } from "@/types/geo-zone.type";

type GeoZoneFormState = {
  zone_name: string;
  zone_type: string;
  center_lat: string;
  center_lon: string;
  radius_km: string;
  polygon_geojson: string;
};

type FieldName = keyof GeoZoneFormState;

const INITIAL_FORM: GeoZoneFormState = {
  zone_name: "",
  zone_type: "",
  center_lat: "",
  center_lon: "",
  radius_km: "",
  polygon_geojson: "",
};

const ZONE_FIELDS: FieldName[] = [
  "zone_name",
  "zone_type",
  "center_lat",
  "center_lon",
  "radius_km",
  "polygon_geojson",
];

const ZONE_TYPE_SUGGESTIONS = GEO_ZONE_TYPES;

const isInRange = (value: string, min: number, max: number): boolean => {
  if (value.trim() === "") return true;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max;
};

const geoZoneSchema = z.object({
  zone_name: z
    .string()
    .trim()
    .min(1, "Nama zona wajib diisi.")
    .max(150, "Nama zona maksimal 150 karakter."),
  zone_type: z
    .string()
    .trim()
    .min(1, "Jenis zona wajib diisi.")
    .max(50, "Jenis zona maksimal 50 karakter."),
  center_lat: z
    .string()
    .trim()
    .refine((value) => isInRange(value, -90, 90), "Latitude harus antara -90 dan 90."),
  center_lon: z
    .string()
    .trim()
    .refine((value) => isInRange(value, -180, 180), "Longitude harus antara -180 dan 180."),
  radius_km: z
    .string()
    .trim()
    .refine(
      (value) => isInRange(value, 0.001, 1000),
      "Radius harus antara 0.001 dan 1000 km.",
    ),
  polygon_geojson: z
    .string()
    .trim()
    .refine((value) => {
      if (value === "") return true;

      try {
        const parsed = JSON.parse(value) as { type?: unknown };
        return (
          parsed !== null &&
          typeof parsed === "object" &&
          (parsed.type === "Polygon" || parsed.type === "MultiPolygon")
        );
      } catch {
        return false;
      }
    }, "GeoJSON harus berupa Polygon atau MultiPolygon yang valid."),
});

const normalizeGeoJson = (
  value: string | Record<string, unknown> | null,
): string => {
  if (!value) return "";
  if (typeof value === "string") return value;

  return JSON.stringify(value);
};

export default function GeoZoneUpdatePage() {
  const params = useParams<{ id: string }>();
  const recordId = Number(params.id);
  const router = useRouter();
  const { showToast } = useToast();

  const detailQuery = useGeoZoneById(recordId);
  const record = detailQuery.data ?? null;
  const updateMutation = useGeoZoneUpdate(record?.zone_id ?? 0);

  const initialForm = useMemo<GeoZoneFormState>(
    () =>
      record
        ? {
            zone_name: record.zone_name,
            zone_type: record.zone_type,
            center_lat: stringOrEmpty(record.center_lat),
            center_lon: stringOrEmpty(record.center_lon),
            radius_km: stringOrEmpty(record.radius_km),
            polygon_geojson: normalizeGeoJson(record.polygon_geojson),
          }
        : INITIAL_FORM,
    [record],
  );
  const [overrides, setOverrides] = useState<Partial<GeoZoneFormState>>({});
  const form = useMemo(
    () => ({ ...initialForm, ...overrides }),
    [initialForm, overrides],
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
          "Gagal menyimpan data zona. Silakan coba lagi.",
        )
      : null);

  const setField = <K extends FieldName>(
    key: K,
    value: GeoZoneFormState[K],
  ) => {
    setOverrides((previous) => ({ ...previous, [key]: value }));
    setValidationError(null);
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) return;

    setValidationError(null);
    setFieldErrors({});

    const parsed = geoZoneSchema.safeParse(form);

    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues, ZONE_FIELDS));
      setValidationError(
        firstIssueMessage(parsed.error.issues, "Periksa kembali isian form."),
      );
      return;
    }

    const centerLat = toOptionalNumber(parsed.data.center_lat);
    const centerLon = toOptionalNumber(parsed.data.center_lon);
    const radiusKm = toOptionalNumber(parsed.data.radius_km);

    const payload: GeoZoneUpdatePayload = {
      zone_name: parsed.data.zone_name,
      zone_type: parsed.data.zone_type,
      center_lat: centerLat ?? null,
      center_lon: centerLon ?? null,
      radius_km: radiusKm ?? null,
      polygon_geojson: parsed.data.polygon_geojson || null,
    };

    try {
      await updateMutation.mutateAsync(payload);
      showToast("Data zona berhasil diperbarui.", "success");

      router.push("/geo-zones");
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error) as FormErrors<FieldName>);
      showToast(
        formatApiError(error, "Gagal menyimpan data zona. Silakan coba lagi."),
        "error",
      );
    }
  };

  const formNode = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormSection
        title="Identitas Zona"
        description="Tentukan nama dan jenis zona yang digunakan dalam pemantauan."
      >
        <FormGrid>
          <FormField
            label="Nama Zona"
            htmlFor="zone-name"
            required
            error={fieldErrors.zone_name}
          >
            <TextInput
              id="zone-name"
              required
              maxLength={100}
              value={form.zone_name}
              onChange={(event) => setField("zone_name", event.target.value)}
              placeholder="Contoh: Zona Risiko Perkebunan"
              invalid={fieldErrors.zone_name !== undefined}
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Jenis Zona"
            htmlFor="zone-type"
            required
            error={fieldErrors.zone_type}
            hint="Pilih salah satu atau ketik jenis zona lain yang sesuai."
          >
            <TextInput
              id="zone-type"
              required
              list="zone-type-options"
              maxLength={50}
              value={form.zone_type}
              onChange={(event) => setField("zone_type", event.target.value)}
              placeholder="Contoh: koridor_ekologis"
              invalid={fieldErrors.zone_type !== undefined}
              disabled={isPending}
            />
            <datalist id="zone-type-options">
              {ZONE_TYPE_SUGGESTIONS.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection
        title="Konfigurasi Geografis"
        description="Titik pusat dan radius digunakan untuk zona berbentuk lingkaran."
      >
        <FormGrid columns={3}>
          <FormField
            label="Latitude Pusat"
            htmlFor="zone-center-lat"
            error={fieldErrors.center_lat}
          >
            <TextInput
              id="zone-center-lat"
              type="number"
              inputMode="decimal"
              step="any"
              min={-90}
              max={90}
              value={form.center_lat}
              onChange={(event) => setField("center_lat", event.target.value)}
              placeholder="Contoh: 3.650000"
              invalid={fieldErrors.center_lat !== undefined}
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
              inputMode="decimal"
              step="any"
              min={-180}
              max={180}
              value={form.center_lon}
              onChange={(event) => setField("center_lon", event.target.value)}
              placeholder="Contoh: 98.100000"
              invalid={fieldErrors.center_lon !== undefined}
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
              inputMode="decimal"
              step="any"
              min={0}
              value={form.radius_km}
              onChange={(event) => setField("radius_km", event.target.value)}
              placeholder="Contoh: 2.5"
              invalid={fieldErrors.radius_km !== undefined}
              disabled={isPending}
            />
          </FormField>
        </FormGrid>

        <FormField
          label="Polygon GeoJSON"
          htmlFor="zone-polygon"
          error={fieldErrors.polygon_geojson}
          hint="Opsional. Gunakan objek GeoJSON untuk zona berbentuk polygon."
        >
          <TextArea
            id="zone-polygon"
            rows={5}
            className="font-mono"
            value={form.polygon_geojson}
            onChange={(event) =>
              setField("polygon_geojson", event.target.value)
            }
            placeholder='{"type":"Polygon","coordinates":[...]}'
            invalid={fieldErrors.polygon_geojson !== undefined}
            disabled={isPending}
          />
        </FormField>
      </FormSection>

      {summaryMessage ? <FormAlert message={summaryMessage} /> : null}

      <FormActions>
        <Button
          variant="outline"
          onClick={() => router.push("/geo-zones")}
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
        title="Ubah Zona"
        description="Kelola zona risiko dan area konservasi pada peta pemantauan."
        className="mb-4"
        actions={
          <Link
            href="/geo-zones"
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
            title="Zona tidak ditemukan"
            description="Data tidak tersedia di backend."
          />
        ) : detailQuery.isPending ? (
          <Loading label="Memuat data zona..." />
        ) : (
          formNode
        )}
      </div>
    </div>
  );
}
