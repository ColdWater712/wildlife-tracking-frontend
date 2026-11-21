import { notFound } from "next/navigation";

import { SpeciesFormPage } from "@/components/shared/species/species-form-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SpeciesUpdatePage({ params }: PageProps) {
  const { id } = await params;
  const recordId = Number(id);

  if (!Number.isInteger(recordId) || recordId <= 0) notFound();

  return <SpeciesFormPage recordId={recordId} />;
}
