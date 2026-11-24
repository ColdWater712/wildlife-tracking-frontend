export type GeoZoneFilterValues = {
  search: string;
  zoneType: string;
};

export const INITIAL_FILTERS: GeoZoneFilterValues = {
  search: "",
  zoneType: "all",
};

export const ZONE_TYPE_OPTIONS = [
  { label: "Semua Jenis", value: "all" },
  { label: "Jalan Raya", value: "jalan_raya" },
  { label: "Koridor Ekologis", value: "koridor_ekologis" },
  { label: "Perkebunan", value: "perkebunan" },
  { label: "Permukiman", value: "permukiman" },
  { label: "Hutan Lindung", value: "hutan_lindung" },
  { label: "Zona Inti", value: "zona_inti" },
];
