import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import type { ApiErrorState } from "@/types/api.type";

type FormPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  isLoading?: boolean;
  loadingLabel?: string;
  error?: ApiErrorState | null;
  notFound?: boolean;
  notFoundTitle?: string;
  onRetry?: () => void;
  children: ReactNode;
};

export function FormPage({
  eyebrow,
  title,
  description,
  backHref,
  isLoading = false,
  loadingLabel = "Memuat data...",
  error = null,
  notFound = false,
  notFoundTitle = "Data tidak ditemukan",
  onRetry,
  children,
}: FormPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-4"
        actions={
          <Link
            href={backHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink-soft transition hover:border-primary hover:bg-primary-soft hover:text-primary"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali
          </Link>
        }
      />

      <div className="mx-auto w-full min-w-0 max-w-5xl">
        {error ? (
          <ErrorState
            kind={error.kind}
            message={error.message}
            status={error.status}
            errors={error.errors}
            onRetry={onRetry}
          />
        ) : notFound ? (
          <EmptyState
            title={notFoundTitle}
            description="Data tidak tersedia di backend."
          />
        ) : isLoading ? (
          <Loading label={loadingLabel} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
