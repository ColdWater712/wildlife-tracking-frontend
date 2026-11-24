export type GpsReading = {
  reading_id: number;
  device_id: number;
  latitude: number | string;
  longitude: number | string;
  recorded_at: string;
  altitude_meters: number | string | null;
  accuracy_meters: number | string | null;
  checksum: string | null;
  battery_level?: number | string | null;
  signal_strength?: number | string | null;
  device?: {
    device_id: number;
    device_type?: "gps" | "camera" | "audio";
    model?: string;
    animal?: {
      animal_id: number;
      name_animal?: string;
      name?: string;
    } | null;
  } | null;
  trackingDevice?: {
    device_id: number;
    model: string;
    animal?: {
      animal_id: number;
      name_animal?: string;
      name?: string;
    } | null;
  } | null;
  weatherData?: unknown | null;
  zoneVisits?: unknown[];
};

export type GpsCoordinate = {
  latitude: number;
  longitude: number;
};

export type GpsReadingListParams = {
  animalId?: number;
  deviceId?: number;
  animal_id?: number;
  device_id?: number;
  start_date?: string;
  end_date?: string;
  min_lat?: number;
  max_lat?: number;
  min_lon?: number;
  max_lon?: number;
  latest_only?: boolean;
  limit?: number;
  page?: number;
  per_page?: number;
};

export type GpsReadingBulkItem = {
  device_id: number;
  latitude: number;
  longitude: number;
  recorded_at: string;
  altitude_meters?: number | null;
  accuracy_meters?: number | null;
  checksum?: string | null;
  battery_level?: number | null;
  signal_strength?: number | null;
};

export type GpsReadingCreatePayload = GpsReadingBulkItem;

export type GpsReadingBulkResult = {
  created: number;
  skipped_duplicates: number;
  readings: GpsReading[];
};
