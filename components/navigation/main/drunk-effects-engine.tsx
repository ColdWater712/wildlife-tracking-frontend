"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { usePreferences } from "@/components/providers/preferences-provider";
import { DRUNK_SOBER_EVENT, isTransactionRoute } from "@/lib/drunk-mode";

const SOBER_DURATION_MS = 2300;

type WaterDroplet = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  alpha: number;
  streak: number;
};

function releaseFleeingElements(smooth: boolean) {
  document.querySelectorAll<HTMLElement>('[data-drunk-fled="true"]').forEach((el) => {
    if (smooth) {
      el.style.transition = "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "";
    } else {
      el.style.transform = "";
      el.style.transition = "";
    }
    delete el.dataset.drunkFled;
  });
}

export function DrunkEffectsEngine() {
  const pathname = usePathname();
  const { drunkMode, setDrunkMode, locale, t } = usePreferences();

  const [sobering, setSobering] = useState(false);
  const soberingRef = useRef(false);
  const soberStartRef = useRef(0);
  const splashCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const isTx = isTransactionRoute(pathname);
  const isActive = drunkMode && !isTx;

  const startSoberSequence = useCallback(() => {
    if (!isActive || soberingRef.current) return;
    soberingRef.current = true;
    soberStartRef.current = performance.now();
    setSobering(true);
    document.documentElement.dataset.drunkSobering = "true";
    releaseFleeingElements(true);
  }, [isActive]);

  useEffect(() => {
    const handleSoberEvent = () => {
      startSoberSequence();
    };
    window.addEventListener(DRUNK_SOBER_EVENT, handleSoberEvent);
    return () => {
      window.removeEventListener(DRUNK_SOBER_EVENT, handleSoberEvent);
    };
  }, [startSoberSequence]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.drunkActive = isActive ? "true" : "false";

    const clearVars = () => {
      root.style.removeProperty("--drunk-tilt-x");
      root.style.removeProperty("--drunk-tilt-y");
      root.style.removeProperty("--drunk-roll");
      root.style.removeProperty("--drunk-ghost-x");
      root.style.removeProperty("--drunk-ghost-y");
      root.style.removeProperty("--drunk-vignette-opacity");
    };

    if (!isActive) {
      soberingRef.current = false;
      delete root.dataset.drunkSobering;
      clearVars();
      releaseFleeingElements(false);
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

      let intensity = 1;
      let splashJoltX = 0;
      let splashProgress = 0;

      if (soberingRef.current) {
        splashProgress = Math.min(1, (now - soberStartRef.current) / SOBER_DURATION_MS);
        const eased = 1 - Math.pow(1 - splashProgress, 3);
        intensity = Math.max(0, 1 - eased);

        // Brief physical jolt when cold water hits the lens (0..350ms)
        if (splashProgress < 0.15) {
          splashJoltX = Math.sin((splashProgress / 0.15) * Math.PI) * 3.5;
        }
      }

      const swayX = Math.sin(tSec * 0.65) * 1.45 + Math.sin(tSec * 1.17) * 0.65;
      const swayY = Math.cos(tSec * 0.52) * 1.85 + Math.sin(tSec * 1.31) * 0.75;
      const roll = Math.sin(tSec * 0.43) * 0.95 + Math.cos(tSec * 0.97) * 0.45;

      const tiltX = (swayX - currentMouseY * 3.8) * intensity + splashJoltX;
      const tiltY = (swayY + currentMouseX * 4.4) * intensity;
      const rollDeg = roll * intensity;

      const ghostX = (Math.sin(tSec * 1.45) * 2.4 + currentMouseX * 1.4) * intensity;
      const ghostY = (Math.cos(tSec * 1.15) * 1.6 - currentMouseY * 1.1) * intensity;

      root.style.setProperty("--drunk-tilt-x", `${tiltX.toFixed(2)}deg`);
      root.style.setProperty("--drunk-tilt-y", `${tiltY.toFixed(2)}deg`);
      root.style.setProperty("--drunk-roll", `${rollDeg.toFixed(2)}deg`);
      root.style.setProperty("--drunk-ghost-x", `${ghostX.toFixed(2)}px`);
      root.style.setProperty("--drunk-ghost-y", `${ghostY.toFixed(2)}px`);
      root.style.setProperty("--drunk-vignette-opacity", intensity.toFixed(2));

      if (soberingRef.current && splashProgress >= 1) {
        soberingRef.current = false;
        setSobering(false);
        delete root.dataset.drunkSobering;
        clearVars();
        setDrunkMode(false);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const handlePointerMove = (e: PointerEvent) => {
      if (soberingRef.current) return;

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
      soberingRef.current = false;
      delete root.dataset.drunkSobering;
      clearVars();
      releaseFleeingElements(false);
      root.dataset.drunkActive = "false";
    };
  }, [isActive, pathname, setDrunkMode]);

  // Full-viewport cold-water splash & lens droplets canvas
  useEffect(() => {
    if (!sobering) return;
    const canvas = splashCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const droplets: WaterDroplet[] = Array.from({ length: 75 }, (_, i) => ({
      x: ((i * 137.5) % 100) * 0.01 * width + (Math.random() - 0.5) * 40,
      y: Math.random() * height * 0.72,
      r: 3.5 + Math.random() * 11,
      vy: 1.2 + Math.random() * 3.4,
      vx: (Math.random() - 0.5) * 0.6,
      alpha: 0.45 + Math.random() * 0.4,
      streak: 8 + Math.random() * 20,
    }));

    const start = performance.now();
    let animId = 0;

    const renderSplash = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / SOBER_DURATION_MS);
      ctx.clearRect(0, 0, width, height);

      // 1. Glossy cold-water curtain pouring top-to-bottom (0..700ms)
      if (p < 0.42) {
        const curtainP = Math.min(1, p / 0.28);
        const curtainFade = p < 0.25 ? 1 : Math.max(0, 1 - (p - 0.25) / 0.17);
        const waveBaseY = curtainP * (height + 140);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, waveBaseY);

        const step = 32;
        for (let x = width; x >= 0; x -= step) {
          const wave =
            Math.sin(x * 0.012 + elapsed * 0.014) * 28 +
            Math.cos(x * 0.027 - elapsed * 0.01) * 14;
          ctx.lineTo(x, waveBaseY + wave);
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, Math.max(0, waveBaseY - height * 0.7), 0, waveBaseY + 30);
        grad.addColorStop(0, `rgba(186, 230, 253, ${0.06 * curtainFade})`);
        grad.addColorStop(0.7, `rgba(210, 240, 255, ${0.28 * curtainFade})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${0.46 * curtainFade})`);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // 2. Refractive lens droplets sliding down & fading out smoothly
      const dropletFade = p < 0.55 ? Math.min(1, p / 0.14) : Math.max(0, 1 - (p - 0.55) / 0.45);
      if (dropletFade > 0.01) {
        for (const d of droplets) {
          d.y += d.vy;
          d.x += d.vx;
          d.vy *= 0.992;

          const a = d.alpha * dropletFade;
          // Soft vertical water trail
          ctx.beginPath();
          ctx.moveTo(d.x, d.y - d.streak);
          ctx.lineTo(d.x, d.y);
          ctx.strokeStyle = `rgba(224, 244, 255, ${a * 0.32})`;
          ctx.lineWidth = Math.max(1.2, d.r * 0.42);
          ctx.lineCap = "round";
          ctx.stroke();

          // Droplet body with refractive edge
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(205, 236, 252, ${a * 0.24})`;
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = `rgba(15, 35, 48, ${a * 0.22})`;
          ctx.stroke();

          // Specular highlight crescent
          ctx.beginPath();
          ctx.arc(d.x - d.r * 0.28, d.y - d.r * 0.28, d.r * 0.34, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.72})`;
          ctx.fill();
        }
      }

      if (p < 1) {
        animId = requestAnimationFrame(renderSplash);
      }
    };

    animId = requestAnimationFrame(renderSplash);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [sobering]);

  if (!isActive) return null;

  return (
    <>
      {/* Optical tunnel vignette + subtle 35mm film grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 overflow-hidden transition-opacity duration-500"
        style={{ opacity: "var(--drunk-vignette-opacity, 1)" }}
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

      {/* Cold-water splash & lens droplets overlay */}
      {sobering ? (
        <canvas
          ref={splashCanvasRef}
          data-drunk-splash-canvas="true"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
        />
      ) : null}

      {/* Minimalist Swiss-editorial Optics HUD */}
      <div
        data-drunk-immune="true"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-line bg-surface/95 px-3.5 py-2 shadow-lg backdrop-blur-md"
      >
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          <span
            className={sobering ? "size-2 rounded-full bg-sky-500" : "size-2 rounded-full bg-amber-500"}
            aria-hidden="true"
          />
          <span>
            {sobering
              ? locale === "en"
                ? "Splashing..."
                : "Menyiram..."
              : locale === "en"
                ? "Optics · Drift"
                : "Mode Mabuk"}
          </span>
        </span>
        <button
          type="button"
          disabled={sobering}
          onClick={startSoberSequence}
          className="rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-background transition hover:opacity-85 disabled:cursor-wait disabled:opacity-60"
        >
          {sobering ? (locale === "en" ? "Sobering..." : "Menyegarkan...") : t("drunkSoberUp")}
        </button>
      </div>
    </>
  );
}
