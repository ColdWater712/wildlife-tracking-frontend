"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { usePreferences } from "@/components/providers/preferences-provider";
import { isTransactionRoute } from "@/lib/drunk-mode";

function resetFleeingElements() {
  document.querySelectorAll<HTMLElement>('[data-drunk-fled="true"]').forEach((el) => {
    el.style.transform = "";
    el.style.transition = "";
    delete el.dataset.drunkFled;
  });
}

export function DrunkEffectsEngine() {
  const pathname = usePathname();
  const { drunkMode, setDrunkMode, locale, t } = usePreferences();

  const isTx = isTransactionRoute(pathname);
  const isActive = drunkMode && !isTx;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.drunkActive = isActive ? "true" : "false";

    const clearVars = () => {
      root.style.removeProperty("--drunk-tilt-x");
      root.style.removeProperty("--drunk-tilt-y");
      root.style.removeProperty("--drunk-roll");
      root.style.removeProperty("--drunk-ghost-x");
      root.style.removeProperty("--drunk-ghost-y");
    };

    if (!isActive) {
      clearVars();
      resetFleeingElements();
      return;
    }

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const tSec = (now - startTime) * 0.001;
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Multi-frequency organic camera sway + damped pointer inertia
      const swayX = Math.sin(tSec * 0.65) * 1.45 + Math.sin(tSec * 1.17) * 0.65;
      const swayY = Math.cos(tSec * 0.52) * 1.85 + Math.sin(tSec * 1.31) * 0.75;
      const roll = Math.sin(tSec * 0.43) * 0.95 + Math.cos(tSec * 0.97) * 0.45;

      const tiltX = swayX - currentMouseY * 3.8;
      const tiltY = swayY + currentMouseX * 4.4;

      // Drifting diplopia (double vision) offset
      const ghostX = Math.sin(tSec * 1.45) * 2.4 + currentMouseX * 1.4;
      const ghostY = Math.cos(tSec * 1.15) * 1.6 - currentMouseY * 1.1;

      root.style.setProperty("--drunk-tilt-x", `${tiltX.toFixed(2)}deg`);
      root.style.setProperty("--drunk-tilt-y", `${tiltY.toFixed(2)}deg`);
      root.style.setProperty("--drunk-roll", `${roll.toFixed(2)}deg`);
      root.style.setProperty("--drunk-ghost-x", `${ghostX.toFixed(2)}px`);
      root.style.setProperty("--drunk-ghost-y", `${ghostY.toFixed(2)}px`);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const handlePointerMove = (e: PointerEvent) => {
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      targetMouseX = (e.clientX / vw - 0.5) * 2;
      targetMouseY = (e.clientY / vh - 0.5) * 2;

      const main = document.getElementById("main-content");
      if (!main) return;

      const nodes = main.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, td, th, li, label");
      nodes.forEach((el) => {
        if (el.closest('button, a, input, select, textarea, canvas, [data-drunk-immune="true"]')) {
          return;
        }
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - e.clientX;
        const dy = cy - e.clientY;
        const dist = Math.hypot(dx, dy);

        if (dist < 160) {
          const strength = (160 - dist) / 160;
          const ux = dist > 1 ? dx / dist : 1;
          const uy = dist > 1 ? dy / dist : -1;
          const tx = Math.round(ux * strength * 68);
          const ty = Math.round(uy * strength * 52);
          const skew = Math.round(ux * strength * 7);
          const rot = Math.round((ux - uy) * strength * 10);

          el.dataset.drunkFled = "true";
          el.style.transition = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";
          el.style.transform = `translate3d(${tx}px, ${ty}px, 22px) rotate(${rot}deg) skewX(${skew}deg)`;
        } else if (el.dataset.drunkFled === "true" && dist > 185) {
          el.style.transform = "";
          delete el.dataset.drunkFled;
        }
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      clearVars();
      resetFleeingElements();
      root.dataset.drunkActive = "false";
    };
  }, [isActive, pathname]);

  if (!isActive) return null;

  return (
    <>
      {/* Optical tunnel vignette + subtle 35mm film grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 48%, rgba(28, 18, 8, 0.24) 80%, rgba(10, 8, 6, 0.56) 100%)",
          }}
        />
        <svg className="absolute inset-0 h-full w-full opacity-[0.045] mix-blend-overlay">
          <filter id="drunk-film-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.78"
              numOctaves="2"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#drunk-film-grain)" />
        </svg>
      </div>

      {/* Minimalist Swiss-editorial Optics HUD */}
      <div
        data-drunk-immune="true"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-line bg-surface/95 px-3.5 py-2 shadow-lg backdrop-blur-md"
      >
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          <span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />
          <span>{locale === "en" ? "Optics · Drift" : "Mode Mabuk"}</span>
        </span>
        <button
          type="button"
          onClick={() => setDrunkMode(false)}
          className="rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-background transition hover:opacity-85"
        >
          {t("drunkSoberUp")}
        </button>
      </div>
    </>
  );
}
