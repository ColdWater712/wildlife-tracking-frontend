"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";

import { useLogout } from "@/hooks/use-logout";
import { Header, MobileNav, Sidebar } from "@/components/navigation/main";
import { DrunkEffectsEngine } from "@/components/navigation/main/drunk-effects-engine";
import { UserRoleProvider, usePreferences } from "@/components/providers/preferences-provider";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { canAccessRoute, getDefaultRouteForRole } from "@/lib/navigation";
import type { SessionUser } from "@/lib/session";

type AppShellProps = {
  user: SessionUser;
  children: ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  const logout = useLogout();
  const pathname = usePathname();
  const { t } = usePreferences();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);

  if (!canAccessRoute(user.role, pathname)) {
    const allowedPath = getDefaultRouteForRole(user.role);

    return (
      <main className="flex min-h-dvh items-center justify-center overflow-x-clip bg-background px-4 py-8">
        <Panel className="w-full max-w-lg text-center">
          <SectionHeader
            title={t("accessDeniedTitle")}
            description={t("accessDeniedDescription")}
          />
          <Link
            href={allowedPath}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {t("backToHome")}
          </Link>
        </Panel>
      </main>
    );
  }

  return (
    <UserRoleProvider role={user.role}>
      <div
        data-drunk-perspective="true"
        className="flex min-h-dvh overflow-x-clip bg-background"
      >
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          {t("skipToContent")}
        </a>

        <div data-drunk-immune="true" className="hidden shrink-0 md:block print:hidden">
          <Sidebar user={user} onLogout={logout} />
        </div>

        <MobileNav
          user={user}
          open={isMobileNavOpen}
          onClose={closeMobileNav}
          onLogout={logout}
        />

        <div data-drunk-stage="true" className="flex min-w-0 flex-1 flex-col">
          <Header
            user={user}
            onLogout={logout}
            onMenuOpen={() => setIsMobileNavOpen(true)}
          />
          <main
            id="main-content"
            className="min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 print:p-0"
          >
            <div className="mx-auto w-full min-w-0 max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
      <DrunkEffectsEngine />
    </UserRoleProvider>
  );
}
