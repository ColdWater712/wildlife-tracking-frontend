"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";
import { useUnreadNotifications } from "@/hooks/use-notifications";
import {
  Breadcrumb,
  buildPathBreadcrumbs,
} from "@/components/ui/breadcrumb";
import { findNavTitle } from "@/lib/navigation";
import type { SessionUser } from "@/lib/session";
import { TYPE_ROLE_LABELS } from "@/types/auth.type";

type HeaderProps = {
  user: SessionUser;
  onLogout: () => void;
  onMenuOpen: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
};

export function Header({
  user,
  onLogout,
  onMenuOpen,
  onToggleSidebar,
  isSidebarCollapsed,
}: HeaderProps) {
  const [openMenuPathname, setOpenMenuPathname] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const { data } = useUnreadNotifications();

  const unreadCount = data?.data?.length ?? 0;
  const isMenuOpen = openMenuPathname === pathname;
  const title = findNavTitle(user.role, pathname);
  const breadcrumbItems = buildPathBreadcrumbs(pathname).map(
    (item, index, items) =>
      index === items.length - 1 ? { ...item, label: title } : item,
  );

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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur sm:gap-3 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Buka navigasi"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line-strong text-ink-soft transition hover:bg-primary-soft hover:text-primary md:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>

        <button
          type="button"
          onClick={onToggleSidebar}
          aria-expanded={!isSidebarCollapsed}
          aria-label={isSidebarCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          title={isSidebarCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-line-strong text-ink-soft transition hover:bg-primary-soft hover:text-primary md:inline-flex"
        >
          {isSidebarCollapsed ? (
            <ChevronRight aria-hidden="true" className="size-5" />
          ) : (
            <ChevronLeft aria-hidden="true" className="size-5" />
          )}
        </button>

        <div className="min-w-0">
          <div className="hidden sm:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <h1
            title={title}
            className="truncate text-sm font-bold tracking-tight text-ink sm:text-base"
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
          className="relative inline-flex size-10 items-center justify-center rounded-xl border border-line-strong text-ink-soft transition hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <Bell aria-hidden="true" className="size-[1.15rem]" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.6rem] font-bold text-white ring-2 ring-surface">
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
            className="flex h-10 items-center gap-2 rounded-xl border border-line-strong py-1 pl-1 pr-2 transition hover:border-primary hover:bg-primary-soft"
          >
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
            >
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-[9rem] truncate text-xs font-semibold text-ink">
                {user.name}
              </span>
              <span className="block text-[0.65rem] text-muted">
                {TYPE_ROLE_LABELS[user.role]}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="hidden size-3.5 text-muted sm:block"
            />
          </button>

          {isMenuOpen ? (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-[min(14rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-1.5 shadow-xl"
            >
              <div className="border-b border-line px-3 pb-2 pt-1.5">
                <p className="truncate text-sm font-semibold text-ink">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-soft transition hover:bg-danger-soft hover:text-danger"
              >
                <LogOut aria-hidden="true" className="size-4" />
                Keluar
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
