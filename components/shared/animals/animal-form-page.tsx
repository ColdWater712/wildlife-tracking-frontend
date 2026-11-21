"use client";

import { useRouter } from "next/navigation";

import { AnimalForm } from "@/components/shared/animals/animal-form";
import { FormPage } from "@/components/shared/form-page";
import { useAnimalById } from "@/hooks/use-animals";
import { toApiErrorState } from "@/services/api";

type AnimalFormPageProps = {
  recordId?: number;
};

export function AnimalFormPage({ recordId }: AnimalFormPageProps) {
  const router = useRouter();
  const isEditMode = recordId !== undefined;
  const detailQuery = useAnimalById(recordId ?? 0);
  const record = detailQuery.data?.data.items ?? null;
  const queryError = isEditMode && detailQuery.isError
    ? toApiErrorState(detailQuery.error)
    : null;

  return (
    <FormPage
      eyebrow="Master Data"
      title={isEditMode ? "Ubah Satwa" : "Tambah Satwa"}
      description="Data satwa disimpan langsung ke endpoint Laravel /api/animals."
      backHref="/animals"
      isLoading={isEditMode && detailQuery.isPending}
      loadingLabel="Memuat data satwa..."
      error={queryError}
      notFound={
        isEditMode &&
        !detailQuery.isPending &&
        (record === null ||
          recordId === undefined ||
          !Number.isFinite(recordId))
      }
      notFoundTitle="Satwa tidak ditemukan"
      onRetry={isEditMode ? () => void detailQuery.refetch() : undefined}
    >
      <AnimalForm
        standalone
        animal={isEditMode ? record : null}
        onSuccess={() => router.push("/animals")}
        onCancel={() => router.push("/animals")}
      />
    </FormPage>
  );
}
