import type { FilterField, FilterValues } from "@/components/filter";
import type { TYPE_SPECIES } from "@/types/species.type";

export type AnimalFilterValues = FilterValues & {
  search: string;
  species_id: string;
  status: string;
};

export const ANIMAL_INITIAL_FILTERS: AnimalFilterValues = {
  search: "",
  species_id: "all",
  status: "all",
};

export const getAnimalFilterFields = (
  speciesList: TYPE_SPECIES[],
): FilterField[] => [
  {
    key: "search",
    kind: "search",
    label: "Cari Satwa",
    placeholder: "Cari nama, kode, atau perangkat GPS...",
  },
  {
    key: "species_id",
    kind: "select",
    label: "Spesies",
    options: [
      {
        label: "Semua Spesies",
        value: "all",
      },
      ...speciesList.map((species) => ({
        label: species.common_name,
        value: String(species.species_id),
      })),
    ],
  },
  {
    key: "status",
    kind: "select",
    label: "Status",
    options: [
      {
        label: "Semua Status",
        value: "all",
      },
      {
        label: "Terpantau",
        value: "active",
      },
      {
        label: "Tidak Terpantau",
        value: "inactive",
      },
    ],
  },
];
