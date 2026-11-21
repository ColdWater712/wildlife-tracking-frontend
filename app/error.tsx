"use client";

import { ErrorState } from "@/components/ui/error-state";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <ErrorState
        kind="unknown"
        message={error.message || "Terjadi kesalahan saat menampilkan halaman."}
        onRetry={reset}
        className="w-full max-w-lg"
      />
    </main>
  );
}
