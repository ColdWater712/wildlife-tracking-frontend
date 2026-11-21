import Link from "next/link";
import { CircleAlert } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <section
        role="alert"
        className="ui-panel flex w-full max-w-lg flex-col items-start gap-4 p-6 sm:p-8"
      >
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-danger-soft text-danger">
          <CircleAlert aria-hidden="true" className="size-6" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-danger">
            HTTP 404
          </p>
          <h1 className="mt-2 text-2xl font-bold text-ink">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Alamat yang diminta tidak tersedia. Kembali ke dashboard atau
            periksa kembali tautan yang digunakan.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Kembali ke dashboard
        </Link>
      </section>
    </main>
  );
}
