
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  useGeoZoneCreate,
  useGeoZoneUpdate,
} from "@/hooks/use-geo-zones";

import { useToast } from "@/components/providers/toast-provider";

import type {
  GeoZone,
  GeoZoneType,
} from "@/types/geo-zone";

import type {
  GeoZoneCreatePayload,
  GeoZoneUpdatePayload,
} from "@/services/geo-zone.service";

type GeoZoneFormProps = {
  zone?: GeoZone | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type GeoZoneFormState = {
  zone_name: string;
  zone_type: GeoZoneType;
  center_lat: string;
  center_lon: string;
  radius_km: string;
  polygon_geojson: string;
};

const INITIAL_FORM: GeoZoneFormState = {
  zone_name: "",
  zone_type: "permukiman",
  center_lat: "",
  center_lon: "",
  radius_km: "",
  polygon_geojson: "",
};

export function GeoZoneForm({
  zone,
  onSuccess,
  onCancel,
}: GeoZoneFormProps) {
  const isEditMode = Boolean(zone);

  const { showToast } = useToast();

  const createMutation = useGeoZoneCreate();

  const updateMutation = useGeoZoneUpdate(
    zone?.zone_id ?? 0,
  );

  const [form, setForm] =
    useState<GeoZoneFormState>(INITIAL_FORM);

  const [validationError, setValidationError] =
    useState<string | null>(null);

  useEffect(() => {
    if (zone) {
      const polygon =
        zone.polygon_geojson === null
          ? ""
          : typeof zone.polygon_geojson === "string"
            ? zone.polygon_geojson
            : JSON.stringify(zone.polygon_geojson, null, 2);

      setForm({
        zone_name: zone.zone_name,
        zone_type: zone.zone_type as GeoZoneType,
        center_lat:
          zone.center_lat === null
            ? ""
            : String(zone.center_lat),
        center_lon:
          zone.center_lon === null
            ? ""
            : String(zone.center_lon),
        radius_km:
          zone.radius_km === null
            ? ""
            : String(zone.radius_km),
        polygon_geojson: polygon,
      });
    } else {
      setForm({ ...INITIAL_FORM });
    }

    setValidationError(null);
    createMutation.reset();
    updateMutation.reset();
  }, [zone]);

  const isPending =
    createMutation.isPending || updateMutation.isPending;

  const mutationError = isEditMode
    ? updateMutation.error
    : createMutation.error;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setValidationError(null);

    const zoneName = form.zone_name.trim();

    // Validasi nama zona
    if (!zoneName) {
      setValidationError("Nama zona wajib diisi.");
      return;
    }

    if (zoneName.length > 150) {
      setValidationError(
        "Nama zona maksimal 150 karakter.",
      );
      return;
    }

    // Validasi jenis zona
    const validTypes: GeoZoneType[] = [
      "jalan_raya",
      "koridor_ekologis",
      "perkebunan",
      "permukiman",
    ];

    if (!validTypes.includes(form.zone_type)) {
      setValidationError(
        "Silakan pilih jenis zona yang valid.",
      );
      return;
    }

    // Validasi latitude
    const latitude =
      form.center_lat.trim() === ""
        ? null
        : Number(form.center_lat);

    if (
      latitude !== null &&
      (!Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90)
    ) {
      setValidationError(
        "Latitude harus berada antara -90 sampai 90.",
      );
      return;
    }

    // Validasi longitude
    const longitude =
      form.center_lon.trim() === ""
        ? null
        : Number(form.center_lon);

    if (
      longitude !== null &&
      (!Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180)
    ) {
      setValidationError(
        "Longitude harus berada antara -180 sampai 180.",
      );
      return;
    }

    // Validasi radius
    const radius =
      form.radius_km.trim() === ""
        ? null
        : Number(form.radius_km);

    if (
      radius !== null &&
      (!Number.isFinite(radius) ||
        radius < 0.1 ||
        radius > 100)
    ) {
      setValidationError(
        "Radius harus berada antara 0.1 sampai 100 km.",
      );
      return;
    }

    // Validasi GeoJSON
    let polygonGeoJSON: Record<string, unknown> | null =
      null;

    if (form.polygon_geojson.trim()) {
      try {
        const parsed: unknown = JSON.parse(
          form.polygon_geojson,
        );

        if (
          typeof parsed !== "object" ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          setValidationError(
            "GeoJSON harus berupa object JSON yang valid.",
          );
          return;
        }

        polygonGeoJSON = parsed as Record<string, unknown>;
      } catch {
        setValidationError(
          "Format GeoJSON tidak valid. Periksa kembali JSON yang dimasukkan.",
        );
        return;
      }
    }

    try {
      if (zone) {
        const payload: GeoZoneUpdatePayload = {
          zone_name: zoneName,
          zone_type: form.zone_type,
        };

        // Backend Update menggunakan sometimes|numeric.
        // Field kosong tidak dikirim agar validasi tidak gagal.
        if (latitude !== null) {
          payload.center_lat = latitude;
        }

        if (longitude !== null) {
          payload.center_lon = longitude;
        }

        if (radius !== null) {
          payload.radius_km = radius;
        }

        if (polygonGeoJSON !== null) {
          payload.polygon_geojson = polygonGeoJSON;
        }

        await updateMutation.mutateAsync(payload);

        showToast(
          "Data zona berhasil diperbarui.",
          "success",
        );
      } else {
        const payload: GeoZoneCreatePayload = {
          zone_name: zoneName,
          zone_type: form.zone_type,
          center_lat: latitude,
          center_lon: longitude,
          radius_km: radius,
          polygon_geojson: polygonGeoJSON,
        };

        await createMutation.mutateAsync(payload);

        showToast(
          "Zona berhasil ditambahkan.",
          "success",
        );
      }

      onSuccess();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data zona.",
        "error",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
    >
      {/* Nama Zona */}
      <div>
        <label
          htmlFor="zone-name"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Nama Zona <span className="text-red-500">*</span>
        </label>

        <input
          id="zone-name"
          type="text"
          required
          maxLength={150}
          value={form.zone_name}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              zone_name: event.target.value,
            }));
            setValidationError(null);
          }}
          placeholder="Contoh: Zona Perkebunan Utara"
          disabled={isPending}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-green-700 disabled:bg-zinc-100"
        />
      </div>

      {/* Jenis Zona */}
      <div>
        <label
          htmlFor="zone-type"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Jenis Zona <span className="text-red-500">*</span>
        </label>

        <select
          id="zone-type"
          required
          value={form.zone_type}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              zone_type: event.target.value as GeoZoneType,
            }));
            setValidationError(null);
          }}
          disabled={isPending}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-green-700 disabled:bg-zinc-100"
        >
          <option value="jalan_raya">Jalan Raya</option>
          <option value="koridor_ekologis">
            Koridor Ekologis
          </option>
          <option value="perkebunan">Perkebunan</option>
          <option value="permukiman">Permukiman</option>
        </select>
      </div>

      {/* Latitude dan Longitude */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="zone-latitude"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Latitude
          </label>

          <input
            id="zone-latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            value={form.center_lat}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                center_lat: event.target.value,
              }));
              setValidationError(null);
            }}
            placeholder="-90 sampai 90"
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-green-700 disabled:bg-zinc-100"
          />
        </div>

        <div>
          <label
            htmlFor="zone-longitude"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Longitude
          </label>

          <input
            id="zone-longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            value={form.center_lon}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                center_lon: event.target.value,
              }));
              setValidationError(null);
            }}
            placeholder="-180 sampai 180"
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-green-700 disabled:bg-zinc-100"
          />
        </div>
      </div>

      {/* Radius */}
      <div>
        <label
          htmlFor="zone-radius"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Radius (km)
        </label>

        <input
          id="zone-radius"
          type="number"
          step="any"
          min="0.1"
          max="100"
          value={form.radius_km}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              radius_km: event.target.value,
            }));
            setValidationError(null);
          }}
          placeholder="0.1 sampai 100 km"
          disabled={isPending}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-green-700 disabled:bg-zinc-100"
        />
      </div>

      {/* GeoJSON */}
      <div>
        <label
          htmlFor="zone-geojson"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Polygon GeoJSON
        </label>

        <textarea
          id="zone-geojson"
          rows={5}
          value={form.polygon_geojson}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              polygon_geojson: event.target.value,
            }));
            setValidationError(null);
          }}
          placeholder={'{\n  "type": "Polygon",\n  "coordinates": []\n}'}
          disabled={isPending}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm outline-none focus:border-green-700 disabled:bg-zinc-100"
        />

        <p className="mt-1 text-xs text-zinc-500">
          Masukkan object GeoJSON dalam format JSON yang valid.
          Kosongkan jika zona tidak menggunakan polygon.
        </p>
      </div>

      {/* Validasi */}
      {validationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {validationError}
        </div>
      )}

      {/* Error API */}
      {mutationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {mutationError.message ||
            "Gagal menyimpan data zona. Silakan coba lagi."}
        </div>
      )}

      {/* Tombol */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#286747] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#174C35] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Menyimpan..."
            : isEditMode
              ? "Simpan Perubahan"
              : "Simpan Zona"}
        </button>
      </div>
    </form>
  );
}
