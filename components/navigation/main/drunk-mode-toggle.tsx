"use client";

import { usePathname } from "next/navigation";
import { Wine } from "lucide-react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { DRUNK_SOBER_EVENT, isTransactionRoute } from "@/lib/drunk-mode";
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
        if (isTx) return;
        if (isActive) {
          window.dispatchEvent(new Event(DRUNK_SOBER_EVENT));
          return;
        }
        toggleDrunkMode();
      }}
      disabled={isTx}
      aria-disabled={isTx}
      aria-pressed={isActive}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isTx
          ? "cursor-not-allowed border-line bg-surface-muted text-muted opacity-50"
          : isActive
            ? "border-amber-600/60 bg-amber-500/15 text-amber-800 shadow-sm dark:border-amber-400/50 dark:bg-amber-400/15 dark:text-amber-300"
            : "border-line bg-surface text-ink-soft hover:border-primary hover:bg-surface-muted",
      )}
    >
      <Wine
        aria-hidden="true"
        className={cn("size-[1.15rem] transition-transform", isActive && "-rotate-12")}
      />
      {isActive ? (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-amber-600 dark:bg-amber-400"
        />
      ) : null}
    </button>
  );
}
