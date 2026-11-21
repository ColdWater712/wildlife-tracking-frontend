import { notFound } from "next/navigation";

import { AnimalFormPage } from "@/components/shared/animals/animal-form-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnimalUpdatePage({ params }: PageProps) {
  const { id } = await params;
  const recordId = Number(id);

  if (!Number.isInteger(recordId) || recordId <= 0) notFound();

  return <AnimalFormPage recordId={recordId} />;
}
