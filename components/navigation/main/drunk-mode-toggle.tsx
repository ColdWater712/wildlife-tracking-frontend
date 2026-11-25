"use client";

import { usePathname } from "next/navigation";
import { Wine } from "lucide-react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { isTransactionRoute } from "@/lib/drunk-mode";
import { cn } from "@/lib/utils";

export function DrunkModeToggle() {
  const pathname = usePathname();
  const { drunkMode, toggleDrunkMode, t } = usePreferences();

  const isTx = isTransactionRoute(pathname);
  const isActive = drunkMode && !isTx;
  const label = isTx
    ? t("drunkModePausedTx")
    : isActive
      ? t("drunkModeOff")
      : t("drunkModeOn");

  return (
    <button
      type="button"
      data-drunk-immune="true"
      onClick={() => {
        if (!isTx) toggleDrunkMode();
      }}
      disabled={isTx}
      aria-disabled={isTx}
      aria-pressed={isActive}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isTx
          ? "cursor-not-allowed border-line bg-surface-muted text-muted opacity-50"
          : isActive
            ? "border-fuchsia-400 bg-gradient-to-br from-fuchsia-500 via-amber-400 to-cyan-400 text-slate-950 shadow-md ring-2 ring-fuchsia-400/50"
            : "border-line bg-surface text-ink-soft hover:border-primary hover:bg-surface-muted",
      )}
    >
      <Wine
        aria-hidden="true"
        className={cn("size-[1.15rem] transition-transform", isActive && "rotate-12 scale-110")}
      />
    </button>
  );
}
