import type { TYPE_SPECIES_REF } from "@/types/animal.type";

export type DeviceType = "gps" | "camera" | "audio";
export type DeviceCondition = "normal" | "damaged" | "lost";

export type TrackingDeviceZone = {
  zone_id: number;
  zone_name: string;
  zone_type?: string;
};

export type TrackingDeviceAnimal = {
  animal_id: number;
  species_id: number;
  name_animal: string;
  name?: string;
  animal_code?: string;
  birth_date: string | null;
  gender: "male" | "female" | "unknown";
  distinctive_marks?: string | null;
  is_active: boolean | number;
  species?: TYPE_SPECIES_REF | null;
};

export type TrackingDevice = {
  device_id: number;
  device_type: DeviceType;
  animal_id: number | null;
  zone_id: number | null;
  model: string;
  serial_number: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  installation_date: string | null;
  battery_life_months: number | null;
  is_active: boolean;
  device_condition: DeviceCondition;
  battery_level: number | null;
  signal_strength: number | null;
  last_recorded_at: string | null;
  animal?: TrackingDeviceAnimal | null;
  zone?: TrackingDeviceZone | null;
  latestReading?: {
    reading_id: number;
    latitude: number | string;
    longitude: number | string;
    recorded_at: string;
  } | null;
};

export type DeviceAlert = {
  device_id: number;
  device_type?: DeviceType;
  animal_id: number | null;
  model: string;
  battery_level: number | null;
  signal_strength: number | null;
  device_condition: DeviceCondition;
};

export type DeviceAlertReason = "low_battery" | "weak_signal";

export type TrackingDeviceListParams = {
  device_type?: DeviceType | DeviceType[] | string;
  is_active?: boolean;
  device_condition?: DeviceCondition;
  animal_id?: number;
  zone_id?: number;
  battery_low?: boolean;
  max_battery?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
};

export type TYPE_TRACKING_DEVICE_PAYLOAD = {
  device_type?: DeviceType;
  model: string;
  serial_number?: string | null;
  animal_id?: number | null;
  zone_id?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  installation_date?: string | null;
  battery_life_months?: number | null;
  is_active?: boolean;
  device_condition?: DeviceCondition;
  battery_level?: number | null;
  signal_strength?: number | null;
  last_recorded_at?: string | null;
};

export type TYPE_TRACKING_DEVICE_UPDATE_PAYLOAD =
  Partial<TYPE_TRACKING_DEVICE_PAYLOAD>;

export type API_TRACKING_DEVICE = {
  device_id: number;
  device_type: DeviceType;
  animal_id: number | null;
  zone_id: number | null;
  model: string;
  serial_number: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  installation_date: string | null;
  battery_life_months: number | null;
  is_active: boolean | number;
  device_condition: DeviceCondition;
  battery_level: number | string | null;
  signal_strength: number | string | null;
  last_recorded_at: string | null;
  animal?: TrackingDeviceAnimal | null;
  zone?: TrackingDeviceZone | null;
  latestReading?: TrackingDevice["latestReading"];
};

export const DEVICE_TYPES: DeviceType[] = ["gps", "camera", "audio"];
export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  gps: "Kalung GPS",
  camera: "Kamera Jebak",
  audio: "Perekam Audio",
};
export const DEVICE_CONDITIONS: DeviceCondition[] = [
  "normal",
  "damaged",
  "lost",
];
export const DEVICE_CONDITION_LABELS: Record<DeviceCondition, string> = {
  normal: "Normal",
  damaged: "Rusak",
  lost: "Hilang",
};
