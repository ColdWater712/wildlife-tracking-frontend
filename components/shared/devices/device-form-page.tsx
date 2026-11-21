"use client";

import { useRouter } from "next/navigation";

import { DeviceForm } from "@/components/shared/devices/device-form";
import { FormPage } from "@/components/shared/form-page";
import { useTrackingDeviceById } from "@/hooks/use-devices";
import { toApiErrorState } from "@/services/api";

type DeviceFormPageProps = {
  recordId?: number;
};

export function DeviceFormPage({ recordId }: DeviceFormPageProps) {
  const router = useRouter();
  const isEditMode = recordId !== undefined;
  const detailQuery = useTrackingDeviceById(recordId ?? 0);
  const record = detailQuery.data?.data ?? null;
  const queryError = isEditMode && detailQuery.isError
    ? toApiErrorState(detailQuery.error)
    : null;

  return (
    <FormPage
      eyebrow="Master Data"
      title={isEditMode ? "Ubah Perangkat" : "Tambah Perangkat"}
      description="Kontrak penulisan perangkat mengikuti TrackingDeviceController Laravel."
      backHref="/devices"
      isLoading={isEditMode && detailQuery.isPending}
      loadingLabel="Memuat data perangkat..."
      error={queryError}
      notFound={
        isEditMode &&
        !detailQuery.isPending &&
        (record === null || recordId === undefined || !Number.isFinite(recordId))
      }
      notFoundTitle="Perangkat tidak ditemukan"
      onRetry={isEditMode ? () => void detailQuery.refetch() : undefined}
    >
      <DeviceForm
        standalone
        device={isEditMode ? record : null}
        onSuccess={() => router.push("/devices")}
        onCancel={() => router.push("/devices")}
      />
    </FormPage>
  );
}
