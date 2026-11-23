import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "warning" | "info" | "danger";
  icon?: ReactNode;
  color?: string;
  className?: string;
};

const TONE_STYLES = {
  neutral: "border-natural-muted bg-white text-forest-black",
  positive: "border-forest-primary/30 bg-white text-forest-deep",
  warning: "border-warning/25 bg-white text-warning",
  info: "border-info/25 bg-white text-info",
  danger: "border-danger/25 bg-white text-danger",
} as const;

const ICON_STYLES = {
  neutral: "bg-natural-muted/50 text-forest-primary",
  positive: "bg-forest-primary text-white",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  danger: "bg-danger-soft text-danger",
} as const;

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
  color,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-card border px-4 py-4 shadow-sm",
        TONE_STYLES[tone],
        color,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] opacity-70">
          {label}
        </p>
        {icon !== undefined ? (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              ICON_STYLES[tone],
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="break-words text-2xl font-bold leading-tight tracking-tight tabular-nums sm:text-3xl">
        {value}
      </p>
      {hint !== undefined ? (
        <p className="text-xs font-medium opacity-70">{hint}</p>
      ) : null}
    </div>
  );
}
