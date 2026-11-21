import { SpeciesDetailView } from "@/components/shared/species/species-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SpeciesDetailPage({ params }: PageProps) {
  const { id } = await params;
  const speciesId = Number(id);

  return (
    <SpeciesDetailView speciesId={Number.isFinite(speciesId) ? speciesId : -1} />
  );
}