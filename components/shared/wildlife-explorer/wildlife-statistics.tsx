import { Dna, MapPin, PawPrint, Radio } from "lucide-react";

import { ErrorState } from "@/components/ui/error-state";
import { StatCard } from "@/components/ui/stat-card";
import { toApiErrorState } from "@/services/api";

type WildlifeStatisticsProps = {
  totalAnimals: number | null;
  totalSpecies: number | null;
  activeAnimals: number | null;
  locationCount: number | null;
  isLoading: boolean;
  speciesError: unknown;
  onRetrySpecies: () => void;
};

const displayValue = (value: number | null) =>
  value === null ? "—" : String(value);

export function WildlifeStatistics({
  totalAnimals,
  totalSpecies,
  activeAnimals,
  locationCount,
  isLoading,
  speciesError,
  onRetrySpecies,
}: WildlifeStatisticsProps) {
  const hint = isLoading ? "Menunggu data backend" : "Data dari backend";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Satwa"
          value={displayValue(totalAnimals)}
          hint={hint}
          tone="neutral"
          icon={<PawPrint className="size-4" />}
        />
        <StatCard
          label="Total Spesies"
          value={displayValue(totalSpecies)}
          hint={hint}
          tone="info"
          icon={<Dna className="size-4" />}
        />
        <StatCard
          label="Satwa Aktif Dipantau"
          value={displayValue(activeAnimals)}
          hint={hint}
          tone="positive"
          icon={<Radio className="size-4" />}
        />
        <StatCard
          label="Lokasi Pemantauan"
          value={displayValue(locationCount)}
          hint="Koordinat GPS valid terakhir"
          tone="warning"
          icon={<MapPin className="size-4" />}
        />
      </div>

      {speciesError ? (
        <ErrorState
          kind={toApiErrorState(speciesError).kind}
          message={toApiErrorState(speciesError).message}
          status={toApiErrorState(speciesError).status}
          errors={toApiErrorState(speciesError).errors}
          onRetry={onRetrySpecies}
        />
      ) : null}
    </div>
  );
}
