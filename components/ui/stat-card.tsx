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
  neutral: "border-line bg-surface text-ink",
  positive: "border-primary/25 bg-primary-soft/60 text-primary-dark",
  warning: "border-accent/30 bg-accent-soft/70 text-accent",
  info: "border-sky-200 bg-sky-50/70 text-sky-900",
  danger: "border-danger/25 bg-danger-soft text-danger",
} as const;

const ICON_STYLES = {
  neutral: "bg-surface-muted text-primary",
  positive: "bg-primary/10 text-primary",
  warning: "bg-accent/15 text-accent",
  info: "bg-sky-100 text-sky-700",
  danger: "bg-danger/10 text-danger",
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
