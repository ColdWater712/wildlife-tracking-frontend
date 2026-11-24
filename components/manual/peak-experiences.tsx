"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";

import type { AppLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ManualChapter, ManualStep } from "./manual-data";

const LivingWorldCanvas = dynamic(
  () => import("./living-world-canvas").then((mod) => mod.LivingWorldCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full animate-pulse rounded-2xl border border-line bg-surface-muted" />
    ),
  },
);

const SolarSystemCanvas = dynamic(
  () => import("./solar-system-canvas").then((mod) => mod.SolarSystemCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full animate-pulse rounded-2xl border border-line bg-surface-muted" />
    ),
  },
);

function StepDetailsList({ step, locale, darkText = false }: { step: ManualStep; locale: AppLocale; darkText?: boolean }) {
  return (
    <ul className={cn("mt-2.5 flex flex-col gap-1.5 text-xs leading-5", darkText ? "text-white/85" : "text-ink-soft")}>
      {step.details.map((detail, i) => (
        <li key={i} className="flex items-start gap-2">
          <span
            className={cn(
              "mt-1.5 size-1.5 shrink-0 rounded-full",
              darkText ? "bg-emerald-300" : "bg-primary",
            )}
          />
          <span>{detail[locale]}</span>
        </li>
      ))}
    </ul>
  );
}

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

