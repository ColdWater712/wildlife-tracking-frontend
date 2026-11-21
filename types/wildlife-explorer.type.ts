import type { TYPE_CONSERVATION_STATUS } from "@/types/species.type";

export type WildlifeMonitoringStatus = "Aktif" | "Tidak Aktif";

export type WildlifeMarker = {
  animalId: number;
  animalCode: string;
  speciesId: number;
  speciesName: string;
  scientificName: string | null;
  conservationStatus: TYPE_CONSERVATION_STATUS | null;
  monitoringStatus: WildlifeMonitoringStatus;
  deviceId: number;
  deviceModel: string | null;
  latitude: number;
  longitude: number;
  recordedAt: string;
};

export type WildlifeCatalogItem = {
  animalId: number;
  animalCode: string;
  speciesId: number;
  speciesName: string;
  scientificName: string | null;
  conservationStatus: TYPE_CONSERVATION_STATUS | null;
  monitoringStatus: WildlifeMonitoringStatus;
  gender: string;
  birthDate: string | null;
  deviceModel: string | null;
  latestLocation: WildlifeMarker | null;
};

export type WildlifeFilterOption = {
  value: string;
  label: string;
};
