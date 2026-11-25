import { getNavLabel, type AppLocale } from "@/lib/i18n";
import { canAccessRoute, NAV_SECTIONS } from "@/lib/navigation";
import type { TYPE_USER_ROLE } from "@/types/auth.type";

export type VoiceRouteEntry = {
  href: string;
  label: Record<AppLocale, string>;
  keywords: string[];
  isPublic?: boolean;
};

export const VOICE_ROUTES: VoiceRouteEntry[] = [
  {
    href: "/dashboard",
    label: { id: "Dashboard", en: "Dashboard" },
    keywords: ["dashboard", "dasbor", "beranda", "halaman utama", "home", "ringkasan", "utama"],
  },
  {
    href: "/tracking/live-map",
    label: { id: "Peta Pelacakan Langsung", en: "Live Tracking Map" },
    keywords: ["live map", "peta langsung", "pelacakan langsung", "peta satwa", "tracking map", "gps langsung", "posisi satwa"],
  },
  {
    href: "/ai/staff-faces",
    label: { id: "Wajah Staf", en: "Staff Faces" },
    keywords: ["wajah staf", "data wajah staf", "muka staf", "foto staf", "biometrik staf", "face gallery", "staff faces", "pengenalan wajah", "pegawai"],
  },
  {
    href: "/ai/vision",
    label: { id: "AI Vision", en: "AI Vision" },
    keywords: ["ai vision", "unggah media", "deteksi ai", "analisis ai", "unggah foto ai", "unggah audio"],
  },
  {
    href: "/ai/vision/history",
    label: { id: "Riwayat Prediksi AI", en: "AI Prediction History" },
    keywords: ["riwayat prediksi", "history ai", "hasil prediksi", "prediksi ai", "prediction history"],
  },
  {
    href: "/ai/vision/pending",
    label: { id: "Verifikasi AI", en: "AI Verification" },
    keywords: ["verifikasi ai", "antrean ai", "pending ai", "validasi ai", "ai verification"],
  },
  {
    href: "/ai/threats",
    label: { id: "Ancaman AI", en: "AI Threats" },
    keywords: ["ancaman", "threats", "peringatan ancaman", "bahaya", "suara tembakan", "gergaji", "pembalakan"],
  },
  {
    href: "/ai/recap",
    label: { id: "Rekap Data AI", en: "AI Data Recap" },
    keywords: ["rekap ai", "rekap data", "ringkasan ai", "pdf ai", "ai recap"],
  },
  {
    href: "/ai/reports",
    label: { id: "Laporan AI", en: "AI Reports" },
    keywords: ["laporan ai", "ai reports", "narasi ai"],
  },
  {
    href: "/ai/media",
    label: { id: "Media Unggahan AI", en: "Uploaded Media" },
    keywords: ["media unggahan", "galeri media", "file ai", "uploaded media", "rekaman"],
  },
  {
    href: "/animals",
    label: { id: "Data Satwa", en: "Animals" },
    keywords: ["data satwa", "daftar satwa", "satwa", "animals", "individu satwa", "hewan"],
  },
  {
    href: "/wildlife-explorer",
    label: { id: "Wildlife Explorer", en: "Wildlife Explorer" },
    keywords: ["wildlife explorer", "penjelajah satwa", "profil individu", "reid satwa"],
  },
  {
    href: "/incidents",
    label: { id: "Insiden", en: "Incidents" },
    keywords: ["insiden", "laporan insiden", "incidents", "kejadian lapangan", "konflik satwa"],
  },
  {
    href: "/zone-visits",
    label: { id: "Kunjungan Zona", en: "Zone Visits" },
    keywords: ["kunjungan zona", "zone visits", "keluar masuk zona", "perlintasan zona"],
  },
  {
    href: "/weather",
    label: { id: "Cuaca", en: "Weather" },
    keywords: ["cuaca", "weather", "iklim", "suhu", "hujan", "kelembapan"],
  },
  {
    href: "/species",
    label: { id: "Spesies", en: "Species" },
    keywords: ["spesies", "species", "jenis satwa", "taksonomi"],
  },
  {
    href: "/devices",
    label: { id: "Perangkat", en: "Devices" },
    keywords: ["perangkat", "devices", "sensor", "kalung gps", "kamera jebak", "camera trap", "baterai"],
  },
  {
    href: "/geo-zones",
    label: { id: "Zona Geografis", en: "Geo Zones" },
    keywords: ["zona", "geo zone", "zona geografis", "wilayah", "poligon", "kawasan"],
  },
  {
    href: "/statistics",
    label: { id: "Statistik", en: "Statistics" },
    keywords: ["statistik", "statistics", "grafik", "analitik"],
  },
  {
    href: "/reports",
    label: { id: "Laporan Agregat", en: "Aggregate Reports" },
    keywords: ["laporan agregat", "laporan", "reports", "aggregate"],
  },
  {
    href: "/exports",
    label: { id: "Ekspor Data", en: "Data Export" },
    keywords: ["ekspor", "export", "unduh data", "csv", "geojson"],
  },
  {
    href: "/users",
    label: { id: "Pengguna", en: "Users" },
    keywords: ["pengguna", "users", "manajemen user", "daftar akun", "kelola user"],
  },
  {
    href: "/roles",
    label: { id: "Role & Izin", en: "Roles & Permissions" },
    keywords: ["role", "peran", "izin", "hak akses", "permissions"],
  },
  {
    href: "/activity-logs",
    label: { id: "Log Aktivitas", en: "Activity Logs" },
    keywords: ["log aktivitas", "riwayat aktivitas", "audit log", "activity logs"],
  },
  {
    href: "/tours",
    label: { id: "Jelajah Tur", en: "Explore Tours" },
    keywords: ["jelajah tur", "tur wisata", "wisata", "explore tours", "paket wisata", "pesan tiket"],
  },
  {
    href: "/tours/map-3d",
    label: { id: "Peta Wisata 3D", en: "3D Tour Map" },
    keywords: ["peta 3d", "peta wisata", "3d map", "gunung leuser"],
  },
  {
    href: "/guides",
    label: { id: "Jadwal Pemandu", en: "Guide Schedule" },
    keywords: ["jadwal pemandu", "pemandu wisata", "guide schedule", "ranger wisata"],
  },
  {
    href: "/bookings",
    label: { id: "Pesanan Saya", en: "My Bookings" },
    keywords: ["pesanan saya", "tiket saya", "booking saya", "my bookings", "e-tiket"],
  },
  {
    href: "/pos",
    label: { id: "Kasir POS", en: "Cashier POS" },
    keywords: ["kasir", "pos", "loket", "cashier", "penjualan langsung"],
  },
  {
    href: "/tourism/check-in",
    label: { id: "Check-in Tiket", en: "Ticket Check-in" },
    keywords: ["check-in", "check in", "validasi tiket", "scan tiket", "pintu masuk"],
  },
  {
    href: "/pos/sessions",
    label: { id: "Riwayat Sesi Kas", en: "Cashier Sessions" },
    keywords: ["sesi kas", "riwayat kasir", "cashier sessions", "buka tutup kas"],
  },
  {
    href: "/pos/report",
    label: { id: "Laporan Harian Loket", en: "Daily Counter Report" },
    keywords: ["laporan harian", "laporan loket", "rekap kasir", "daily report"],
  },
  {
    href: "/tourism/bookings",
    label: { id: "Kelola Pemesanan", en: "Bookings Admin" },
    keywords: ["kelola pemesanan", "daftar pemesanan", "pemesanan wisata", "tourism bookings"],
  },
  {
    href: "/tourism/payments",
    label: { id: "Verifikasi Pembayaran", en: "Payment Verification" },
    keywords: ["verifikasi pembayaran", "bukti bayar", "pembayaran wisata", "payment verification"],
  },
  {
    href: "/tourism/routes",
    label: { id: "Kelola Rute Tur", en: "Manage Tour Routes" },
    keywords: ["kelola rute", "rute tur", "tour routes", "edit rute"],
  },
  {
    href: "/tourism/guides",
    label: { id: "Kelola Pemandu", en: "Manage Guides" },
    keywords: ["kelola pemandu", "daftar pemandu", "manage guides"],
  },
  {
    href: "/tourism/shifts",
    label: { id: "Shift Pemandu", en: "Guide Shifts" },
    keywords: ["shift pemandu", "jadwal shift", "guide shifts"],
  },
  {
    href: "/tourism/prices",
    label: { id: "Tarif & Libur", en: "Prices & Holidays" },
    keywords: ["tarif", "harga tiket", "hari libur", "pnbp", "prices", "holidays"],
  },
  {
    href: "/tourism/reviews",
    label: { id: "Ulasan Wisata", en: "Tour Reviews" },
    keywords: ["ulasan", "review wisata", "rating", "komentar pengunjung"],
  },
  {
    href: "/wildlife-3d",
    label: { id: "Ensiklopedia Satwa 3D", en: "3D Wildlife Encyclopedia" },
    keywords: ["satwa 3d", "ensiklopedia", "3d wildlife", "model 3d", "wildlife 3d"],
  },
  {
    href: "/notifications",
    label: { id: "Notifikasi", en: "Notifications" },
    keywords: ["notifikasi", "pemberitahuan", "notif", "notifications", "alerts"],
  },
  {
    href: "/emergency-contacts",
    label: { id: "Kontak Darurat", en: "Emergency Contacts" },
    keywords: ["kontak darurat", "darurat", "sos", "emergency", "posko", "evakuasi", "sar"],
  },
  {
    href: "/manual",
    label: { id: "Panduan Pengguna", en: "User Manual" },
    keywords: ["panduan", "manual", "panduan pengguna", "user manual", "cara pakai"],
  },
  {
    href: "/profile",
    label: { id: "Profil Saya", en: "My Profile" },
    keywords: ["profil", "akun saya", "profile", "my profile", "ganti password"],
  },
  {
    href: "/login",
    label: { id: "Halaman Masuk", en: "Login Page" },
    keywords: ["login", "masuk", "halaman masuk"],
    isPublic: true,
  },
  {
    href: "/register",
    label: { id: "Pendaftaran", en: "Registration" },
    keywords: ["daftar", "register", "registrasi", "buat akun"],
    isPublic: true,
  },
];

