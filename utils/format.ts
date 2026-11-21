type DateValue = string | null | undefined;

const getValidDate = (value: DateValue) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value: DateValue) => {
  if (!value) return "-";

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;

  const date = getValidDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatDisplayValue = (
  value: number | string | null | undefined,
) => {
  if (value === null || value === undefined || value === "") return "—";

  return String(value);
};

export const formatGeoJson = (
  value: string | Record<string, unknown> | null | undefined,
) => {
  if (value === null || value === undefined) return "—";

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
};
