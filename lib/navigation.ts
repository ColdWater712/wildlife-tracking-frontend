import {
  roleHasPermission,
  type AppPermission,
  type TYPE_USER_ROLE,
} from "@/types/auth.type";

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
  | "report"
  | "face"
  | "threat"
  | "recap"
  | "media"
  | "visit"
  | "weather"
  | "export"
  | "users"
  | "shield"
  | "log"
  | "profile"
  | "check"
  | "history"
  | "route"
  | "ticket"
  | "guide"
  | "wallet"
  | "star"
  | "scan"
  | "price"
  | "calendar"
  | "cashier"
  | "globe";

export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
  /** Izin backend (tabel role_permissions) yang dibutuhkan; jika array, cukup salah satu. */
  permission: AppPermission | AppPermission[];
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const COMMON_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "grid", permission: "view_data" },
  { label: "Live Map", href: "/tracking/live-map", icon: "map", permission: "view_data" },
  { label: "Notifikasi", href: "/notifications", icon: "bell", permission: "view_data" },
];

const AI_ITEMS: NavItem[] = [
  { label: "AI Vision", href: "/ai/vision", icon: "ai", permission: "upload_media" },
  { label: "Riwayat Prediksi", href: "/ai/vision/history", icon: "history", permission: "view_data" },
  { label: "Verifikasi AI", href: "/ai/vision/pending", icon: "check", permission: "verify_ai" },
  { label: "Ancaman", href: "/ai/threats", icon: "threat", permission: "view_data" },
  { label: "Rekap Data AI", href: "/ai/recap", icon: "recap", permission: "view_data" },
  { label: "Laporan AI", href: "/ai/reports", icon: "report", permission: "view_data" },
  { label: "Media Unggahan", href: "/ai/media", icon: "media", permission: "view_data" },
  { label: "Wajah Staf", href: "/ai/staff-faces", icon: "face", permission: "manage_users" },
];

const FIELD_ITEMS: NavItem[] = [
  { label: "Satwa", href: "/animals", icon: "paw", permission: "view_data" },
  { label: "Wildlife Explorer", href: "/wildlife-explorer", icon: "paw", permission: "view_data" },
  { label: "Insiden", href: "/incidents", icon: "alert", permission: "view_data" },
  { label: "Kunjungan Zona", href: "/zone-visits", icon: "visit", permission: "view_data" },
  { label: "Cuaca", href: "/weather", icon: "weather", permission: "view_data" },
];

const MASTER_DATA_ITEMS: NavItem[] = [
  { label: "Spesies", href: "/species", icon: "species", permission: "view_data" },
  { label: "Perangkat", href: "/devices", icon: "device", permission: "view_data" },
  { label: "Zona Geografis", href: "/geo-zones", icon: "zone", permission: "view_data" },
];

const REPORT_ITEMS: NavItem[] = [
  { label: "Statistik", href: "/statistics", icon: "chart", permission: "view_data" },
  { label: "Laporan Agregat", href: "/reports", icon: "report", permission: "view_reports" },
  { label: "Ekspor Data", href: "/exports", icon: "export", permission: "export_data" },
];

const SYSTEM_ITEMS: NavItem[] = [
  { label: "Pengguna", href: "/users", icon: "users", permission: "manage_users" },
  { label: "Role & Izin", href: "/roles", icon: "shield", permission: "manage_roles" },
  { label: "Log Aktivitas", href: "/activity-logs", icon: "log", permission: "manage_users" },
];

/** Menu pengunjung (role pengunjung hanya punya izin book_tickets). */
const VISITOR_ITEMS: NavItem[] = [
  { label: "Jelajah Tur", href: "/tours", icon: "route", permission: "book_tickets" },
  { label: "Peta 3D", href: "/tours/map-3d", icon: "globe", permission: "book_tickets" },
  { label: "Jadwal Pemandu", href: "/guides", icon: "guide", permission: "book_tickets" },
  { label: "Pesanan Saya", href: "/bookings", icon: "ticket", permission: "book_tickets" },
];

/** Loket: kasir POS walk-in dan pemeriksaan tiket di pintu masuk. */
const COUNTER_ITEMS: NavItem[] = [
  { label: "Kasir (POS)", href: "/pos", icon: "cashier", permission: "sell_tickets" },
  { label: "Check-in Tiket", href: "/tourism/check-in", icon: "scan", permission: "validate_tickets" },
  { label: "Riwayat Sesi Kas", href: "/pos/sessions", icon: "history", permission: "sell_tickets" },
  { label: "Laporan Harian", href: "/pos/report", icon: "recap", permission: "manage_tourism" },
];

