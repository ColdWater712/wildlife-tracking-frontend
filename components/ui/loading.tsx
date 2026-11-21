import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingProps = {
  label?: string;
  className?: string;
};

export function Loading({ label = "Memuat data...", className }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line bg-surface/60 text-muted",
        className,
      )}
    >
      <LoaderCircle aria-hidden="true" className="size-7 animate-spin text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
