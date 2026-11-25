import type { AppLocale } from "@/lib/i18n";

export type VoiceRouteEntry = {
  href: string;
  label: Record<AppLocale, string>;
  keywords: string[];
};

export const VOICE_ROUTES: VoiceRouteEntry[] = [
  {
    href: "/dashboard",
    label: { id: "Dashboard", en: "Dashboard" },
    keywords: ["dashboard", "dasbor", "beranda", "halaman utama", "home", "ringkasan"],
  },
  {
    href: "/tracking/live-map",
    label: { id: "Peta Pelacakan Langsung", en: "Live Tracking Map" },
    keywords: ["live map", "peta langsung", "pelacakan langsung", "peta satwa", "tracking map"],
  },
  {
    href: "/manual",
    label: { id: "Panduan Pengguna", en: "User Manual" },
    keywords: ["panduan", "manual", "panduan pengguna", "user manual", "cara pakai"],
  },
  {
    href: "/notifications",
    label: { id: "Notifikasi", en: "Notifications" },
    keywords: ["notifikasi", "pemberitahuan", "notif", "notifications", "alerts"],
  },
  {
    href: "/wildlife-3d",
    label: { id: "Ensiklopedia Satwa 3D", en: "3D Wildlife Encyclopedia" },
    keywords: ["satwa 3d", "ensiklopedia", "3d wildlife", "model 3d", "wildlife 3d"],
  },
  {
    href: "/tours",
    label: { id: "Jelajah Tur", en: "Explore Tours" },
    keywords: ["jelajah tur", "tur wisata", "wisata", "explore tours", "tours"],
  },
  {
    href: "/tours/map-3d",
    label: { id: "Peta Wisata 3D", en: "3D Tour Map" },
    keywords: ["peta 3d", "peta wisata", "3d map", "gunung leuser"],
  },
  {
    href: "/bookings",
    label: { id: "Pesanan Saya", en: "My Bookings" },
    keywords: ["pesanan saya", "tiket saya", "booking saya", "my bookings"],
  },
  {
    href: "/pos",
    label: { id: "Kasir POS", en: "Cashier POS" },
    keywords: ["kasir", "pos", "loket", "cashier"],
  },
  {
    href: "/tourism/check-in",
    label: { id: "Check-in Tiket", en: "Ticket Check-in" },
    keywords: ["check-in", "check in", "validasi tiket", "scan tiket"],
  },
  {
    href: "/ai/vision",
    label: { id: "AI Vision", en: "AI Vision" },
    keywords: ["ai vision", "unggah media", "deteksi ai", "analisis ai"],
  },
  {
    href: "/ai/threats",
    label: { id: "Ancaman AI", en: "AI Threats" },
    keywords: ["ancaman", "threats", "peringatan ancaman", "bahaya"],
  },
  {
    href: "/animals",
    label: { id: "Data Satwa", en: "Animals" },
    keywords: ["data satwa", "daftar satwa", "satwa", "animals"],
  },
  {
    href: "/species",
    label: { id: "Spesies", en: "Species" },
    keywords: ["spesies", "species"],
  },
  {
    href: "/devices",
    label: { id: "Perangkat", en: "Devices" },
    keywords: ["perangkat", "devices", "sensor", "kalung gps"],
  },
  {
    href: "/geo-zones",
    label: { id: "Zona Geografis", en: "Geo Zones" },
    keywords: ["zona", "geo zone", "zona geografis", "wilayah"],
  },
  {
    href: "/incidents",
    label: { id: "Insiden", en: "Incidents" },
    keywords: ["insiden", "laporan insiden", "incidents"],
  },
  {
    href: "/weather",
    label: { id: "Cuaca", en: "Weather" },
    keywords: ["cuaca", "weather", "iklim"],
  },
  {
    href: "/statistics",
    label: { id: "Statistik", en: "Statistics" },
    keywords: ["statistik", "statistics", "grafik"],
  },
  {
    href: "/reports",
    label: { id: "Laporan Agregat", en: "Aggregate Reports" },
    keywords: ["laporan", "reports", "laporan agregat"],
  },
  {
    href: "/exports",
    label: { id: "Ekspor Data", en: "Data Export" },
    keywords: ["ekspor", "export", "unduh data"],
  },
  {
    href: "/users",
    label: { id: "Pengguna", en: "Users" },
    keywords: ["pengguna", "users", "manajemen user"],
  },
  {
    href: "/profile",
    label: { id: "Profil Saya", en: "My Profile" },
    keywords: ["profil", "akun saya", "profile", "my profile"],
  },
  {
    href: "/login",
    label: { id: "Halaman Masuk", en: "Login Page" },
    keywords: ["login", "masuk", "halaman masuk"],
  },
  {
    href: "/register",
    label: { id: "Pendaftaran", en: "Registration" },
    keywords: ["daftar", "register", "registrasi", "buat akun"],
  },
];

export type VoiceAction =
  | { type: "navigate"; href: string; label: string }
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