const FILLER_WORDS = new Set([
  "saya", "aku", "kami", "ingin", "mau", "tolong", "coba", "bisa", "boleh", "mohon",
  "lihat", "melihat", "buka", "membuka", "pergi", "ke", "menuju", "arahkan", "tampilkan",
  "tunjukkan", "cari", "carikan", "halaman", "menu", "bagian", "fitur", "data", "daftar",
  "yang", "di", "dan", "atau", "untuk", "ini", "itu", "ya", "dong", "please", "i", "want",
  "to", "see", "open", "go", "show", "me", "the", "page", "view", "navigate", "take",
]);

const SYNONYM_MAP: Record<string, string[]> = {
  muka: ["wajah", "face"],
  pegawai: ["staf", "staff"],
  karyawan: ["staf", "staff"],
  petugas: ["staf", "loket", "pemandu"],
  biometrik: ["wajah", "staf"],
  hewan: ["satwa", "animal"],
  binatang: ["satwa", "animal"],
  bayar: ["pembayaran", "payment", "kasir"],
  transfer: ["pembayaran", "verifikasi"],
  bukti: ["pembayaran", "verifikasi"],
  harga: ["tarif", "price"],
  biaya: ["tarif", "price"],
  tiket: ["pesanan", "check-in", "wisata"],
  rekapan: ["rekap", "recap"],
  ringkasan: ["rekap", "laporan"],
  kesalahan: ["insiden", "log"],
  bahaya: ["ancaman", "darurat"],
  darurat: ["sos", "posko", "kontak"],
  telepon: ["kontak", "darurat"],
  hubungi: ["kontak", "darurat"],
  kamera: ["media", "vision", "perangkat"],
  foto: ["media", "wajah", "vision"],
  audio: ["suara", "vision"],
  peta: ["map", "3d", "zona"],
  sandi: ["password", "profil"],
  akun: ["profil", "pengguna"],
};

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !FILLER_WORDS.has(w));
}

