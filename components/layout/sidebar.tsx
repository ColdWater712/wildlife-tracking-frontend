"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";
import { NavIconGlyph } from "@/components/layout/nav-icon";
import { NAV_SECTIONS, isRouteActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";
import { TYPE_ROLE_LABELS } from "@/types/auth.type";

type SidebarProps = {
  user: SessionUser;
  onLogout: () => void;
  variant?: "desktop" | "mobile";
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
  isHidden?: boolean;
};

export function Sidebar({
  user,
  onLogout,
  variant = "desktop",
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  onClose,
  isHidden = false,
}: SidebarProps) {
  const pathname = usePathname();
  const sections = NAV_SECTIONS[user.role];
  const isMobile = variant === "mobile";
  const showLabels = !isMobile && !collapsed;
  const tabIndex = isHidden ? -1 : undefined;
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isMobile && !isHidden) {
      closeButtonRef.current?.focus();
    }
  }, [isMobile, isHidden]);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || user.name.slice(0, 1).toUpperCase();

  return (
    <aside
      aria-label="Navigasi utama"
      className={cn(
        "flex h-full min-h-0 flex-col bg-surface",
        isMobile
          ? "w-full"
          : cn(
              "sticky top-0 z-30 h-dvh shrink-0 transition-[width] duration-300 ease-out",
              collapsed ? "w-[4.75rem]" : "w-72",
            ),
      )}
    >
      {/* Header / Brand */}
      <div
        className={cn(
          "relative flex h-20 shrink-0 items-center overflow-hidden border-b border-line",
          showLabels ? "gap-3 px-5" : "justify-center px-2",
        )}
      >
        {/* Subtle decorative gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-soft/40 via-transparent to-transparent"
        />

        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-xl ring-1 ring-line",
            showLabels ? "size-11" : "size-10",
          )}
        >
          <Image
            src="/images/logo-tngl.png"
            alt="Logo Taman Nasional Gunung Leuser"
            fill
            sizes={showLabels ? "44px" : "40px"}
            className="object-contain"
            priority
          />
        </div>

        {showLabels ? (
          <div className="relative min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold uppercase leading-tight tracking-[0.14em] text-primary">
              Taman Nasional
            </p>
            <p className="text-sm font-bold uppercase leading-tight tracking-wide text-ink">
              Gunung Leuser
            </p>
          </div>
        ) : null}

        {isMobile && onClose ? (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            tabIndex={tabIndex}
            aria-label="Tutup navigasi"
            className="relative ml-auto inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        ) : null}
      </div>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && onToggleCollapse ? (
        <div className="relative flex shrink-0 items-center px-3 py-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Perluas navigasi" : "Ciutkan navigasi"}
            title={collapsed ? "Perluas navigasi" : "Ciutkan navigasi"}
            className={cn(
              "group inline-flex items-center rounded-full border border-line bg-surface text-ink-soft shadow-sm transition",
              "hover:border-primary/50 hover:bg-primary-soft hover:text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
              collapsed
                ? "mx-auto size-9 justify-center p-0"
                : "ml-auto gap-1.5 px-3 py-1.5 text-xs font-semibold",
            )}
          >
            {collapsed ? (
              <ChevronRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            ) : (
              <>
                <ChevronLeft
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:-translate-x-0.5"
                />
                <span>Ciutkan</span>
              </>
            )}
          </button>
        </div>
      ) : null}

      {/* Navigation */}
      <nav
        aria-label="Daftar halaman"
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain py-4",
          showLabels ? "px-3" : "px-2",
        )}
      >
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            {showLabels ? (
              <div className="flex items-center gap-2 px-3 pb-2">
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted">
                  {section.title}
                </p>
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
              </div>
            ) : (
              <div aria-hidden="true" className="mx-auto mb-3 h-px w-8 rounded-full bg-line" />
            )}

            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = isRouteActive(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      tabIndex={tabIndex}
                      aria-current={active ? "page" : undefined}
                      aria-label={showLabels ? undefined : item.label}
                      title={showLabels ? undefined : item.label}
                      className={cn(
                        "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                        showLabels ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-3",
                        active
                          ? "bg-primary text-white shadow-[0_4px_12px_-4px] shadow-primary/40"
                          : "text-ink-soft hover:bg-primary-soft/60 hover:text-primary-dark",
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white/90",
                            !showLabels && "h-5 w-0.5",
                          )}
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute left-0 top-1/2 h-0 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200 group-hover:h-5",
                            !showLabels && "group-hover:h-4",
                          )}
                        />
                      )}
                      <NavIconGlyph
                        icon={item.icon}
                        className={cn(
                          "size-5 shrink-0 transition-transform duration-200",
                          "group-hover:scale-110",
                          active && "drop-shadow-sm",
                        )}
                      />
                      {showLabels ? (
                        <span className="min-w-0 truncate">{item.label}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Profile & Logout */}
      <div
        className={cn(
          "shrink-0 border-t border-line bg-gradient-to-b from-transparent to-surface-muted/40",
          showLabels ? "px-4 py-4" : "px-2 py-4",
        )}
      >
        <div
          className={cn(
            "flex items-center rounded-xl border border-line bg-surface p-2 transition-colors hover:border-line-strong",
            showLabels ? "gap-3" : "justify-center",
          )}
        >
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white shadow-sm"
          >
            {initials}
          </span>
          {showLabels ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">
                {TYPE_ROLE_LABELS[user.role]}
              </p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onLogout}
          tabIndex={tabIndex}
          aria-label={showLabels ? undefined : "Keluar"}
          title={showLabels ? undefined : "Keluar"}
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-line-strong font-semibold text-ink-soft transition-all duration-200",
            "hover:-translate-y-px hover:border-danger/50 hover:bg-danger-soft hover:text-danger hover:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            "active:translate-y-0",
            showLabels ? "px-3 py-2 text-sm" : "px-2 py-2.5",
          )}
        >
          <LogOut
            aria-hidden="true"
            className={cn("shrink-0 transition-transform", showLabels ? "size-4" : "size-5")}
          />
          {showLabels ? "Keluar" : null}
        </button>
      </div>
    </aside>
  );
}