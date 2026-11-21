import type { TYPE_USER_ROLE } from "@/types/auth.type";

export type NavIcon =
  | "grid"
  | "map"
  | "bell"
  | "paw"
  | "alert"
  | "species"
  | "device"
  | "zone"
  | "chart"
  | "ai"
  | "report";

export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const COMMON_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "Live Map", href: "/tracking/live-map", icon: "map" },
  { label: "Notifikasi", href: "/notifications", icon: "bell" },
  { label: "AI Vision", href: "/ai/vision", icon: "ai" },
  { label: "Laporan AI", href: "/ai/reports", icon: "report" },
];

const CONSERVATION_ITEMS: NavItem[] = [
  { label: "Satwa", href: "/animals", icon: "paw" },
  { label: "Wildlife Explorer", href: "/wildlife-explorer", icon: "paw" },
  { label: "Insiden", href: "/incidents", icon: "alert" },
];

const RESEARCH_ITEMS: NavItem[] = [
  { label: "Satwa", href: "/animals", icon: "paw" },
  { label: "Wildlife Explorer", href: "/wildlife-explorer", icon: "paw" },
  { label: "Spesies", href: "/species", icon: "species" },
  { label: "Perangkat", href: "/devices", icon: "device" },
];

const ADMIN_ITEMS: NavItem[] = [
  ...RESEARCH_ITEMS,
  { label: "Zona Geografis", href: "/geo-zones", icon: "zone" },
];

const POLICY_ITEMS: NavItem[] = [
  { label: "Statistik", href: "/statistics", icon: "chart" },
];

export const NAV_SECTIONS: Record<TYPE_USER_ROLE, NavSection[]> = {
  konservasionis_lapangan: [
    { title: "Umum", items: COMMON_ITEMS },
    { title: "Lapangan", items: CONSERVATION_ITEMS },
  ],
  peneliti_ekologi: [
    { title: "Umum", items: COMMON_ITEMS },
    {
      title: "Penelitian",
      items: [
        ...RESEARCH_ITEMS,
        {
          label: "Verifikasi AI",
          href: "/ai/vision/pending",
          icon: "ai",
        },
      ],
    },
  ],
  administrator_sistem: [
    { title: "Umum", items: COMMON_ITEMS },
    { title: "Master Data", items: ADMIN_ITEMS },
  ],
  pengambil_kebijakan: [
    { title: "Umum", items: COMMON_ITEMS },
    { title: "Kebijakan", items: POLICY_ITEMS },
  ],
};

export const DEFAULT_ROLE: TYPE_USER_ROLE = "konservasionis_lapangan";

export const getDefaultRouteForRole = (role: TYPE_USER_ROLE): string =>
  NAV_SECTIONS[role][0]?.items[0]?.href ?? "/dashboard";

export const isRouteActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

export const canAccessRoute = (role: TYPE_USER_ROLE, pathname: string): boolean =>
  NAV_SECTIONS[role].some((section) =>
    section.items.some(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ),
  );

export const findNavTitle = (role: TYPE_USER_ROLE, pathname: string): string => {
  const items = NAV_SECTIONS[role].flatMap((section) => section.items);

  const match = items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0];

  return match?.label ?? "Wildlife Monitoring System";
};