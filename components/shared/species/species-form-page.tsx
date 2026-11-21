"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/providers/toast-provider";
import { FormPage } from "@/components/shared/form-page";
import { SpeciesForm } from "@/components/shared/species/species-form";
import {
  useSpeciesById,
  useSpeciesCreate,
  useSpeciesUpdate,
} from "@/hooks/use-species";
import { formatApiError, getApiFieldErrors, toApiErrorState } from "@/services/api";
import type { TYPE_SPECIES_PAYLOAD } from "@/types/species.type";

type SpeciesFormPageProps = {
  recordId?: number;
};

export function SpeciesFormPage({ recordId }: SpeciesFormPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditMode = recordId !== undefined;
  const detailQuery = useSpeciesById(recordId ?? 0);
  const createMutation = useSpeciesCreate();
  const updateMutation = useSpeciesUpdate(recordId ?? 0);

  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const record = detailQuery.data?.data.items ?? null;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const queryError = isEditMode && detailQuery.isError
    ? toApiErrorState(detailQuery.error)
    : null;

  const handleSubmit = (payload: TYPE_SPECIES_PAYLOAD) => {
    if (isPending) return;

    setErrorMessage("");
    setFieldErrors({});

    const mutation = isEditMode ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: (response) => {
        showToast(
          response.message ??
            (isEditMode
              ? "Data spesies berhasil diperbarui."
              : "Spesies berhasil ditambahkan."),
          "success",
        );
        router.push("/species");
      },
      onError: (error) => {
        const message = formatApiError(
          error,
          isEditMode
            ? "Gagal memperbarui spesies."
            : "Gagal menambahkan spesies.",
        );

        setErrorMessage(message);
        setFieldErrors(getApiFieldErrors(error));
        showToast(message, "error");
      },
    });
  };

  return (
    <FormPage
      eyebrow="Master Data"
      title={isEditMode ? "Ubah Spesies" : "Tambah Spesies"}
      description="Data spesies disimpan langsung ke endpoint Laravel /api/species."
      backHref="/species"
      isLoading={isEditMode && detailQuery.isPending}
      loadingLabel="Memuat data spesies..."
      error={queryError}
      notFound={isEditMode && !detailQuery.isPending && record === null && !detailQuery.isError}
      notFoundTitle="Spesies tidak ditemukan"
      onRetry={isEditMode ? () => void detailQuery.refetch() : undefined}
    >
      <SpeciesForm
        standalone
        species={isEditMode ? record : null}
        isSaving={isPending}
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
        onClose={() => router.push("/species")}
        onSubmit={handleSubmit}
      />
    </FormPage>
  );
}
