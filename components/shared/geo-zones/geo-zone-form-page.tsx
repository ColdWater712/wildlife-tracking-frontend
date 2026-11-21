"use client";

import { useRouter } from "next/navigation";

import { FormPage } from "@/components/shared/form-page";
import { GeoZoneForm } from "@/components/shared/geo-zones/geo-zone-form";
import { useGeoZoneById } from "@/hooks/use-geo-zones";
import { toApiErrorState } from "@/services/api";

type GeoZoneFormPageProps = {
  recordId?: number;
};

export function GeoZoneFormPage({ recordId }: GeoZoneFormPageProps) {
  const router = useRouter();
  const isEditMode = recordId !== undefined;
  const detailQuery = useGeoZoneById(recordId ?? 0);
  const record = detailQuery.data ?? null;
  const queryError = isEditMode && detailQuery.isError
    ? toApiErrorState(detailQuery.error)
    : null;

  return (
    <FormPage
      eyebrow="Master Data"
      title={isEditMode ? "Ubah Zona" : "Tambah Zona"}
      description="Kelola zona risiko dan area konservasi pada peta pemantauan."
      backHref="/geo-zones"
      isLoading={isEditMode && detailQuery.isPending}
      loadingLabel="Memuat data zona..."
      error={queryError}
      notFound={
        isEditMode &&
        !detailQuery.isPending &&
        !detailQuery.isError &&
        record === null
      }
      notFoundTitle="Zona tidak ditemukan"
      onRetry={isEditMode ? () => void detailQuery.refetch() : undefined}
    >
      <GeoZoneForm
        zone={isEditMode ? record : null}
        onSuccess={() => router.push("/geo-zones")}
        onCancel={() => router.push("/geo-zones")}
      />
    </FormPage>
  );
}
