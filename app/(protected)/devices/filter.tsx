import type { FilterOption, FilterValues } from "@/components/filter";
import type { DeviceCondition } from "@/types/device.type";

export type DeviceConditionFilter = "all" | "normal" | "damaged" | "lost";

export type DeviceActiveFilter = "all" | "active" | "inactive";

export type DeviceFilterValues = FilterValues & {
  search: string;
  device_condition: DeviceConditionFilter;
  only_active: DeviceActiveFilter;
};

export const DEFAULT_DEVICE_FILTERS: DeviceFilterValues = {
  search: "",
  device_condition: "all",
  only_active: "all",
};

export const CONDITION_OPTIONS: FilterOption[] = [
  { label: "Semua kondisi", value: "all" },
  { label: "Normal", value: "normal" },
  { label: "Rusak", value: "damaged" },
  { label: "Hilang", value: "lost" },
];

export const ACTIVE_OPTIONS: FilterOption[] = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

export const toDeviceCondition = (
  value: string,
): DeviceCondition | undefined =>
  value === "all" || value === "" ? undefined : (value as DeviceCondition);

export const toOnlyActiveDevice = (value: string): boolean | undefined => {
  if (value === "all" || value === "") return undefined;

  return value === "active";
};
