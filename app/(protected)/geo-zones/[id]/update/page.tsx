import { GeoZoneFormPage } from "@/components/shared/geo-zones/geo-zone-form-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GeoZoneUpdatePage({ params }: PageProps) {
  const { id } = await params;
  const recordId = Number(id);

  return <GeoZoneFormPage recordId={recordId} />;
}
