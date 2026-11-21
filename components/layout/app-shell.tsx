"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { useLogout } from "@/hooks/use-logout";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { canAccessRoute, getDefaultRouteForRole } from "@/lib/navigation";
import type { SessionUser } from "@/lib/session";

type AppShellProps = {
  user: SessionUser;
  children: ReactNode;
};

const SIDEBAR_STORAGE_KEY = "wms-sidebar-collapsed";
const sidebarListeners = new Set<() => void>();
let sidebarPreference: boolean | null = null;

const subscribeSidebar = (listener: () => void) => {
  sidebarListeners.add(listener);

  return () => {
    sidebarListeners.delete(listener);
  };
};

const getSidebarSnapshot = () => {
  if (typeof window === "undefined") return false;

  if (sidebarPreference === null) {
    const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    sidebarPreference =
      storedValue === null
        ? window.matchMedia("(max-width: 1023px)").matches
        : storedValue === "true";
  }

  return sidebarPreference;
};

const getServerSidebarSnapshot = () => false;

export function AppShell({ user, children }: AppShellProps) {
  const logout = useLogout();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const isSidebarCollapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getServerSidebarSnapshot,
  );

  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);
  const toggleSidebar = useCallback(() => {
    sidebarPreference = !getSidebarSnapshot();
    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(sidebarPreference),
    );
    sidebarListeners.forEach((listener) => listener());
  }, []);

  if (!canAccessRoute(user.role, pathname)) {
    const allowedPath = getDefaultRouteForRole(user.role);

    return (
      <main className="flex min-h-dvh items-center justify-center overflow-x-clip bg-background px-4 py-8">
        <Panel className="w-full max-w-lg text-center">
          <SectionHeader
            title="Akses ditolak"
            description="Role Anda tidak memiliki akses ke halaman ini."
          />
          <Link
            href={allowedPath}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Kembali ke halaman utama
          </Link>
        </Panel>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh overflow-x-clip bg-background">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
      >
        Lewati ke konten
      </a>

      <div className="hidden shrink-0 md:block">
        <Sidebar
          user={user}
          onLogout={logout}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      <MobileNav
        user={user}
        open={isMobileNavOpen}
        onClose={closeMobileNav}
        onLogout={logout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={user}
          onLogout={logout}
          onMenuOpen={() => setIsMobileNavOpen(true)}
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main
          id="main-content"
          className="min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8"
        >
          <div className="mx-auto w-full min-w-0 max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
