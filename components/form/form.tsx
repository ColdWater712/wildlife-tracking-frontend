import type {
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDown, CircleAlert, CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldTone = "error" | "success" | "info";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

export const fieldDescribedBy = (
  id: string,
  hasHint = false,
  hasError = false,
): string | undefined => {
  const ids = [
    hasHint ? `${id}-hint` : undefined,
    hasError ? `${id}-error` : undefined,
  ].filter((value): value is string => value !== undefined);

  return ids.length === 0 ? undefined : ids.join(" ");
};

export function FormField({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <label htmlFor={htmlFor} className="ui-label">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint !== undefined && error === undefined ? (
        <p id={`${htmlFor}-hint`} className="ui-hint">
          {hint}
        </p>
      ) : null}
      {error !== undefined ? (
        <p id={`${htmlFor}-error`} role="alert" className="ui-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FormGridProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
};

const GRID_COLUMNS: Record<NonNullable<FormGridProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

export function FormGrid({
  children,
  columns = 2,
  className,
}: FormGridProps) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4", GRID_COLUMNS[columns], className)}
    >
      {children}
    </div>
  );
}

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("ui-panel p-4 sm:p-5", className)}>
      <div className="mb-4">
        <h3 className="text-sm font-bold tracking-tight text-ink">{title}</h3>
        {description !== undefined ? (
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

type FormCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string;
  label: string;
  description?: string;
  error?: string;
};

export function FormCheckbox({
  id,
  label,
  description,
  error,
  className,
  ...props
}: FormCheckboxProps) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <label
        htmlFor={id}
        className="flex items-start gap-3 rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:border-primary hover:bg-primary-soft/40"
      >
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-primary"
          {...props}
        />
        <span className="min-w-0">
          <span className="block">{label}</span>
          {description !== undefined ? (
            <span className="mt-0.5 block text-xs font-normal text-muted">
              {description}
            </span>
          ) : null}
        </span>
      </label>
      {error !== undefined ? (
        <p id={`${id}-error`} role="alert" className="ui-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
};

export function TextInput({
  invalid = false,
  className,
  ref,
  ...props
}: TextInputProps) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn("ui-input", invalid && "ui-input-invalid", className)}
      {...props}
    />
  );
}

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
  ref?: Ref<HTMLSelectElement>;
};

export function SelectInput({
  invalid = false,
  className,
  children,
  ref,
  ...props
}: SelectInputProps) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "ui-input appearance-none pr-10",
          invalid && "ui-input-invalid",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
};

export function TextArea({
  invalid = false,
  className,
  ref,
  ...props
}: TextAreaProps) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "ui-input min-h-24 resize-y",
        invalid && "ui-input-invalid",
        className,
      )}
      {...props}
    />
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
      {children}
    </div>
  );
}

type FormAlertProps = {
  message: string;
  tone?: FieldTone;
};

const TONE_STYLES: Record<FieldTone, { icon: ReactNode; className: string }> = {
  error: {
    icon: <CircleAlert className="size-4 shrink-0" />,
    className: "ui-alert",
  },
  success: {
    icon: <CircleCheck className="size-4 shrink-0" />,
    className:
      "flex items-start gap-2 rounded-xl border border-primary/25 bg-primary-soft p-3 text-sm text-primary-dark",
  },
  info: {
    icon: <Info className="size-4 shrink-0" />,
    className:
      "flex items-start gap-2 rounded-xl border border-accent/25 bg-accent-soft p-3 text-sm text-accent",
  },
};

export function FormAlert({ message, tone = "error" }: FormAlertProps) {
  const style = TONE_STYLES[tone];

  return (
    <div role={tone === "error" ? "alert" : "status"} className={style.className}>
      {style.icon}
      <span>{message}</span>
    </div>
  );
}
