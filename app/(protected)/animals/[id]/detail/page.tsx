import { AnimalDetailView } from "@/components/shared/animals/animal-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnimalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const animalId = Number(id);

  return (
    <AnimalDetailView animalId={Number.isFinite(animalId) ? animalId : -1} />
  );
}