function expandTokens(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  for (const t of tokens) {
    const syns = SYNONYM_MAP[t];
    if (syns) {
      for (const s of syns) expanded.add(s);
    }
  }
  return Array.from(expanded);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 99;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[b.length];
}

function scoreRoute(
  normalizedText: string,
  userTokens: string[],
  route: VoiceRouteEntry,
): number {
  let score = 0;

  for (const kw of route.keywords) {
    if (normalizedText.includes(kw)) {
      score += 40 + kw.length * 2;
    }
  }

  const labelTokens = tokenize(`${route.label.id} ${route.label.en}`);
  const kwTokens = new Set<string>([
    ...labelTokens,
    ...route.keywords.flatMap((kw) => tokenize(kw)),
  ]);

  for (const ut of userTokens) {
    if (kwTokens.has(ut)) {
      score += 18;
      continue;
    }
    if (ut.length >= 4) {
      for (const kt of kwTokens) {
        if (kt.length >= 4 && levenshtein(ut, kt) <= 1) {
          score += 11;
          break;
        }
      }
    }
  }

  return score;
}

export type VoiceAction =
  | { type: "navigate"; href: string; label: string }
  | { type: "access_denied"; href: string; label: string }
  | { type: "auth_required"; label: string }
  | { type: "history"; direction: "back" | "forward" }
  | { type: "read_page" }
  | { type: "list_commands" }
  | { type: "scroll"; direction: "up" | "down" | "top" }
  | { type: "set_theme"; scheme: "light" | "dark" }
  | { type: "set_locale"; locale: AppLocale }
  | { type: "set_rate"; delta?: number; exact?: number }
  | { type: "stop_speech" }
  | { type: "set_contrast"; high: boolean }
  | { type: "set_font_scale"; scale: "md" | "lg" | "xl" }
  | { type: "reset_a11y" }
  | { type: "click_element"; query: string }
  | { type: "fill_input"; field: string; value: string }
  | { type: "unknown"; transcript: string };