/** Bab 01: SELURUH HALAMAN berada dalam panggung 3D berlapis yang bereaksi terhadap pointer. */
function Typography3DStage({
  chapter,
  locale,
  reducedMotion,
}: {
  chapter: ManualChapter;
  locale: AppLocale;
  reducedMotion: boolean;
}) {
  const [tilt, setTilt] = useState({ rx: -2, ry: 3 });
  const stageRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -ny * 10, ry: nx * 14 });
  };

  return (
    <div
      ref={stageRef}
      onPointerMove={handleMove}
      onPointerLeave={() => setTilt({ rx: -2, ry: 3 })}
      className="relative rounded-3xl border border-line bg-gradient-to-br from-surface-muted/70 via-background to-primary-soft/40 p-4 sm:p-7"
      style={{ perspective: "1500px" }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted">
          {locale === "en"
            ? "Move your cursor across the page to tilt the entire 3D chapter stage"
            : "Gerakkan kursor di seluruh halaman untuk memiringkan panggung bab 3D"}
        </span>
        <button
          type="button"
          onClick={() => setTilt({ rx: 0, ry: 0 })}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink hover:bg-surface-muted"
        >
          <RotateCcw className="size-3" /> Reset 3D
        </button>
      </div>

      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Layer Hero (+38px Z) */}
        <div
          className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#0f1f17] via-[#1b3629] to-[#294d3b] p-7 text-white shadow-2xl sm:p-9"
          style={{ transform: "translateZ(38px)", transformStyle: "preserve-3d" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#b4d6bc]">
            BAB {chapter.number} · {chapter.peakBadge[locale]}
          </p>
          <h3
            className="mt-2.5 text-2xl font-black tracking-tight sm:text-4xl"
            style={{
              transform: "translateZ(26px)",
              textShadow:
                "0 1px 0 #1f4432, 0 2px 0 #1a3a2b, 0 3px 0 #153023, 0 4px 0 #11261c, 0 10px 24px rgba(0,0,0,0.45)",
            }}
          >
            {chapter.title[locale]}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85">
            {chapter.summary[locale]}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
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

        {/* Layer Kartu Langkah (+22px Z) */}
        <div
          className="mt-6 grid gap-4 md:grid-cols-2"
          style={{ transform: "translateZ(22px)", transformStyle: "preserve-3d" }}
        >
          {chapter.steps.map((step, index) => (
            <article
              key={step.id}
              className="ui-panel flex flex-col justify-between p-5 shadow-lg transition-transform duration-200 hover:border-primary"
              style={{ transform: `translateZ(${index % 2 === 0 ? 10 : 4}px)` }}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-primary">0{index + 1}</span>
                  {step.badge ? (
                    <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary-dark">
                      {step.badge[locale]}
                    </span>
                  ) : null}
                </div>
                <h4 className="mt-1.5 text-base font-bold text-ink">{step.heading[locale]}</h4>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{step.body[locale]}</p>
                <StepDetailsList step={step} locale={locale} />
              </div>
            </article>
          ))}
        </div>

        {/* Layer Footer (+12px Z) */}
        <div style={{ transform: "translateZ(12px)" }}>
          <ChapterFooter chapter={chapter} locale={locale} />
        </div>
      </div>
    </div>
  );
}

/** Bab 02: Halaman bab 3D dua sisi yang dapat diputar bebas 360°. */
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
            value={Math.round((((rotY % 360) + 540) % 360) - 180)}
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
        className="mx-auto w-full max-w-4xl cursor-grab select-none py-4 active:cursor-grabbing"
        style={{ perspective: "1400px" }}
      >
        <div
          className="relative min-h-[450px] w-full transition-transform duration-150 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
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
                    <p className="mt-1 text-xs leading-5 text-ink-soft">{step.body[locale]}</p>
                    <StepDetailsList step={step} locale={locale} />
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
                    <p className="mt-1 text-xs leading-5 text-ink-soft">{step.body[locale]}</p>
                    <StepDetailsList step={step} locale={locale} />
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

/** Bab 03: Karusel Silinder 3D AI yang terus berputar (bisa di-drag, klik kartu, atau jeda). */
function NeuralConsoleStage({
  chapter,
  locale,
  reducedMotion,
}: {
  chapter: ManualChapter;
  locale: AppLocale;
  reducedMotion: boolean;
}) {
  const [active, setActive] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const [angleOffset, setAngleOffset] = useState(0);
  const dragRef = useRef<{ active: boolean; x: number }>({ active: false, x: 0 });
  const count = chapter.steps.length;
  const stepAngle = 360 / count;

  useEffect(() => {
    if (!spinning || reducedMotion) return;
    const id = window.setInterval(() => {
      setAngleOffset((prev) => prev - 0.35);
    }, 30);
    return () => window.clearInterval(id);
  }, [spinning, reducedMotion]);

  const snapTo = (idx: number) => {
    setSpinning(false);
    setActive(idx);
    setAngleOffset(-idx * stepAngle);
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { active: true, x: e.clientX };
    setSpinning(false);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    dragRef.current.x = e.clientX;
    setAngleOffset((prev) => prev + dx * 0.45);
  };
  const onUp = () => {
    dragRef.current.active = false;
  };

  const current = chapter.steps[active] ?? chapter.steps[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#0b161c] via-[#10242b] to-[#17332b] p-5 text-white shadow-xl sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-3">
          <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-emerald-300">
            <Cpu className="size-4" /> AI 3D CYLINDRICAL CAROUSEL · YAMNET + SPECIESNET + SFACE
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSpinning((v) => !v)}
              className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20"
            >
              {spinning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              {spinning
                ? locale === "en"
                  ? "Pause Spin"
                  : "Jeda Putar"
                : locale === "en"
                  ? "Auto Spin"
                  : "Putar Otomatis"}
            </button>
            <button
              type="button"
              onClick={() => snapTo((active - 1 + count) % count)}
              className="inline-flex size-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/20"
              aria-label="Previous AI stage"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => snapTo((active + 1) % count)}
              className="inline-flex size-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/20"
              aria-label="Next AI stage"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Panggung Silinder 3D */}
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="relative mx-auto my-6 flex h-64 w-full max-w-2xl cursor-grab items-center justify-center select-none active:cursor-grabbing"
          style={{ perspective: "1100px" }}
        >
          <div
            className="relative h-48 w-64 transition-transform duration-150 ease-out sm:w-72"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${angleOffset}deg)`,
            }}
          >
            {chapter.steps.map((step, idx) => {
              const cardAngle = idx * stepAngle;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => snapTo(idx)}
                  style={{
                    transform: `rotateY(${cardAngle}deg) translateZ(215px)`,
                  }}
                  className={cn(
                    "absolute inset-0 flex flex-col justify-between rounded-2xl border p-4 text-left backdrop-blur-md transition-colors",
                    idx === active
                      ? "border-emerald-300 bg-emerald-900/85 ring-2 ring-emerald-400/50"
                      : "border-white/25 bg-[#0e2026]/85 hover:border-emerald-300/70",
                  )}
                >
                  <div>
                    <span className="font-mono text-[11px] font-bold text-emerald-300">
                      STAGE 0{idx + 1} · {step.badge?.[locale]}
                    </span>
                    <h4 className="mt-1.5 text-sm font-bold text-white">{step.heading[locale]}</h4>
                  </div>
                  <p className="line-clamp-3 text-xs text-white/80">{step.body[locale]}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel detail lengkap untuk stage terpilih */}
        <div className="rounded-2xl border border-white/15 bg-black/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">
              0{active + 1} · {current.badge?.[locale]}
            </span>
            <div className="flex gap-1.5">
              {chapter.steps.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => snapTo(idx)}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition",
                    idx === active ? "bg-emerald-400 text-forest-black" : "bg-white/10 text-white/80 hover:bg-white/20",
                  )}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          </div>
          <h4 className="mt-2 text-lg font-bold text-white">{current.heading[locale]}</h4>
          <p className="mt-1 text-sm text-white/85">{current.body[locale]}</p>
          <StepDetailsList step={current} locale={locale} darkText />
        </div>
      </div>

      <ChapterFooter chapter={chapter} locale={locale} />
    </div>
  );
}

/** Bab 04: Gunung Leuser 3D berputar dengan 4 POI yang bisa di-zoom in ke sisi gunung. */
function LivingWorldStage({
  chapter,
  locale,
  reducedMotion,
}: {
  chapter: ManualChapter;
  locale: AppLocale;
  reducedMotion: boolean;
}) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const current = focusedIndex !== null ? chapter.steps[focusedIndex] : null;

  return (
    <div className="flex flex-col gap-5">
      <LivingWorldCanvas
        locale={locale}
        steps={chapter.steps}
        focusedIndex={focusedIndex}
        onSelectStep={setFocusedIndex}
        reducedMotion={reducedMotion}
      />

      {current ? (
        <div className="ui-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
              POI 0{(focusedIndex ?? 0) + 1} · {current.badge?.[locale]}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFocusedIndex(null)}
                className="rounded-lg border border-line px-3 py-1 text-xs font-semibold text-ink hover:bg-surface-muted"
              >
                {locale === "en" ? "Overview (Spin)" : "Overview (Putar)"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFocusedIndex((i) => (((i ?? 0) - 1 + chapter.steps.length) % chapter.steps.length))
                }
                className="inline-flex size-8 items-center justify-center rounded-lg border border-line hover:bg-surface-muted"
                aria-label="Previous POI"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setFocusedIndex((i) => (((i ?? 0) + 1) % chapter.steps.length))}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-line hover:bg-surface-muted"
                aria-label="Next POI"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <h4 className="mt-3 text-lg font-bold text-ink">{current.heading[locale]}</h4>
          <p className="mt-1.5 text-sm leading-6 text-ink-soft">{current.body[locale]}</p>
          <StepDetailsList step={current} locale={locale} />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {chapter.steps.map((step, idx) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setFocusedIndex(idx)}
              className="ui-panel p-4 text-left transition hover:-translate-y-0.5 hover:border-primary"
            >
              <span className="font-mono text-xs font-bold text-primary">
                POI 0{idx + 1} · {step.badge?.[locale]}
              </span>
              <h4 className="mt-1.5 text-sm font-bold text-ink">{step.heading[locale]}</h4>
              <p className="mt-1 text-xs text-muted">
                {locale === "en" ? "Click to zoom to mountain side →" : "Klik untuk zoom ke sisi gunung →"}
              </p>
            </button>
          ))}
        </div>
      )}

      <ChapterFooter chapter={chapter} locale={locale} />
    </div>
  );
}

/** Bab 05: Dek kartu taktil 3D (POS & Check-In). */
function TactileDeckStage({ chapter, locale }: { chapter: ManualChapter; locale: AppLocale }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" style={{ perspective: "1000px" }}>
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
                isSelected ? "border-primary ring-2 ring-primary/30" : "opacity-85 hover:opacity-100",
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
                <p className="mt-2 text-xs leading-5 text-ink-soft">{step.body[locale]}</p>
                <StepDetailsList step={step} locale={locale} />
              </div>
            </button>
          );
        })}
      </div>

      <ChapterFooter chapter={chapter} locale={locale} />
    </div>
  );
}

/** Bab 06: Tata Surya 3D Satwa & Bantuan Cepat (planet berputar; klik planet untuk zoom in). */
function OrbitalAtlasStage({
  chapter,
  locale,
  reducedMotion,
}: {
  chapter: ManualChapter;
  locale: AppLocale;
  reducedMotion: boolean;
}) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const current = focusedIndex !== null ? chapter.steps[focusedIndex] : null;

  return (
    <div className="flex flex-col gap-5">
      <SolarSystemCanvas
        locale={locale}
        steps={chapter.steps}
        focusedIndex={focusedIndex}
        onSelectStep={setFocusedIndex}
        reducedMotion={reducedMotion}
      />

      {current ? (
        <div className="ui-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
              Planet 0{(focusedIndex ?? 0) + 1} · {current.badge?.[locale]}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFocusedIndex(null)}
                className="rounded-lg border border-line px-3 py-1 text-xs font-semibold text-ink hover:bg-surface-muted"
              >
                {locale === "en" ? "Back to Solar System" : "Kembali ke Tata Surya"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFocusedIndex((i) => (((i ?? 0) - 1 + chapter.steps.length) % chapter.steps.length))
                }
                className="inline-flex size-8 items-center justify-center rounded-lg border border-line hover:bg-surface-muted"
                aria-label="Previous planet"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setFocusedIndex((i) => (((i ?? 0) + 1) % chapter.steps.length))}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-line hover:bg-surface-muted"
                aria-label="Next planet"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <h4 className="mt-3 text-lg font-bold text-ink">{current.heading[locale]}</h4>
          <p className="mt-1.5 text-sm leading-6 text-ink-soft">{current.body[locale]}</p>
          <StepDetailsList step={current} locale={locale} />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {chapter.steps.map((step, idx) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setFocusedIndex(idx)}
              className="ui-panel p-4 text-left transition hover:-translate-y-0.5 hover:border-primary"
            >
              <span className="font-mono text-xs font-bold text-primary">
                Planet 0{idx + 1} · {step.badge?.[locale]}
              </span>
              <h4 className="mt-1.5 text-sm font-bold text-ink">{step.heading[locale]}</h4>
              <p className="mt-1 text-xs text-muted">
                {locale === "en" ? "Click to zoom into planet →" : "Klik untuk zoom ke planet →"}
              </p>
            </button>
          ))}
        </div>
      )}

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
      return <NeuralConsoleStage chapter={chapter} locale={locale} reducedMotion={reducedMotion} />;
    case "livingWorld":
      return <LivingWorldStage chapter={chapter} locale={locale} reducedMotion={reducedMotion} />;
    case "tactileDeck":
      return <TactileDeckStage chapter={chapter} locale={locale} />;
    case "orbitalAtlas":
      return <OrbitalAtlasStage chapter={chapter} locale={locale} reducedMotion={reducedMotion} />;
  }
}
