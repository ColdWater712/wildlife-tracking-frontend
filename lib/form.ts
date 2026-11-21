export type FormErrors<T extends string = string> = Partial<Record<T, string>>;

type ValidationIssueLike = {
  path: readonly PropertyKey[];
  message: string;
};

export const issuesToFieldErrors = <T extends string>(
  issues: readonly ValidationIssueLike[],
  fields: readonly T[],
): FormErrors<T> => {
  const errors: FormErrors<T> = {};

  for (const issue of issues) {
    const field = String(issue.path[0] ?? "") as T;

    if (fields.includes(field) && errors[field] === undefined) {
      errors[field] = issue.message;
    }
  }

  return errors;
};

export const firstIssueMessage = (
  issues: readonly ValidationIssueLike[],
  fallback: string,
): string => issues[0]?.message ?? fallback;

export const stringOrEmpty = (
  value: number | string | null | undefined,
): string => (value === null || value === undefined ? "" : String(value));

export const toOptionalNumber = (value: string): number | undefined =>
  value.trim() === "" ? undefined : Number(value);
