import { notFound } from "next/navigation";

import { DeviceFormPage } from "@/components/shared/devices/device-form-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DeviceUpdatePage({ params }: PageProps) {
  const { id } = await params;
  const recordId = Number(id);

  if (!Number.isInteger(recordId) || recordId <= 0) notFound();

  return <DeviceFormPage recordId={recordId} />;
}
