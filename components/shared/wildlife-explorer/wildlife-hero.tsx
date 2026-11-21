import { Compass, Database, Leaf } from "lucide-react";

const DESCRIPTION =
  "Jelajahi keanekaragaman satwa, kenali karakteristik setiap spesies, dan pantau persebarannya melalui pengalaman eksplorasi interaktif.";

export function WildlifeHero() {
  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-primary/20 bg-primary-soft/70 px-5 py-8 sm:px-8 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 left-1/3 size-72 rounded-full bg-accent/10"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1 text-xs font-semibold text-primary-dark ring-1 ring-primary/20">
              <Compass aria-hidden="true" className="size-3.5" />
              Wildlife Explorer
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/60 px-3 py-1 text-xs font-medium text-ink-soft ring-1 ring-line">
              <Database aria-hidden="true" className="size-3.5" />
              Data backend langsung
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Selamat Datang di Wildlife Explorer
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
            {DESCRIPTION}
          </p>
        </div>

        <div className="flex w-full shrink-0 items-center gap-3 rounded-2xl border border-primary/20 bg-surface/85 px-4 py-3 md:w-auto">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <Leaf aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Eksplorasi konservasi</p>
            <p className="text-xs text-muted">Taman Nasional Gunung Leuser</p>
          </div>
        </div>
      </div>
    </section>
  );
}