export function interpretVoiceCommand(raw: string, locale: AppLocale): VoiceAction {
  const text = raw.trim().toLowerCase();
  if (!text) return { type: "unknown", transcript: raw };

  // Stop speech
  if (/^(diam|berhenti bicara|stop|hening|tutup suara)$/.test(text)) {
    return { type: "stop_speech" };
  }

  // Help / command list
  if (/(bantuan|perintah|menu apa saja|bisa apa|help|commands)/.test(text)) {
    return { type: "list_commands" };
  }

  // Read current page
  if (/(bacakan halaman|baca halaman|baca layar|di mana saya|read page|where am i|summarize)/.test(text)) {
    return { type: "read_page" };
  }

  // History navigation
  if (/^(kembali|halaman sebelumnya|back|go back)$/.test(text)) {
    return { type: "history", direction: "back" };
  }
  if (/^(maju|halaman berikutnya|forward|go forward)$/.test(text)) {
    return { type: "history", direction: "forward" };
  }

  // Scroll
  if (/(ke paling atas|paling atas|scroll top|back to top)/.test(text)) {
    return { type: "scroll", direction: "top" };
  }
  if (/(gulir ke bawah|scroll ke bawah|turun|scroll down)/.test(text)) {
    return { type: "scroll", direction: "down" };
  }
  if (/(gulir ke atas|scroll ke atas|naik|scroll up)/.test(text)) {
    return { type: "scroll", direction: "up" };
  }

  // Theme
  if (/(mode gelap|tema gelap|dark mode)/.test(text)) {
    return { type: "set_theme", scheme: "dark" };
  }
  if (/(mode terang|tema terang|light mode)/.test(text)) {
    return { type: "set_theme", scheme: "light" };
  }

  // Language
  if (/(bahasa inggris|ganti inggris|switch to english|english)/.test(text)) {
    return { type: "set_locale", locale: "en" };
  }
  if (/(bahasa indonesia|ganti indonesia|switch to indonesian|indonesian)/.test(text)) {
    return { type: "set_locale", locale: "id" };
  }

  // Speech rate
  if (/(lebih cepat|percepat suara|faster|speak faster)/.test(text)) {
    return { type: "set_rate", delta: 0.2 };
  }
  if (/(lebih lambat|perlambat suara|slower|speak slower)/.test(text)) {
    return { type: "set_rate", delta: -0.2 };
  }
  if (/(kecepatan normal|suara normal|normal speed)/.test(text)) {
    return { type: "set_rate", exact: 1.0 };
  }

  // Contrast & font size & reset
  if (/(kontras tinggi|high contrast|mode kontras)/.test(text)) {
    return { type: "set_contrast", high: true };
  }
  if (/(kontras normal|normal contrast|matikan kontras)/.test(text)) {
    return { type: "set_contrast", high: false };
  }
  if (/(sangat besar|tulisan ekstra besar|extra large text)/.test(text)) {
    return { type: "set_font_scale", scale: "xl" };
  }
  if (/(perbesar tulisan|tulisan besar|besarkan teks|larger text|increase font)/.test(text)) {
    return { type: "set_font_scale", scale: "lg" };
  }
  if (/(perkecil tulisan|ukuran normal|tulisan normal|normal text|default font)/.test(text)) {
    return { type: "set_font_scale", scale: "md" };
  }
  if (/(reset tampilan|reset aksesibilitas|reset accessibility)/.test(text)) {
    return { type: "reset_a11y" };
  }

  // Fill input: "isi <field> dengan <value>" or "fill <field> with <value>"
  const fillIdMatch = text.match(/^(?:isi|ketik|masukkan)\s+(.+?)\s+dengan\s+(.+)$/);
  if (fillIdMatch) {
    return { type: "fill_input", field: fillIdMatch[1].trim(), value: fillIdMatch[2].trim() };
  }
  const fillEnMatch = text.match(/^(?:fill|type|enter)\s+(.+?)\s+with\s+(.+)$/);
  if (fillEnMatch) {
    return { type: "fill_input", field: fillEnMatch[1].trim(), value: fillEnMatch[2].trim() };
  }

  // Click element: "klik <target>", "tekan <target>", "click <target>"
  const clickMatch = text.match(/^(?:klik|tekan|pilih|click|press)\s+(.+)$/);
  if (clickMatch) {
    return { type: "click_element", query: clickMatch[1].trim() };
  }

  // Navigate to route (match longest keyword first for specificity)
  let bestRoute: VoiceRouteEntry | null = null;
  let bestLen = 0;
  for (const route of VOICE_ROUTES) {
    for (const kw of route.keywords) {
      if (text.includes(kw) && kw.length > bestLen) {
        bestRoute = route;
        bestLen = kw.length;
      }
    }
  }
  if (bestRoute) {
    return {
      type: "navigate",
      href: bestRoute.href,
      label: bestRoute.label[locale],
    };
  }

  return { type: "unknown", transcript: raw };
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
