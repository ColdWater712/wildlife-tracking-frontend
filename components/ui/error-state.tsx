import { CircleAlert, RotateCcw } from "lucide-react";
import type { ApiErrorKind } from "@/types/api.type";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TITLES: Record<ApiErrorKind, string> = {
  unauthorized: "Sesi tidak terautentikasi (401)",
  forbidden: "Akses ditolak (403)",
  validation: "Data tidak valid (422)",
  not_found: "Data tidak ditemukan (404)",
  client: "Permintaan tidak dapat diproses (400/409)",
  server: "Server bermasalah (5xx)",
  network: "Backend tidak dapat dihubungi",
  unknown: "Terjadi kesalahan",
};

const HINTS: Record<ApiErrorKind, string[]> = {
  unauthorized: [
    "Token tidak ditemukan atau sudah kedaluwarsa.",
    "Masuk kembali melalui halaman /login.",
  ],
  forbidden: ["Peran pengguna tidak memiliki izin untuk aksi ini."],
  validation: ["Periksa kembali isian yang ditandai."],
  not_found: ["Data yang diminta tidak tersedia di backend."],
  client: [
    "Periksa konflik data atau nilai yang ditolak backend.",
    "Muat ulang halaman sebelum mencoba lagi.",
  ],
  server: ["Periksa storage/logs/laravel.log pada repo backend."],
  network: [
    "Jalankan: cd wildlife-tracking-backend && php artisan serve",
    "Pastikan MySQL aktif dan php artisan migrate sudah dijalankan.",
  ],
  unknown: ["Format respons tidak sesuai kontrak API."],
};

const VALID_KINDS: ApiErrorKind[] = [
  "unauthorized",
  "forbidden",
  "validation",
  "not_found",
  "client",
  "server",
  "network",
  "unknown",
];

type ErrorStateProps = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  errors?: Record<string, string[]> | null;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  kind,
  message,
  status,
  errors,
  onRetry,
  className,
}: ErrorStateProps) {
  const validationEntries = errors ? Object.entries(errors) : [];
  const safeKind = VALID_KINDS.includes(kind) ? kind : "unknown";

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-card border border-danger/25 bg-danger-soft px-5 py-6 text-danger",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {TITLES[safeKind]}
        </p>
        {status !== undefined && status > 0 ? (
          <span className="rounded-full bg-surface/70 px-2 py-0.5 text-xs font-semibold tabular-nums">
            HTTP {status}
          </span>
        ) : null}
      </div>

      <p className="text-sm opacity-90">{message}</p>

      {validationEntries.length > 0 ? (
        <ul className="list-inside list-disc space-y-1 text-xs opacity-90">
          {validationEntries.map(([field, messages]) => (
            <li key={field}>
              <span className="font-semibold">{field}</span>: {messages.join(", ")}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="list-inside list-disc space-y-1 text-xs opacity-70">
          {HINTS[safeKind].map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      )}

      {onRetry !== undefined ? (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            icon={<RotateCcw className="size-3.5" />}
          >
            Coba lagi
          </Button>
        </div>
      ) : null}
    </div>
  );
}
