"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

import { useAnimals } from "@/hooks/use-animals";
import { useDebounce } from "@/hooks/use-debounce";
import { useSpecies } from "@/hooks/use-species";
import { useGpsReadings } from "@/hooks/use-tracking";
import { Loading } from "@/components/ui/loading";
import type {
  WildlifeCatalogItem,
  WildlifeFilterOption,
  WildlifeMarker,
  WildlifeMonitoringStatus,
} from "@/types/wildlife-explorer.type";
import { Wildlife3DViewer } from "./wildlife-3d-viewer";
import { WildlifeCatalog } from "./wildlife-catalog";
import { WildlifeDetailPanel } from "./wildlife-detail-panel";
import { WildlifeHero } from "./wildlife-hero";
import { WildlifeStatistics } from "./wildlife-statistics";

const WildlifeMap = dynamic(
  () => import("./wildlife-map").then((module) => module.WildlifeMap),
  {
    ssr: false,
    loading: () => <Loading label="Memuat peta..." />,
  },
);

const toMonitoringStatus = (isActive: boolean): WildlifeMonitoringStatus =>
  isActive ? "Aktif" : "Tidak Aktif";

export function WildlifeExplorerView() {
  const animalsQuery = useAnimals();
  const speciesQuery = useSpecies();
  const readingsQuery = useGpsReadings();

  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 250);

  const animals = useMemo(
    () => animalsQuery.data?.data.items ?? [],
    [animalsQuery.data],
  );
  const speciesList = useMemo(
    () => speciesQuery.data?.data.items ?? [],
    [speciesQuery.data],
  );
  const readings = useMemo(
    () => readingsQuery.data?.data ?? [],
    [readingsQuery.data],
  );

  const animalsById = useMemo(
    () => new Map(animals.map((animal) => [animal.animal_id, animal])),
    [animals],
  );
  const speciesById = useMemo(
    () => new Map(speciesList.map((species) => [species.species_id, species])),
    [speciesList],
  );

  const markers = useMemo<WildlifeMarker[]>(() => {
    const latestByAnimal = new Map<number, WildlifeMarker>();

    readings.forEach((reading) => {
      const readingAnimal = reading.device?.animal;
      if (!readingAnimal) return;

      const animalId = Number(readingAnimal.animal_id);
      const animal = animalsById.get(animalId);
      if (!animal) return;

      const latitude = Number(reading.latitude);
      const longitude = Number(reading.longitude);
      const recordedTime = new Date(reading.recorded_at).getTime();

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180 ||
        !Number.isFinite(recordedTime)
      ) {
        return;
      }

      const existing = latestByAnimal.get(animalId);
      if (
        existing &&
        new Date(existing.recordedAt).getTime() >= recordedTime
      ) {
        return;
      }

      const species = animal.species ?? speciesById.get(animal.species_id) ?? null;

      latestByAnimal.set(animalId, {
        animalId,
        animalCode: animal.animal_code,
        speciesId: animal.species_id,
        speciesName: species?.common_name ?? `Spesies #${animal.species_id}`,
        scientificName: species?.scientific_name ?? null,
        conservationStatus: species?.conservation_status ?? null,
        monitoringStatus: toMonitoringStatus(animal.is_active),
        deviceId: Number(reading.device_id),
        deviceModel: animal.trackingDevice?.model ?? null,
        latitude,
        longitude,
        recordedAt: reading.recorded_at,
      });
    });

    return [...latestByAnimal.values()].sort(
      (left, right) =>
        new Date(right.recordedAt).getTime() -
        new Date(left.recordedAt).getTime(),
    );
  }, [readings, animalsById, speciesById]);

  const markersByAnimalId = useMemo(
    () => new Map(markers.map((marker) => [marker.animalId, marker])),
    [markers],
  );

  const catalogItems = useMemo<WildlifeCatalogItem[]>(
    () =>
      animals.map((animal) => {
        const species =
          animal.species ?? speciesById.get(animal.species_id) ?? null;
        const latestLocation =
          markersByAnimalId.get(animal.animal_id) ?? null;

        return {
          animalId: animal.animal_id,
          animalCode: animal.animal_code,
          speciesId: animal.species_id,
          speciesName: species?.common_name ?? `Spesies #${animal.species_id}`,
          scientificName: species?.scientific_name ?? null,
          conservationStatus: species?.conservation_status ?? null,
          monitoringStatus: toMonitoringStatus(animal.is_active),
          gender: animal.gender,
          birthDate: animal.birth_date,
          deviceModel: animal.trackingDevice?.model ?? null,
          latestLocation,
        };
      }),
    [animals, speciesById, markersByAnimalId],
  );

  const speciesOptions = useMemo<WildlifeFilterOption[]>(() => {
    const options = new Map<number, string>();

    speciesList.forEach((species) => {
      options.set(species.species_id, species.common_name);
    });
    catalogItems.forEach((item) => {
      if (!options.has(item.speciesId)) {
        options.set(item.speciesId, item.speciesName);
      }
    });

    return [...options.entries()]
      .map(([id, label]) => ({ value: String(id), label }))
      .sort((left, right) => left.label.localeCompare(right.label, "id-ID"));
  }, [speciesList, catalogItems]);

  const statusOptions = useMemo(
    () => [...new Set(catalogItems.map((item) => item.monitoringStatus))].sort(),
    [catalogItems],
  );

  const normalizedSearch = debouncedSearch.trim().toLocaleLowerCase("id-ID");

  const filteredCatalogItems = useMemo(
    () =>
      catalogItems.filter((item) => {
        const searchableValues = [
          item.animalCode,
          item.speciesName,
          item.scientificName,
        ];
        const matchesSearch =
          normalizedSearch.length === 0 ||
          searchableValues.some((value) =>
            value?.toLocaleLowerCase("id-ID").includes(normalizedSearch),
          );
        const matchesSpecies =
          speciesFilter === "all" || String(item.speciesId) === speciesFilter;
        const matchesStatus =
          statusFilter === "all" || item.monitoringStatus === statusFilter;

        return matchesSearch && matchesSpecies && matchesStatus;
      }),
    [catalogItems, normalizedSearch, speciesFilter, statusFilter],
  );

  const selectedItem = useMemo(
    () =>
      catalogItems.find((item) => item.animalId === selectedAnimalId) ?? null,
    [catalogItems, selectedAnimalId],
  );

  const isAnyLoading =
    animalsQuery.isPending || speciesQuery.isPending || readingsQuery.isPending;

  const locationCount = readingsQuery.isError
    ? null
    : new Set(
        markers.map((marker) => `${marker.latitude},${marker.longitude}`),
      ).size;

  const handleSelect = useCallback((animalId: number) => {
    setSelectedAnimalId(animalId);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSpeciesFilter("all");
    setStatusFilter("all");
  }, []);

  const hasActiveFilters =
    search.length > 0 || speciesFilter !== "all" || statusFilter !== "all";

  return (
    <div className="flex flex-col gap-6">
      <WildlifeHero />

      <WildlifeStatistics
        totalAnimals={animalsQuery.isPending ? null : animals.length}
        totalSpecies={speciesQuery.isPending ? null : speciesList.length}
        activeAnimals={
          animalsQuery.isPending
            ? null
            : animals.filter((animal) => animal.is_active).length
        }
        locationCount={readingsQuery.isPending ? null : locationCount}
        isLoading={isAnyLoading}
        speciesError={speciesQuery.error}
        onRetrySpecies={() => void speciesQuery.refetch()}
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
        <div className="min-w-0">
          <WildlifeCatalog
            items={filteredCatalogItems}
            isLoading={animalsQuery.isPending}
            error={animalsQuery.error}
            onRetry={() => void animalsQuery.refetch()}
            hasSourceAnimals={animals.length > 0}
            hasActiveFilters={hasActiveFilters}
            selectedAnimalId={selectedAnimalId}
            onSelect={handleSelect}
            speciesOptions={speciesOptions}
            statusOptions={statusOptions}
            search={search}
            onSearchChange={setSearch}
            speciesFilter={speciesFilter}
            onSpeciesFilterChange={setSpeciesFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onResetFilters={resetFilters}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <WildlifeDetailPanel selected={selectedItem} />
          <Wildlife3DViewer selected={selectedItem} />
        </div>
      </div>

      <WildlifeMap
        markers={markers}
        selectedAnimalId={selectedAnimalId}
        onSelect={handleSelect}
        isLoading={readingsQuery.isPending}
        error={readingsQuery.error}
        onRetry={() => void readingsQuery.refetch()}
      />
    </div>
  );
}
