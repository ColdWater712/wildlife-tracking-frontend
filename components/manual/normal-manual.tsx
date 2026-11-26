"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Clock, Search } from "lucide-react";

import type { AppLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ManualChapter } from "./manual-data";

export function NormalManualView({
  chapters,
  locale,
}: {
  chapters: ManualChapter[];
  locale: AppLocale;
}) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.title[locale].toLowerCase().includes(q) ||
        c.subtitle[locale].toLowerCase().includes(q) ||
        c.summary[locale].toLowerCase().includes(q) ||
        c.steps.some(
          (s) =>
            s.heading[locale].toLowerCase().includes(q) ||
            s.body[locale].toLowerCase().includes(q),
        ),
    );
  }, [chapters, locale, query]);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Clean borderless docs sidebar TOC */}
      <aside className="flex flex-col gap-5 lg:sticky lg:top-20">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === "en" ? "Search guide..." : "Cari panduan..."}
            className="ui-input pl-9 text-sm"
          />
        </div>

        <nav aria-label={locale === "en" ? "Manual chapters" : "Daftar bab panduan"}>
          <p className="mb-2.5 text-xs font-semibold text-muted">
            {locale === "en" ? "Contents" : "Daftar Isi"}
          </p>
          <ul className="flex flex-col border-l border-line">
            {filtered.map((chapter) => {
              const isActive = activeId === chapter.id;
              return (
                <li key={chapter.id}>
                  <a
                    href={`#chapter-${chapter.id}`}
                    onClick={() => setActiveId(chapter.id)}
                    className={cn(
                      "-ml-px block border-l-2 py-2 pl-3.5 pr-2 text-[13px] leading-snug transition-colors",
                      isActive
                        ? "border-primary font-semibold text-ink"
                        : "border-transparent text-muted hover:border-line-strong/50 hover:text-ink",
                    )}
                  >
                    {chapter.title[locale]}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Natural, open editorial documentation column */}
      <div className="min-w-0 max-w-3xl divide-y divide-line">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            {locale === "en"
              ? "No topics match your search."
              : "Tidak ada topik yang cocok dengan pencarian Anda."}
          </div>
        ) : (
          filtered.map((chapter) => (
            <article
              key={chapter.id}
              id={`chapter-${chapter.id}`}
              className="scroll-mt-24 py-8 first:pt-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span className="font-semibold text-primary">
                  {locale === "en" ? `Chapter ${Number(chapter.number)}` : `Bab ${Number(chapter.number)}`}
                </span>
                <span aria-hidden="true">·</span>
                <span>{chapter.roles.map((r) => r[locale]).join(", ")}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {chapter.readMinutes} {locale === "en" ? "min read" : "menit baca"}
                </span>
              </div>

              <h3 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">
                {chapter.title[locale]}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">
                {chapter.subtitle[locale]}
              </p>
              <p className="mt-4 text-[14.5px] leading-7 text-ink-soft">
                {chapter.summary[locale]}
              </p>

              <ol className="mt-7 space-y-6">
                {chapter.steps.map((step, index) => (
                  <li key={step.id} className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h4 className="text-[15px] font-semibold text-ink">
                        {index + 1}. {step.heading[locale]}
                      </h4>
                      {step.badge ? (
                        <span className="text-xs font-medium text-primary">
                          — {step.badge[locale]}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm leading-6 text-ink-soft">{step.body[locale]}</p>
                    {step.details.length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-ink-soft marker:text-primary/60">
                        {step.details.map((detail, dIdx) => (
                          <li key={dIdx}>{detail[locale]}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ol>

              {chapter.tips.length > 0 ? (
                <div className="mt-7 border-l-2 border-primary/50 pl-4">
                  <p className="text-xs font-semibold text-ink">
                    {locale === "en" ? "Notes" : "Catatan"}
                  </p>
                  <ul className="mt-1.5 space-y-1.5 text-sm leading-6 text-muted">
                    {chapter.tips.map((tip, idx) => (
                      <li key={idx}>{tip[locale]}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {chapter.links.length > 0 ? (
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {chapter.links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary-dark hover:underline"
                    >
                      <span>{item.label[locale]}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
