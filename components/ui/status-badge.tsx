import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: "bg-success-soft text-forest-primary ring-forest-primary/30",
  warning: "bg-natural-muted text-forest-black ring-natural-muted",
  danger: "bg-forest-black text-white ring-forest-black",
  info: "bg-info-soft text-forest-deep ring-forest-deep/25",
  neutral: "bg-white text-olive-dark ring-natural-muted",
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
