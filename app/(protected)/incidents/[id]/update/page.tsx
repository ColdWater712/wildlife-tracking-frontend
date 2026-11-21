import { notFound } from "next/navigation";

import { IncidentFormPage } from "@/components/shared/incidents/incident-form-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function IncidentUpdatePage({ params }: PageProps) {
  const { id } = await params;
  const recordId = Number(id);

  if (!Number.isInteger(recordId) || recordId <= 0) notFound();

  return <IncidentFormPage recordId={recordId} />;
}