export function interpretVoiceCommand(
  raw: string,
  locale: AppLocale,
  userRole: TYPE_USER_ROLE | null = null,
): VoiceAction {
  const text = raw.trim().toLowerCase();
  if (!text) return { type: "unknown", transcript: raw };

  if (/^(diam|berhenti bicara|stop|hening|tutup suara)$/.test(text)) {
    return { type: "stop_speech" };
  }

  if (/(bantuan|perintah|menu apa saja|bisa apa|akses apa|help|commands)/.test(text)) {
    return { type: "list_commands" };
  }

  if (
    /(bacakan halaman|baca halaman|baca layar|di mana saya|ini halaman apa|sedang di mana|read page|where am i|summarize)/.test(
      text,
    )
  ) {
    return { type: "read_page" };
  }

  if (/^(kembali|halaman sebelumnya|balik|back|go back)$/.test(text)) {
    return { type: "history", direction: "back" };
  }
  if (/^(maju|halaman berikutnya|forward|go forward)$/.test(text)) {
    return { type: "history", direction: "forward" };
  }

  if (/(ke paling atas|paling atas|scroll top|back to top)/.test(text)) {
    return { type: "scroll", direction: "top" };
  }
  if (/(gulir ke bawah|scroll ke bawah|turun|scroll down)/.test(text)) {
    return { type: "scroll", direction: "down" };
  }
  if (/(gulir ke atas|scroll ke atas|naik|scroll up)/.test(text)) {
    return { type: "scroll", direction: "up" };
  }

  if (/(mode gelap|tema gelap|terlalu terang|silau|dark mode)/.test(text)) {
    return { type: "set_theme", scheme: "dark" };
  }
  if (/(mode terang|tema terang|terlalu gelap|light mode)/.test(text)) {
    return { type: "set_theme", scheme: "light" };
  }

  if (/(bahasa inggris|ganti inggris|switch to english|english)/.test(text)) {
    return { type: "set_locale", locale: "en" };
  }
  if (/(bahasa indonesia|ganti indonesia|switch to indonesian|indonesian)/.test(text)) {
    return { type: "set_locale", locale: "id" };
  }

  if (/(lebih cepat|percepat suara|kecepatan naik|faster|speak faster)/.test(text)) {
    return { type: "set_rate", delta: 0.2 };
  }
  if (/(lebih lambat|perlambat suara|pelan-pelan|terlalu cepat|slower|speak slower)/.test(text)) {
    return { type: "set_rate", delta: -0.2 };
  }
  if (/(kecepatan normal|suara normal|normal speed)/.test(text)) {
    return { type: "set_rate", exact: 1.0 };
  }

  if (/(kontras tinggi|high contrast|mode kontras|kurang jelas)/.test(text)) {
    return { type: "set_contrast", high: true };
  }
  if (/(kontras normal|normal contrast|matikan kontras)/.test(text)) {
    return { type: "set_contrast", high: false };
  }
  if (/(sangat besar|tulisan ekstra besar|extra large text)/.test(text)) {
    return { type: "set_font_scale", scale: "xl" };
  }
  if (/(perbesar tulisan|tulisan besar|besarkan teks|tulisan kekecilan|huruf kecil|larger text|increase font)/.test(text)) {
    return { type: "set_font_scale", scale: "lg" };
  }
  if (/(perkecil tulisan|ukuran normal|tulisan normal|normal text|default font)/.test(text)) {
    return { type: "set_font_scale", scale: "md" };
  }
  if (/(reset tampilan|reset aksesibilitas|reset accessibility)/.test(text)) {
    return { type: "reset_a11y" };
  }

  const fillIdMatch = text.match(/^(?:isi|ketik|masukkan)\s+(.+?)\s+dengan\s+(.+)$/);
  if (fillIdMatch) {
    return { type: "fill_input", field: fillIdMatch[1].trim(), value: fillIdMatch[2].trim() };
  }
  const fillEnMatch = text.match(/^(?:fill|type|enter)\s+(.+?)\s+with\s+(.+)$/);
  if (fillEnMatch) {
    return { type: "fill_input", field: fillEnMatch[1].trim(), value: fillEnMatch[2].trim() };
  }

  const clickMatch = text.match(/^(?:klik|tekan|pilih|click|press)\s+(.+)$/);
  if (clickMatch) {
    return { type: "click_element", query: clickMatch[1].trim() };
  }

  // Semantic + fuzzy intent matching across all app routes
  const userTokens = expandTokens(tokenize(text));
  if (userTokens.length > 0) {
    const scored = VOICE_ROUTES.map((route) => {
      const baseScore = scoreRoute(text, userTokens, route);
      const allowed = route.isPublic || (userRole !== null && canAccessRoute(userRole, route.href));
      return { route, baseScore, allowed };
    })
      .filter((item) => item.baseScore >= 18)
      .sort((a, b) => {
        // If scores are close, prefer routes permitted for the user's role
        if (Math.abs(a.baseScore - b.baseScore) <= 8 && a.allowed !== b.allowed) {
          return a.allowed ? -1 : 1;
        }
        return b.baseScore - a.baseScore;
      });

    if (scored.length > 0) {
      const best = scored[0];
      const label = best.route.label[locale];

      if (!best.route.isPublic) {
        if (userRole === null) {
          return { type: "auth_required", label };
        }
        if (!canAccessRoute(userRole, best.route.href)) {
          return { type: "access_denied", href: best.route.href, label };
        }
      }

      return { type: "navigate", href: best.route.href, label };
    }
  }

  return { type: "unknown", transcript: raw };
}

