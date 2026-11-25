"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Wine } from "lucide-react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { isTransactionRoute } from "@/lib/drunk-mode";

const BUBBLES = [
  { left: "8%", size: 46, duration: "11s", delay: "0s", color: "rgba(232, 121, 249, 0.22)" },
  { left: "22%", size: 68, duration: "14s", delay: "1.5s", color: "rgba(34, 211, 238, 0.20)" },
  { left: "41%", size: 38, duration: "9.5s", delay: "0.7s", color: "rgba(250, 204, 21, 0.22)" },
  { left: "63%", size: 78, duration: "15s", delay: "2.2s", color: "rgba(52, 211, 153, 0.20)" },
  { left: "79%", size: 52, duration: "12s", delay: "0.4s", color: "rgba(244, 114, 182, 0.22)" },
  { left: "91%", size: 42, duration: "10.5s", delay: "3s", color: "rgba(56, 189, 248, 0.22)" },
];

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

    if (!isActive) {
      root.style.removeProperty("--drunk-tilt-x");
      root.style.removeProperty("--drunk-tilt-y");
      resetFleeingElements();
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      const nx = (e.clientX / vw - 0.5) * 2;
      const ny = (e.clientY / vh - 0.5) * 2;
      root.style.setProperty("--drunk-tilt-y", `${(nx * 5.5).toFixed(2)}deg`);
      root.style.setProperty("--drunk-tilt-x", `${(-ny * 4.5).toFixed(2)}deg`);

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

        if (dist < 165) {
          const strength = (165 - dist) / 165;
          const ux = dist > 1 ? dx / dist : 1;
          const uy = dist > 1 ? dy / dist : -1;
          const tx = Math.round(ux * strength * 72);
          const ty = Math.round(uy * strength * 58);
          const rot = Math.round((ux - uy) * strength * 12);

          el.dataset.drunkFled = "true";
          el.style.transition = "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)";
          el.style.transform = `translate3d(${tx}px, ${ty}px, 24px) rotate(${rot}deg)`;
        } else if (el.dataset.drunkFled === "true" && dist > 190) {
          el.style.transform = "";
          delete el.dataset.drunkFled;
        }
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      root.style.removeProperty("--drunk-tilt-x");
      root.style.removeProperty("--drunk-tilt-y");
      resetFleeingElements();
      root.dataset.drunkActive = "false";
    };
  }, [isActive, pathname]);

  if (!isActive) return null;

  return (
    <>
      {/* Ambient psychedelic wash & floating dizzy bubbles */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-25 mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 20% 25%, rgba(232,121,249,0.45), transparent 45%), radial-gradient(circle at 80% 70%, rgba(34,211,238,0.45), transparent 45%)",
          }}
        />
        {BUBBLES.map((b, idx) => (
          <span
            key={idx}
            className="absolute -bottom-24 rounded-full blur-[1px]"
            style={{
              left: b.left,
              width: `${b.size}px`,
              height: `${b.size}px`,
              background: b.color,
              animation: `drunk-float-bubble ${b.duration} ease-in-out ${b.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Fixed steady Sober Up HUD */}
      <div
        data-drunk-immune="true"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-full border border-fuchsia-400/60 bg-slate-950/90 px-3.5 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md"
      >
        <Wine className="size-4 animate-bounce text-fuchsia-400" aria-hidden="true" />
        <span>{locale === "en" ? "Drunk Mode" : "Mode Mabuk"}</span>
        <button
          type="button"
          onClick={() => setDrunkMode(false)}
          className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-3 py-1 text-[11px] font-bold text-slate-950 transition hover:brightness-110"
        >
          {t("drunkSoberUp")}
        </button>
      </div>
    </>
  );
}
