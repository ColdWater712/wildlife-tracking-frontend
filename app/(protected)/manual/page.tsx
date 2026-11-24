"use client";

import { useState, useSyncExternalStore } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import { MANUAL_CHAPTERS } from "@/components/manual/manual-data";
import { NormalManualView } from "@/components/manual/normal-manual";
import { PeakExperienceStage } from "@/components/manual/peak-experiences";
import { usePreferences } from "@/components/providers/preferences-provider";
import { PageHeader } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

type ManualMode = "normal" | "peak";

const MODE_KEY = "manual-view-mode";
const MODE_EVENT = "manual-mode-change";

const readMode = (): ManualMode => {
  if (typeof window === "undefined") return "normal";
  try {
    return window.localStorage.getItem(MODE_KEY) === "peak" ? "peak" : "normal";
  } catch {
    return "normal";
  }
};

const subscribeMode = (cb: () => void) => {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", cb);
  window.addEventListener(MODE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(MODE_EVENT, cb);
  };
};

export default function UserManualPage() {
  const { locale } = usePreferences();
  const mode = useSyncExternalStore(subscribeMode, readMode, () => "normal" as ManualMode);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const setMode = (next: ManualMode) => {
    try {
      window.localStorage.setItem(MODE_KEY, next);
    } catch {
      // Abaikan jika penyimpanan browser diblokir.
    }
    window.dispatchEvent(new Event(MODE_EVENT));
  };

  const activeChapter = MANUAL_CHAPTERS[chapterIndex] ?? MANUAL_CHAPTERS[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={locale === "en" ? "Documentation" : "Dokumentasi"}
        title={locale === "en" ? "Interactive User Manual" : "Panduan Pengguna Interaktif"}
        description={
          locale === "en"
            ? "Choose Normal Mode for fast reading or Peak Mode for 3D typography, a 360° rotatable chapter sheet, and a living 3D Gunung Leuser world."
            : "Pilih Normal Mode untuk membaca cepat atau Peak Mode untuk tipografi 3D, halaman bab yang dapat diputar 360°, serta dunia mini 3D Gunung Leuser."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label={locale === "en" ? "Manual view mode" : "Mode tampilan panduan"}
              className="inline-flex rounded-xl border border-line bg-surface p-1 shadow-sm"
            >
              <button
                type="button"
                onClick={() => setMode("normal")}
                aria-pressed={mode === "normal"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition",
                  mode === "normal"
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink-soft hover:bg-surface-muted",
                )}
              >
                <BookOpen className="size-3.5" /> Normal Mode
              </button>
              <button
                type="button"
                onClick={() => setMode("peak")}
                aria-pressed={mode === "peak"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition",
                  mode === "peak"
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink-soft hover:bg-surface-muted",
                )}
              >
                <Sparkles className="size-3.5" /> Peak Mode
              </button>
            </div>

            {mode === "peak" ? (
              <button
                type="button"
                onClick={() => setReducedMotion((v) => !v)}
                aria-pressed={reducedMotion}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  reducedMotion
                    ? "border-primary bg-primary-soft text-primary-dark"
                    : "border-line bg-surface text-ink-soft hover:bg-surface-muted",
                )}
              >
                {reducedMotion
                  ? locale === "en"
                    ? "Motion: Calm"
                    : "Gerak: Tenang"
                  : locale === "en"
                    ? "Motion: Full 3D"
                    : "Gerak: Penuh 3D"}
              </button>
            ) : null}
          </div>
        }
        className="mb-0"
      />

      {mode === "normal" ? (
        <NormalManualView chapters={MANUAL_CHAPTERS} locale={locale} />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm">
            <div className="flex flex-wrap gap-1.5">
              {MANUAL_CHAPTERS.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => setChapterIndex(idx)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition",
                    idx === chapterIndex
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-muted text-ink-soft hover:text-ink",
                  )}
                >
                  <span className="font-mono">{chapter.number}</span>
                  <span className="hidden sm:inline">{chapter.peakBadge[locale]}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setChapterIndex((i) => (i - 1 + MANUAL_CHAPTERS.length) % MANUAL_CHAPTERS.length)
                }
                aria-label={locale === "en" ? "Previous chapter" : "Bab sebelumnya"}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-line hover:bg-surface-muted"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-2 font-mono text-xs font-bold text-ink">
                {activeChapter.number} / 0{MANUAL_CHAPTERS.length}
              </span>
              <button
                type="button"
                onClick={() => setChapterIndex((i) => (i + 1) % MANUAL_CHAPTERS.length)}
                aria-label={locale === "en" ? "Next chapter" : "Bab berikutnya"}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-line hover:bg-surface-muted"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <PeakExperienceStage
            chapter={activeChapter}
            locale={locale}
            reducedMotion={reducedMotion}
          />
        </div>
      )}
    </div>
  );
}