export function summarizeAllowedRoutesForRole(
  role: TYPE_USER_ROLE | null,
  locale: AppLocale,
): string {
  if (!role) {
    return locale === "en"
      ? "You are not signed in yet. You can say: login, register, read this page, high contrast, or larger text."
      : "Anda belum masuk akun. Anda bisa mengucapkan: login, daftar, bacakan halaman, kontras tinggi, atau perbesar tulisan.";
  }

  const labels = NAV_SECTIONS[role]
    .flatMap((section) => section.items)
    .map((item) => getNavLabel(locale, item.href, item.label));

  const listed = labels.slice(0, 10).join(", ");
  return locale === "en"
    ? `Available menus for your role include: ${listed}. You can also say read page, dark mode, high contrast, larger text, or click a button name.`
    : `Menu yang tersedia untuk role Anda antara lain: ${listed}. Anda juga bisa mengucapkan bacakan halaman, mode gelap, kontras tinggi, perbesar tulisan, atau klik nama tombol.`;
}

export function extractPageSummary(locale: AppLocale): string {
  if (typeof document === "undefined") return "";

  const root = document.getElementById("main-content") ?? document.querySelector("main") ?? document.body;
  const heading = root.querySelector("h1")?.textContent?.trim() || document.title;
  const subHeadings = Array.from(root.querySelectorAll("h2, h3"))
    .map((el) => el.textContent?.trim() ?? "")
    .filter(Boolean)
    .slice(0, 4);
  const firstPara = Array.from(root.querySelectorAll("p, [role='alert']"))
    .map((el) => el.textContent?.trim() ?? "")
    .find((txt) => txt.length > 15 && txt.length < 240);

  const parts: string[] = [];
  if (heading) {
    parts.push(
      locale === "en" ? `You are on ${heading}.` : `Anda berada di halaman ${heading}.`,
    );
  }
  if (firstPara) {
    parts.push(firstPara);
  }
  if (subHeadings.length > 0) {
    parts.push(
      locale === "en"
        ? `Main sections: ${subHeadings.join(", ")}.`
        : `Bagian utama: ${subHeadings.join(", ")}.`,
    );
  }
  return parts.join(" ");
}

