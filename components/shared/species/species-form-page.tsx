"use client";

import { useRouter } from "next/navigation";

import { FormPage } from "@/components/shared/form-page";
import { SpeciesForm } from "@/components/shared/species/species-form";
import { useSpeciesById } from "@/hooks/use-species";
import { toApiErrorState } from "@/services/api";

type SpeciesFormPageProps = {
  recordId?: number;
};

export function SpeciesFormPage({ recordId }: SpeciesFormPageProps) {
  const router = useRouter();
  const isEditMode = recordId !== undefined;
  const detailQuery = useSpeciesById(recordId ?? 0);
  const record = detailQuery.data?.data.items ?? null;
  const queryError = isEditMode && detailQuery.isError
    ? toApiErrorState(detailQuery.error)
    : null;

  return (
    <FormPage
      eyebrow="Master Data"
      title={isEditMode ? "Ubah Spesies" : "Tambah Spesies"}
      description="Perbarui data taksonomi dan status konservasi spesies."
      backHref="/species"
      isLoading={isEditMode && detailQuery.isPending}
      loadingLabel="Memuat data spesies..."
      error={queryError}
      notFound={
        isEditMode &&
        !detailQuery.isPending &&
        !detailQuery.isError &&
        record === null
      }
      notFoundTitle="Spesies tidak ditemukan"
      onRetry={isEditMode ? () => void detailQuery.refetch() : undefined}
    >
      <SpeciesForm
        species={isEditMode ? record : null}
        onSuccess={() => router.push("/species")}
        onCancel={() => router.push("/species")}
      />
    </FormPage>
  );
}
