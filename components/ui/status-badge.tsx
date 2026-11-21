import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: "bg-primary-soft text-primary-dark ring-primary/20",
  warning: "bg-accent-soft text-accent ring-accent/25",
  danger: "bg-danger-soft text-danger ring-danger/20",
  info: "bg-sky-50 text-sky-800 ring-sky-600/20",
  neutral: "bg-surface-muted text-ink-soft ring-line-strong/60",
};

type StatusBadgeProps = {
  label: string;
  variant: BadgeVariant;
  className?: string;
};

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