export function clickMatchingElement(query: string): string | null {
  if (typeof document === "undefined") return null;
  const target = query.trim().toLowerCase();
  if (!target) return null;

  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>("button, a[href], [role='button'], [role='menuitem']"),
  );

  for (const el of candidates) {
    if (el.closest("#a11y-voice-dialog")) continue;
    if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") continue;

    const label = (
      el.getAttribute("aria-label") ||
      el.getAttribute("title") ||
      el.textContent ||
      ""
    )
      .trim()
      .toLowerCase();

    if (label && (label === target || label.includes(target))) {
      el.focus();
      el.click();
      return label;
    }
  }
  return null;
}

export function fillMatchingInput(fieldQuery: string, value: string): string | null {
  if (typeof document === "undefined") return null;
  const target = fieldQuery.trim().toLowerCase();
  if (!target) return null;

  const inputs = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea"),
  );

  for (const input of inputs) {
    if (input.closest("#a11y-voice-dialog")) continue;
    if (input.disabled || input.readOnly) continue;

    const id = input.id;
    const labelText = id
      ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent ?? ""
      : "";
    const candidateText = [
      labelText,
      input.getAttribute("aria-label") ?? "",
      input.getAttribute("placeholder") ?? "",
      input.name ?? "",
    ]
      .join(" ")
      .toLowerCase();

    if (candidateText.includes(target)) {
      const proto =
        input instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (setter) {
        setter.call(input, value);
      } else {
        input.value = value;
      }
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.focus();
      return labelText.trim() || input.getAttribute("placeholder") || input.name || target;
    }
  }
  return null;
}
