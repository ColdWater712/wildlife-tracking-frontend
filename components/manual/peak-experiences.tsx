"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FlipHorizontal2,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import type { AppLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ManualChapter } from "./manual-data";

const LivingWorldCanvas = dynamic(
  () => import("./living-world-canvas").then((mod) => mod.LivingWorldCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full animate-pulse rounded-2xl border border-line bg-surface-muted" />
    ),
  },
);

function ChapterFooter({ chapter, locale }: { chapter: ManualChapter; locale: AppLocale }) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-line bg-surface-muted/60 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Lightbulb className="size-3.5" />
          {locale === "en" ? "Key Notes & Tips" : "Catatan & Tips Penting"}
        </p>
        <ul className="flex flex-col gap-1.5 text-xs leading-5 text-ink-soft">
          {chapter.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{tip[locale]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">
          {locale === "en" ? "Jump to Feature" : "Buka Fitur Terkait"}
        </p>
        <div className="flex flex-wrap gap-2">
          {chapter.links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-primary-dark"
            >
              {item.label[locale]} <ArrowRight className="size-3.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Bab 01: Tipografi 3D berlapis yang mengikuti arah kursor + kartu langkah yang mudah dibaca. */
function Typography3DStage({
  chapter,
  locale,
  reducedMotion,
}: {
  chapter: ManualChapter;
  locale: AppLocale;
  reducedMotion: boolean;
}) {
  const [tilt, setTilt] = useState({ rx: -4, ry: 6 });
  const stageRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -ny * 18, ry: nx * 24 });
  };

  return (
    <div>
      <div
        ref={stageRef}
        onPointerMove={handleMove}
        onPointerLeave={() => setTilt({ rx: -4, ry: 6 })}
        className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#0f1f17] via-[#1b3629] to-[#294d3b] p-8 text-white shadow-xl sm:p-10"
        style={{ perspective: "1100px" }}
      >
        <div
          className="transition-transform duration-200 ease-out"
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#b4d6bc]">
            BAB {chapter.number} · {chapter.peakBadge[locale]}
          </p>
          <h3
            className="mt-3 text-3xl font-black tracking-tight sm:text-5xl"
            style={{
              transform: "translateZ(36px)",
              textShadow:
                "0 1px 0 #1f4432, 0 2px 0 #1a3a2b, 0 3px 0 #153023, 0 4px 0 #11261c, 0 10px 24px rgba(0,0,0,0.45)",
            }}
          >
            {chapter.title[locale]}
          </h3>
          <p
            className="mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:text-base"
            style={{ transform: "translateZ(18px)" }}
          >
            {chapter.summary[locale]}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {chapter.roles.map((r, i) => (
            <span
              key={i}
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur"
            >
              {r[locale]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {chapter.steps.map((step, index) => (
          <article
            key={step.id}
            className="ui-panel flex flex-col gap-2 p-5 transition hover:-translate-y-0.5 hover:border-primary"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-primary">
                0{index + 1}
              </span>
              {step.badge ? (
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary-dark">
                  {step.badge[locale]}
                </span>
              ) : null}
            </div>
            <h4 className="text-base font-bold text-ink">{step.heading[locale]}</h4>
            <p className="text-sm leading-6 text-ink-soft">{step.body[locale]}</p>
          </article>
        ))}
      </div>

      <ChapterFooter chapter={chapter} locale={locale} />
    </div>
  );
}

/** Bab 02: Satu halaman bab 3D dua sisi yang dapat diputar bebas 360° dengan drag, slider, atau Flip 180°. */
function RotatablePageStage({
  chapter,
  locale,
}: {
  chapter: ManualChapter;
  locale: AppLocale;
}) {
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(0);
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { active: true, x: e.clientX, y: e.clientY };
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
    setRotY((prev) => prev + dx * 0.55);
    setRotX((prev) => Math.max(-35, Math.min(35, prev - dy * 0.35)));
  };
  const onUp = () => {
    dragRef.current.active = false;
  };

  const frontSteps = chapter.steps.slice(0, 2);
  const backSteps = chapter.steps.slice(2);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface-muted/70 px-4 py-3">
        <p className="text-xs font-semibold text-ink-soft">
          {locale === "en"
            ? "Drag anywhere on the 3D sheet to rotate 360°, or use controls:"
            : "Seret lembaran 3D di bawah untuk memutar 360°, atau gunakan kontrol:"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="range"
            min={-180}
            max={180}
            value={Math.round(((rotY % 360) + 540) % 360 - 180)}
            aria-label={locale === "en" ? "Rotate 3D page" : "Putar halaman 3D"}
            onChange={(e) => setRotY(Number(e.target.value))}
            className="w-28 accent-primary"
          />
          <button
            type="button"
            onClick={() => setRotY((v) => v + 180)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
          >
            <FlipHorizontal2 className="size-3.5" /> {locale === "en" ? "Flip 180°" : "Balik 180°"}
          </button>
          <button
            type="button"
            onClick={() => {
              setRotX(0);
              setRotY(0);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-muted"
          >
            <RotateCcw className="size-3.5" /> Reset
          </button>
        </div>
      </div>

      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className="mx-auto w-full max-w-3xl cursor-grab select-none py-4 active:cursor-grabbing"
        style={{ perspective: "1400px" }}
      >
        <div
          className="relative min-h-[390px] w-full transition-transform duration-150 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {/* Sisi Depan */}
          <div
            className="ui-panel absolute inset-0 flex flex-col justify-between p-6 sm:p-8"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                  {locale === "en" ? "Front Sheet · Steps 1–2" : "Sisi Depan · Langkah 1–2"}
                </span>
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary-dark">
                  BAB {chapter.number}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-ink">{chapter.title[locale]}</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {frontSteps.map((step, i) => (
                  <div key={step.id} className="rounded-xl border border-line bg-surface-muted/50 p-4">
                    <p className="text-xs font-bold text-primary">
                      0{i + 1} · {step.badge?.[locale]}
                    </p>
                    <h4 className="mt-1 text-sm font-bold text-ink">{step.heading[locale]}</h4>
                    <p className="mt-1.5 text-xs leading-5 text-ink-soft">{step.body[locale]}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-right text-[11px] font-medium text-muted">
              {locale === "en"
                ? "Flip 180° to read Steps 3–4 & Field Checklist →"
                : "Putar 180° untuk membaca Langkah 3–4 & Checklist →"}
            </p>
          </div>

          {/* Sisi Belakang (diputar 180 derajat) */}
          <div
            className="ui-panel absolute inset-0 flex flex-col justify-between border-primary/40 bg-surface p-6 sm:p-8"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                  {locale === "en" ? "Back Sheet · Steps 3–4 & Field Tips" : "Sisi Belakang · Langkah 3–4 & Tips"}
                </span>
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary-dark">
                  180°
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {backSteps.map((step, i) => (
                  <div key={step.id} className="rounded-xl border border-line bg-surface-muted/50 p-4">
                    <p className="text-xs font-bold text-primary">
                      0{i + 3} · {step.badge?.[locale]}
                    </p>
                    <h4 className="mt-1 text-sm font-bold text-ink">{step.heading[locale]}</h4>
                    <p className="mt-1.5 text-xs leading-5 text-ink-soft">{step.body[locale]}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-primary-soft/60 p-3 text-xs text-ink-soft">
              <strong className="text-primary-dark">Tip:</strong> {chapter.tips[0]?.[locale]}
            </div>
          </div>
        </div>
      </div>

      <ChapterFooter chapter={chapter} locale={locale} />
    </div>
  );
}

/** Bab 03: Konsol Pipeline AI 3D interaktif. */
function NeuralConsoleStage({ chapter, locale }: { chapter: ManualChapter; locale: AppLocale }) {
  const [active, setActive] = useState(0);
  const current = chapter.steps[active] ?? chapter.steps[0];

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-2xl border border-line bg-gradient-to-br from-[#0e1920] via-[#13252c] to-[#19332c] p-6 text-white shadow-xl"
        style={{ perspective: "1000px" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
          <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-emerald-300">
            <Cpu className="size-4" /> AI PIPELINE MATRIX · CPU + GROQ FALLBACK
          </span>
          <span className="text-xs text-white/70">
            {locale === "en" ? "Click any node to inspect" : "Klik simpul mana saja untuk detail"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {chapter.steps.map((step, idx) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "rounded-xl border p-3.5 text-left transition-all duration-200",
                idx === active
                  ? "scale-[1.03] border-emerald-400 bg-emerald-500/20 shadow-lg ring-2 ring-emerald-400/40"
                  : "border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/10",
              )}
            >
              <span className="font-mono text-[11px] font-bold text-emerald-300">
                NODE 0{idx + 1}
              </span>
              <p className="mt-1 text-sm font-bold text-white">{step.badge?.[locale]}</p>
              <p className="mt-1 line-clamp-2 text-xs text-white/75">{step.heading[locale]}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-white/15 bg-black/25 p-5">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">
            0{active + 1} · {current.badge?.[locale]}
          </p>
          <h4 className="mt-1 text-lg font-bold text-white">{current.heading[locale]}</h4>
          <p className="mt-2 text-sm leading-6 text-white/85">{current.body[locale]}</p>
        </div>
      </div>

      <ChapterFooter chapter={chapter} locale={locale} />
    </div>
  );
}

/** Bab 04: Dunia 3D interaktif Gunung Leuser (Three.js) + detail langkah. */
function LivingWorldStage({
  chapter,
  locale,
  reducedMotion,
}: {
  chapter: ManualChapter;
  locale: AppLocale;
  reducedMotion: boolean;
}) {
  const [active, setActive] = useState(0);
  const current = chapter.steps[active] ?? chapter.steps[0];

  return (
    <div className="flex flex-col gap-5">
      <LivingWorldCanvas
        locale={locale}
        steps={chapter.steps}
        activeStepIndex={active}
        onSelectStep={setActive}
        reducedMotion={reducedMotion}
      />

      <div className="ui-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
            {locale === "en" ? `Waypoint 0${active + 1}` : `Titik 0${active + 1}`} ·{" "}
            {current.badge?.[locale]}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setActive((i) => (i - 1 + chapter.steps.length) % chapter.steps.length)}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-line hover:bg-surface-muted"
              aria-label="Previous waypoint"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setActive((i) => (i + 1) % chapter.steps.length)}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-line hover:bg-surface-muted"
              aria-label="Next waypoint"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
        <h4 className="mt-3 text-lg font-bold text-ink">{current.heading[locale]}</h4>
        <p className="mt-1.5 text-sm leading-6 text-ink-soft">{current.body[locale]}</p>
      </div>

      <ChapterFooter chapter={chapter} locale={locale} />
    </div>
  );
}

/** Bab 05: Dek kartu taktil 3D (POS & Check-In). */
function TactileDeckStage({ chapter, locale }: { chapter: ManualChapter; locale: AppLocale }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 md:grid-cols-4" style={{ perspective: "1000px" }}>
        {chapter.steps.map((step, idx) => {
          const isSelected = idx === active;
          const offset = idx - active;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "ui-panel flex flex-col justify-between p-5 text-left transition-all duration-300",
                isSelected ? "border-primary ring-2 ring-primary/30" : "opacity-80 hover:opacity-100",
              )}
              style={{
                transform: isSelected
                  ? "translateZ(20px) rotateY(0deg)"
                  : `rotateY(${Math.max(-10, Math.min(10, offset * 5))}deg) scale(0.97)`,
              }}
            >
              <div>
                <span className="font-mono text-xs font-bold text-primary">
                  0{idx + 1} · {step.badge?.[locale]}
                </span>
                <h4 className="mt-2 text-sm font-bold text-ink">{step.heading[locale]}</h4>
              </div>
              <p className="mt-3 text-xs leading-5 text-ink-soft">{step.body[locale]}</p>
            </button>
          );
        })}
      </div>

      <ChapterFooter chapter={chapter} locale={locale} />
    </div>
  );
}

/** Bab 06: Atlas Orbital 3D (Ensiklopedia Satwa 3D & Bantuan Cepat). */
function OrbitalAtlasStage({ chapter, locale }: { chapter: ManualChapter; locale: AppLocale }) {
  const [active, setActive] = useState(0);
  const [orbitPaused, setOrbitPaused] = useState(false);
  const current = chapter.steps[active] ?? chapter.steps[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="ui-panel overflow-hidden p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="size-4" />
            {chapter.peakBadge[locale]}
          </div>
          <button
            type="button"
            onClick={() => setOrbitPaused((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-muted"
          >
            {orbitPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            {orbitPaused
              ? locale === "en"
                ? "Resume Orbit"
                : "Lanjut Orbit"
              : locale === "en"
                ? "Pause Orbit"
                : "Jeda Orbit"}
          </button>
        </div>

        <div className="mt-5 grid items-center gap-6 lg:grid-cols-[280px_1fr]">
          <div
            className="relative mx-auto flex size-60 items-center justify-center rounded-full border border-dashed border-primary/40 bg-primary-soft/30"
            style={{ transform: "rotateX(22deg)" }}
          >
            <div className="flex size-24 flex-col items-center justify-center rounded-full bg-primary text-center text-white shadow-lg">
              <span className="font-mono text-xs font-bold">TNGL</span>
              <span className="text-[10px] opacity-85">3D ATLAS</span>
            </div>

            {chapter.steps.map((step, idx) => {
              const angle = ((idx / chapter.steps.length) * 360 + (orbitPaused ? 0 : active * 25)) * (Math.PI / 180);
              const x = Math.cos(angle) * 96;
              const y = Math.sin(angle) * 96;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActive(idx)}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className={cn(
                    "absolute flex size-11 items-center justify-center rounded-full border-2 text-xs font-bold shadow transition-all",
                    idx === active
                      ? "scale-110 border-white bg-primary text-white ring-4 ring-primary/30"
                      : "border-line bg-surface text-ink hover:border-primary",
                  )}
                  title={step.heading[locale]}
                >
                  0{idx + 1}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-line bg-surface-muted/50 p-5">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
              0{active + 1} · {current.badge?.[locale]}
            </span>
            <h4 className="mt-3 text-lg font-bold text-ink">{current.heading[locale]}</h4>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{current.body[locale]}</p>
          </div>
        </div>
      </div>

      <ChapterFooter chapter={chapter} locale={locale} />
    </div>
  );
}

export function PeakExperienceStage({
  chapter,
  locale,
  reducedMotion,
}: {
  chapter: ManualChapter;
  locale: AppLocale;
  reducedMotion: boolean;
}) {
  switch (chapter.peakKind) {
    case "typography3d":
      return <Typography3DStage chapter={chapter} locale={locale} reducedMotion={reducedMotion} />;
    case "rotatablePage":
      return <RotatablePageStage chapter={chapter} locale={locale} />;
    case "neuralConsole":
      return <NeuralConsoleStage chapter={chapter} locale={locale} />;
    case "livingWorld":
      return <LivingWorldStage chapter={chapter} locale={locale} reducedMotion={reducedMotion} />;
    case "tactileDeck":
      return <TactileDeckStage chapter={chapter} locale={locale} />;
    case "orbitalAtlas":
      return <OrbitalAtlasStage chapter={chapter} locale={locale} />;
  }
}
