import type { FilterOption, FilterValues } from "@/components/ui/data-filters";
import type { TYPE_CONSERVATION_STATUS } from "@/types/species.type";
import {
  TYPE_CONSERVATION_STATUS_LABELS,
  TYPE_CONSERVATION_STATUSES,
} from "@/types/species.type";

export type SpeciesStatusFilter = "all" | TYPE_CONSERVATION_STATUS;

export type SpeciesFilterValues = FilterValues & {
  search: string;
  conservation_status: SpeciesStatusFilter;
};

export const DEFAULT_SPECIES_FILTERS: SpeciesFilterValues = {
  search: "",
  conservation_status: "all",
};

export const CONSERVATION_OPTIONS: FilterOption[] = [
  { label: "Semua status", value: "all" },
  ...TYPE_CONSERVATION_STATUSES.map((status) => ({
    label: TYPE_CONSERVATION_STATUS_LABELS[status],
    value: status,
  })),
];