const TOURISM_ITEMS: NavItem[] = [
  { label: "Pemesanan", href: "/tourism/bookings", icon: "ticket", permission: "manage_tourism" },
  { label: "Verifikasi Pembayaran", href: "/tourism/payments", icon: "wallet", permission: "manage_tourism" },
  { label: "Rute Tur", href: "/tourism/routes", icon: "route", permission: "manage_tourism" },
  { label: "Pemandu", href: "/tourism/guides", icon: "guide", permission: "manage_tourism" },
  { label: "Shift Pemandu", href: "/tourism/shifts", icon: "calendar", permission: "manage_tourism" },
  { label: "Tarif & Libur", href: "/tourism/prices", icon: "price", permission: "manage_tourism" },
  { label: "Ulasan", href: "/tourism/reviews", icon: "star", permission: "manage_tourism" },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { label: "Profil Saya", href: "/profile", icon: "profile", permission: ["view_data", "book_tickets"] },
];

const ALL_SECTIONS: NavSection[] = [
  { title: "Umum", items: COMMON_ITEMS },
  { title: "Analisis AI", items: AI_ITEMS },
  { title: "Lapangan", items: FIELD_ITEMS },
  { title: "Master Data", items: MASTER_DATA_ITEMS },
  { title: "Laporan", items: REPORT_ITEMS },
  { title: "Sistem", items: SYSTEM_ITEMS },
  { title: "Wisata", items: VISITOR_ITEMS },
  { title: "Loket", items: COUNTER_ITEMS },
  { title: "Kelola Wisata", items: TOURISM_ITEMS },
  { title: "Akun", items: ACCOUNT_ITEMS },
];

const itemAllowed = (role: TYPE_USER_ROLE, item: NavItem): boolean =>
  (Array.isArray(item.permission) ? item.permission : [item.permission]).some((permission) =>
    roleHasPermission(role, permission),
  );

const sectionsForRole = (role: TYPE_USER_ROLE): NavSection[] =>
  ALL_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => itemAllowed(role, item)),
  })).filter((section) => section.items.length > 0);

export const NAV_SECTIONS: Record<TYPE_USER_ROLE, NavSection[]> = {
  konservasionis_lapangan: sectionsForRole("konservasionis_lapangan"),
  peneliti_ekologi: sectionsForRole("peneliti_ekologi"),
  administrator_sistem: sectionsForRole("administrator_sistem"),
  pengambil_kebijakan: sectionsForRole("pengambil_kebijakan"),
  petugas_loket: sectionsForRole("petugas_loket"),
  pengunjung: sectionsForRole("pengunjung"),
};

/** Halaman tambah/ubah memakai izin backend yang lebih ketat daripada menu daftarnya. */
const WRITE_ROUTES: { pattern: RegExp; permission: AppPermission }[] = [
  {
    pattern: /^\/(animals|species|devices|geo-zones)\/(create|[^/]+\/(edit|update))$/,
    permission: "manage_master_data",
  },
  { pattern: /^\/incidents\/create$/, permission: "create_data" },
  { pattern: /^\/incidents\/[^/]+\/(edit|update)$/, permission: "update_data" },
  { pattern: /^\/zone-visits\/create$/, permission: "create_data" },
  { pattern: /^\/tours\/[^/]+\/book$/, permission: "book_tickets" },
  // /pos/report berada di bawah menu /pos (kasir), tetapi laporan harian khusus pengelola.
  { pattern: /^\/pos\/report/, permission: "manage_tourism" },
];

export const DEFAULT_ROLE: TYPE_USER_ROLE = "konservasionis_lapangan";

export const getDefaultRouteForRole = (role: TYPE_USER_ROLE): string =>
  NAV_SECTIONS[role][0]?.items[0]?.href ?? "/dashboard";

export const isRouteActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

export const canAccessRoute = (role: TYPE_USER_ROLE, pathname: string): boolean => {
  const writeRoute = WRITE_ROUTES.find((route) => route.pattern.test(pathname));

  if (writeRoute && !roleHasPermission(role, writeRoute.permission)) return false;

  return NAV_SECTIONS[role].some((section) =>
    section.items.some((item) => isRouteActive(pathname, item.href)),
  );
};

const findActiveItem = (role: TYPE_USER_ROLE, pathname: string): NavItem | undefined =>
  NAV_SECTIONS[role]
    .flatMap((section) => section.items)
    .filter((item) => isRouteActive(pathname, item.href))
    .sort((left, right) => right.href.length - left.href.length)[0];

/** Menu paling spesifik untuk path ini (mis. /ai/vision/history, bukan /ai/vision). */
export const findActiveHref = (role: TYPE_USER_ROLE, pathname: string): string | null =>
  findActiveItem(role, pathname)?.href ?? null;

export const findNavTitle = (role: TYPE_USER_ROLE, pathname: string): string =>
  findActiveItem(role, pathname)?.label ?? "Wildlife Monitoring System";
