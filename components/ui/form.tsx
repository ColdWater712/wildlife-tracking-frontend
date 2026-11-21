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
    <div className={cn("flex flex-col", className)}>
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
