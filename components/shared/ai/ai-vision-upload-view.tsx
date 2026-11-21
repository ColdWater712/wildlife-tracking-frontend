"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import { ImagePlus, LoaderCircle, UploadCloud, X } from "lucide-react";

import { useToast } from "@/components/providers/toast-provider";
import { AiPredictionResult } from "@/components/shared/ai/ai-prediction-result";
import { Button } from "@/components/ui/button";
import {
  FormAlert,
  FormField,
  FormGrid,
  FormSection,
  SelectInput,
  fieldDescribedBy,
} from "@/components/ui/form";
import { PageHeader } from "@/components/ui/panel";
import { useIncidentReports } from "@/hooks/use-incidents";
import { useAiPredictionUpload } from "@/hooks/use-ai";
import {
  formatApiError,
  getApiFieldErrors,
  toApiErrorState,
} from "@/services/api";
import {
  AI_ACCEPTED_FILE_TYPES,
  AI_MAX_FILE_SIZE_BYTES,
  type AiPrediction,
} from "@/types/ai.type";
import { formatDate } from "@/utils/format";

const validateFile = (file: File): string | null => {
  if (!AI_ACCEPTED_FILE_TYPES.includes(file.type as (typeof AI_ACCEPTED_FILE_TYPES)[number])) {
    return "Format gambar harus JPG, JPEG, PNG, atau WEBP.";
  }
  if (file.size > AI_MAX_FILE_SIZE_BYTES) {
    return "Ukuran gambar maksimal 5 MB.";
  }
  return null;
};

export function AiVisionUploadView({ canVerify }: { canVerify: boolean }) {
  const { showToast } = useToast();
  const incidentQuery = useIncidentReports();
  const uploadMutation = useAiPredictionUpload();
  const [file, setFile] = useState<File | null>(null);
  const [reportId, setReportId] = useState("");
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<AiPrediction | null>(null);

  const incidents = incidentQuery.data?.data ?? [];
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    if (!previewUrl) return;

    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFile = (nextFile: File | undefined) => {
    if (!nextFile) return;

    const validationError = validateFile(nextFile);
    setFileError(validationError ?? undefined);
    if (validationError) return;

    setFile(nextFile);
    setResult(null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!file) {
      setFileError("Pilih gambar terlebih dahulu.");
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    uploadMutation.mutate(
      {
        file,
        reportId: reportId === "" ? null : Number(reportId),
      },
      {
        onSuccess: (response) => {
          showToast("Gambar berhasil dianalisis AI.", "success");
          setResult(response.data.prediction);
          setFile(null);
          setFileError(undefined);
        },
        onError: (error) => {
          showToast(
            formatApiError(error, "Gagal menganalisis gambar. Silakan coba lagi."),
            "error",
          );
          const fieldErrors = getApiFieldErrors(error);
          setFileError(fieldErrors.file ?? "Gambar gagal diproses backend.");
        },
      },
    );
  };

  const isPending = uploadMutation.isPending;
  const apiErrorState = uploadMutation.isError
    ? toApiErrorState(uploadMutation.error)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Vision"
        title="Identifikasi Satwa dari Gambar"
        description="Unggah foto dari lapangan untuk mendapatkan prediksi spesies dari model AI. Hasil bersifat advisory dan memerlukan verifikasi manusia."
      />

      <FormSection
        title="Unggah Gambar"
        description="Format JPG, JPEG, PNG, atau WEBP dengan ukuran maksimal 5 MB. Gambar diproses oleh backend Laravel."
      >
        <FormGrid columns={2}>
          <FormField
            label="File Gambar"
            htmlFor="ai-file"
            required
            error={fileError}
            hint="Seret gambar ke area ini atau klik untuk memilih."
          >
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface-muted/50 p-4 text-center"
            >
              {previewUrl ? (
                <div className="flex w-full flex-col items-center gap-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-surface">
                    <Image
                      src={previewUrl}
                      alt="Pratinjau gambar yang akan dianalisis"
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <p className="max-w-full truncate text-xs font-medium text-ink-soft">
                      {file?.name}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Hapus gambar"
                      icon={<X className="size-3.5" />}
                      disabled={isPending}
                      onClick={() => {
                        setFile(null);
                        setFileError(undefined);
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud aria-hidden="true" className="size-8 text-primary" />
                  <p className="mt-2 text-sm font-medium text-ink-soft">
                    Seret gambar ke sini
                  </p>
                  <label
                    htmlFor="ai-file"
                    className="mt-3 inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-xs font-semibold text-ink-soft transition hover:border-primary hover:text-primary"
                  >
                    <ImagePlus aria-hidden="true" className="size-4" />
                    Pilih Gambar
                  </label>
                  <input
                    id="ai-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    className="sr-only"
                    aria-describedby={fieldDescribedBy(
                      "ai-file",
                      fileError === undefined,
                      fileError !== undefined,
                    )}
                    disabled={isPending}
                    onChange={(event) => handleFile(event.target.files?.[0])}
                  />
                </>
              )}
            </div>
          </FormField>

          <div className="flex flex-col gap-4">
            <FormField
              label="Laporan Insiden Terkait"
              htmlFor="ai-report-id"
              hint="Opsional. Hubungkan gambar dengan laporan insiden yang sudah ada."
            >
              <SelectInput
                id="ai-report-id"
                value={reportId}
                disabled={isPending || incidentQuery.isLoading}
                onChange={(event) => setReportId(event.target.value)}
              >
                <option value="">Tidak ada laporan terkait</option>
                {incidents.map((incident) => (
                  <option key={incident.report_id} value={incident.report_id}>
                    #{incident.report_id} · {incident.incident_type} ·{" "}
                    {formatDate(incident.timestamp)}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            {incidentQuery.isError ? (
              <FormAlert
                message={formatApiError(
                  incidentQuery.error,
                  "Gagal memuat daftar laporan insiden.",
                )}
              />
            ) : null}

            {apiErrorState && !fileError ? (
              <FormAlert
                message={formatApiError(
                  uploadMutation.error,
                  "Gagal menganalisis gambar.",
                )}
              />
            ) : null}

            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-primary-soft/50 p-3 text-xs text-ink-soft">
              {isPending ? (
                <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-primary" />
              ) : (
                <ImagePlus aria-hidden="true" className="size-5 text-primary" />
              )}
              <span>
                {isPending
                  ? "Backend sedang memproses gambar dengan model AI. Harap tunggu..."
                  : "Prediksi AI dapat membantu identifikasi, tetapi keputusan akhir tetap oleh petugas."}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={isPending}
              disabled={!file || isPending}
              icon={<UploadCloud className="size-4" />}
              onClick={handleSubmit}
            >
              {isPending ? "Menganalisis..." : "Kirim ke AI"}
            </Button>
          </div>
        </FormGrid>
      </FormSection>

      {result ? (
        <AiPredictionResult
          prediction={result}
          canVerify={canVerify}
          detailHref={`/ai/vision/${result.prediction_id}`}
        />
      ) : null}
    </div>
  );
}
