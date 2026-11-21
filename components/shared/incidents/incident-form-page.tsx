"use client";

import { useRouter } from "next/navigation";

import { FormPage } from "@/components/shared/form-page";
import { IncidentReportForm } from "@/components/shared/incidents/incident-report-form";
import { useIncidentReportById } from "@/hooks/use-incidents";
import { toApiErrorState } from "@/services/api";

type IncidentFormPageProps = {
  recordId?: number;
};

export function IncidentFormPage({ recordId }: IncidentFormPageProps) {
  const router = useRouter();
  const isEditMode = recordId !== undefined;
  const detailQuery = useIncidentReportById(recordId ?? 0);
  const record = detailQuery.data?.data ?? null;
  const queryError = isEditMode && detailQuery.isError
    ? toApiErrorState(detailQuery.error)
    : null;

  return (
    <FormPage
      eyebrow="Operasional"
      title={isEditMode ? "Ubah Laporan Insiden" : "Tambah Laporan Insiden"}
      description="Data insiden disimpan langsung ke endpoint Laravel /api/incidents."
      backHref="/incidents"
      isLoading={isEditMode && detailQuery.isPending}
      loadingLabel="Memuat laporan insiden..."
      error={queryError}
      notFound={
        isEditMode &&
        !detailQuery.isPending &&
        (record === null || recordId === undefined || !Number.isFinite(recordId))
      }
      notFoundTitle="Laporan insiden tidak ditemukan"
      onRetry={isEditMode ? () => void detailQuery.refetch() : undefined}
    >
      <IncidentReportForm
        report={isEditMode ? record : null}
        onSuccess={() => router.push("/incidents")}
        onCancel={() => router.push("/incidents")}
      />
    </FormPage>
  );
}
