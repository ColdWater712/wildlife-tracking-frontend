"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { useUnreadNotifications } from "@/hooks/use-notifications";
import {
  Breadcrumb,
  buildPathBreadcrumbs,
} from "@/components/breadcrumb";
import { findNavTitle, getDefaultRouteForRole } from "@/lib/navigation";
import type { SessionUser } from "@/lib/session";
import { TYPE_ROLE_LABELS } from "@/types/auth.type";

type HeaderProps = {
  user: SessionUser;
  onLogout: () => void;
  onMenuOpen: () => void;
};

export function Header({ user, onLogout, onMenuOpen }: HeaderProps) {
  const [openMenuPathname, setOpenMenuPathname] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const { data } = useUnreadNotifications();

  const unreadCount = data?.data?.length ?? 0;
  const isMenuOpen = openMenuPathname === pathname;
  const title = findNavTitle(user.role, pathname);
  // Pengunjung tidak punya akses dashboard; awal breadcrumb memakai halaman utama role-nya.
  const homeHref = getDefaultRouteForRole(user.role);
  const home = homeHref === "/dashboard" ? undefined : { label: findNavTitle(user.role, homeHref), href: homeHref };
  const breadcrumbItems = buildPathBreadcrumbs(pathname, home).map(
    (item, index, items) =>
      index === items.length - 1 ? { ...item, label: title } : item,
  );

  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || user.name.slice(0, 1).toUpperCase();

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenuPathname(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuPathname(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 flex h-16 print:hidden shrink-0 items-center gap-2 border-b border-natural-muted bg-white px-3 sm:gap-3 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Buka navigasi"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-natural-muted text-forest-deep transition hover:border-forest-primary hover:bg-natural-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-primary md:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="hidden sm:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <h1
            title={title}
            className="truncate text-sm font-bold tracking-tight text-forest-black sm:text-base"
          >
            {title}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link
          href="/notifications"
          aria-label={
            unreadCount > 0
              ? `Notifikasi, ${unreadCount} belum dibaca`
              : "Notifikasi"
          }
          className="group relative inline-flex size-10 items-center justify-center rounded-lg border border-natural-muted text-forest-deep transition hover:border-forest-primary hover:bg-natural-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-primary"
        >
          <Bell
            aria-hidden="true"
            className="size-[1.15rem] transition-transform group-hover:scale-105"
          />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.6rem] font-bold text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() =>
              setOpenMenuPathname((current) =>
                current === pathname ? null : pathname,
              )
            }
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            aria-label="Menu akun"
            className="flex h-10 items-center gap-2 rounded-lg border border-natural-muted py-1 pl-1 pr-2 transition hover:border-forest-primary hover:bg-natural-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-primary"
          >
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
            >
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-[9rem] truncate text-xs font-semibold text-forest-black">
                {user.name}
              </span>
              <span className="block text-[0.65rem] text-sage">
                {TYPE_ROLE_LABELS[user.role]}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`hidden size-3.5 text-sage transition-transform sm:block ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isMenuOpen ? (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-natural-muted bg-white shadow-card"
            >
              <div className="border-b border-natural-muted bg-natural-muted/25 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                  >
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-forest-black">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-sage">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-olive-dark transition hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  Keluar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
