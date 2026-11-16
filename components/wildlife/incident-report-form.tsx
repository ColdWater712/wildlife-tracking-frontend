
"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useCreateIncidentReport } from "@/hooks/incident-report.hook";

type IncidentReportFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

type FormErrors = {
  incident_type?: string;
  animal_code?: string;
  location?: string;
  description?: string;
  photo_url?: string;
};

export function IncidentReportForm({
  onSuccess,
  onCancel,
}: IncidentReportFormProps) {
  const createMutation = useCreateIncidentReport();

  const [form, setForm] = useState({
    incident_type: "observasi",
    animal_code: "",
    location: "",
    description: "",
    photo_url: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    const fieldName = name as keyof FormErrors;

    setErrors((previous) => ({
      ...previous,
      [fieldName]: undefined,
    }));

    setErrorMessage("");
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const incidentType = form.incident_type.trim();
    const animalCode = form.animal_code.trim();
    const location = form.location.trim();
    const description = form.description.trim();
    const photoUrl = form.photo_url.trim();

    // Backend: required|string|max:50
    if (!incidentType) {
      newErrors.incident_type = "Jenis insiden wajib dipilih.";
    } else if (incidentType.length > 50) {
      newErrors.incident_type = "Maksimal 50 karakter.";
    }

    // Backend: nullable|string|max:50
    if (animalCode.length > 50) {
      newErrors.animal_code = "Kode satwa maksimal 50 karakter.";
    }

    // Backend: required|string|max:255
    if (!location) {
      newErrors.location = "Lokasi wajib diisi.";
    } else if (location.length > 255) {
      newErrors.location = "Lokasi maksimal 255 karakter.";
    }

    // Backend: required|string
    if (!description) {
      newErrors.description = "Deskripsi wajib diisi.";
    }

    // Backend: nullable|url|regex ekstensi gambar
    if (photoUrl) {
      const imageExtension =
        /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;

      try {
        new URL(photoUrl);

        if (!imageExtension.test(photoUrl)) {
          newErrors.photo_url =
            "URL harus berakhiran .jpg, .jpeg, .png, .gif, .webp, .bmp, atau .svg.";
        }
      } catch {
        newErrors.photo_url = "Format URL foto tidak valid.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        incident_type: form.incident_type.trim(),
        animal_code: form.animal_code.trim() || null,
        location: form.location.trim(),
        description: form.description.trim(),
        photo_url: form.photo_url.trim() || null,
      });

      onSuccess();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menambahkan laporan insiden.",
      );
    }
  };

  const inputStyle =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const labelStyle =
    "mb-1.5 block text-sm font-medium text-zinc-700";

  const errorStyle = "mt-1 text-xs text-red-600";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-zinc-900">
          Tambah Laporan Insiden
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Masukkan informasi kejadian yang ditemukan di lapangan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="incident_type" className={labelStyle}>
            Jenis Insiden <span className="text-red-500">*</span>
          </label>
          <select
            id="incident_type"
            name="incident_type"
            value={form.incident_type}
            onChange={handleChange}
            className={inputStyle}
            required
          >
            <option value="observasi">Observasi</option>
            <option value="konflik">Konflik</option>
            <option value="perambahan">Perambahan</option>
            <option value="device_alert">Peringatan Perangkat</option>
          </select>
          {errors.incident_type && (
            <p className={errorStyle}>{errors.incident_type}</p>
          )}
        </div>

        <div>
          <label htmlFor="animal_code" className={labelStyle}>
            Kode Satwa
          </label>
          <input
            id="animal_code"
            name="animal_code"
            value={form.animal_code}
            onChange={handleChange}
            placeholder="Contoh: SATWA-742"
            maxLength={50}
            className={inputStyle}
          />
          {errors.animal_code && (
            <p className={errorStyle}>{errors.animal_code}</p>
          )}
        </div>

        <div>
          <label htmlFor="location" className={labelStyle}>
            Lokasi <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Masukkan lokasi kejadian"
            maxLength={255}
            className={inputStyle}
            required
          />
          {errors.location && (
            <p className={errorStyle}>{errors.location}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className={labelStyle}>
            Deskripsi <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Jelaskan kejadian yang ditemukan..."
            rows={4}
            className={inputStyle}
            required
          />
          {errors.description && (
            <p className={errorStyle}>{errors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="photo_url" className={labelStyle}>
            URL Foto
          </label>
          <input
            id="photo_url"
            name="photo_url"
            type="url"
            value={form.photo_url}
            onChange={handleChange}
            placeholder="https://example.com/foto-insiden.jpg"
            className={inputStyle}
          />
          {errors.photo_url && (
            <p className={errorStyle}>{errors.photo_url}</p>
          )}
          <p className="mt-1 text-xs text-zinc-500">
            Opsional. Masukkan URL gambar valid dengan ekstensi
            JPG, JPEG, PNG, GIF, WEBP, BMP, atau SVG.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={createMutation.isPending}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createMutation.isPending
              ? "Menyimpan..."
              : "Simpan Laporan"}
          </button>
        </div>
      </form>
    </div>
  );
}
