import { SearchX } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line bg-surface px-5 py-12 text-center",
        className,
      )}
    >
      <span className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <SearchX aria-hidden="true" className="size-6" />
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description !== undefined ? (
        <p className="max-w-sm text-sm leading-6 text-muted">{description}</p>
      ) : null}
      {action !== undefined ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
