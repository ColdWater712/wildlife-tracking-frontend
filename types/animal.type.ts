import type { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { TYPE_SPECIES } from "@/types/species.type";

export type TYPE_ANIMAL_GENDER =
  | "Jantan"
  | "Betina"
  | "Tidak Diketahui";

export type TYPE_ANIMAL_GENDER_API = "male" | "female" | "unknown";

export type ApiAnimalGender = TYPE_ANIMAL_GENDER_API;

export type AnimalLatestAiObservation = {
  prediction_id: number;
  physical_condition: string | null;
  condition_notes: string | null;
  behavior: string | null;
  behavior_notes: string | null;
  observed_at: string | null;
};

export type ApiTrackingDeviceSummary = {
  device_id: number;
  animal_id?: number | null;
  device_type?: "gps" | "camera" | "audio";
  model?: string;
  serial_number?: string | null;
  zone_id?: number | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  installation_date?: string | null;
  battery_life_months?: number | null;
  battery_level?: number | string | null;
  signal_strength?: number | string | null;
  device_condition?: string;
  is_active?: boolean | number;
  last_recorded_at?: string | null;
  latestReading?: {
    reading_id: number;
    latitude: number | string;
    longitude: number | string;
    recorded_at: string;
  } | null;
};

export type API_ANIMAL = {
  animal_id: number;
  species_id: number;
  name_animal: string;
  name?: string;
  birth_date: string | null;
  gender: TYPE_ANIMAL_GENDER_API;
  distinctive_marks?: string | null;
  is_active: boolean | number;
  species?: TYPE_SPECIES | null;
  trackingDevice?: ApiTrackingDeviceSummary | null;
  latest_ai_observation?: AnimalLatestAiObservation | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TYPE_SPECIES_REF = {
  species_id: number;
  common_name: string;
  scientific_name: string;
  conservation_status?: TYPE_SPECIES["conservation_status"];
};

export type TYPE_TRACKING_DEVICE = {
  device_id: number;
  animal_id: number | null;
  device_type: "gps" | "camera" | "audio";
  model: string;
  serial_number: string | null;
  zone_id: number | null;
  latitude: number | string | null;
  longitude: number | string | null;
  installation_date: string | null;
  battery_life_months: number | null;
  is_active: boolean;
  device_condition: string;
  battery_level: number | null;
  signal_strength: number | null;
  last_recorded_at: string | null;
};

export type TYPE_ANIMAL = {
  animal_id: number;
  species_id: number;
  animal_code: string;
  birth_date: string | null;
  gender: TYPE_ANIMAL_GENDER;
  distinctive_marks: string | null;
  is_active: boolean;
  species?: TYPE_SPECIES_REF | null;
  trackingDevice?: TYPE_TRACKING_DEVICE | null;
  latest_ai_observation?: AnimalLatestAiObservation | null;
  created_at: string;
  updated_at: string;
};

export type TYPE_ANIMAL_PAYLOAD_GENDER = TYPE_ANIMAL_GENDER;

export type TYPE_ANIMAL_PAYLOAD = {
  species_id: number;
  animal_code: string;
  birth_date: string | null;
  gender: TYPE_ANIMAL_PAYLOAD_GENDER;
  distinctive_marks?: string | null;
  is_active: boolean;
};

export type TYPE_ANIMAL_GET_ALL_RESPONSE = {
  items: TYPE_ANIMAL[];
  meta: TYPE_META_PAGGINATION;
};

export type TYPE_ANIMAL_GET_BY_ID_RESPONSE = {
  items: TYPE_ANIMAL | null;
  meta: null;
};

export const TYPE_ANIMAL_GENDER_LABELS: Record<
  TYPE_ANIMAL_GENDER,
  string
> = {
  Jantan: "Jantan",
  Betina: "Betina",
  "Tidak Diketahui": "Tidak Diketahui",
};

export const TYPE_ANIMAL_GENDER_GLYPHS: Record<
  TYPE_ANIMAL_GENDER,
  string
> = {
  Jantan: "♂",
  Betina: "♀",
  "Tidak Diketahui": "?",
};

export const toApiAnimalGender = (
  gender: TYPE_ANIMAL_GENDER,
): TYPE_ANIMAL_GENDER_API => {
  if (gender === "Jantan") return "male";
  if (gender === "Betina") return "female";
  return "unknown";
};

export const fromApiAnimalGender = (
  gender: TYPE_ANIMAL_GENDER_API | string | null | undefined,
): TYPE_ANIMAL_GENDER => {
  if (gender === "male") return "Jantan";
  if (gender === "female") return "Betina";
  return "Tidak Diketahui";
};
