import type { NavIcon } from "@/lib/navigation";

const ICON_PATHS: Record<NavIcon, string> = {
  grid: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  paw: "M6.5 12.5C4.8 12.5 3.5 14 3.5 16s1.1 3.5 2.8 3.5 2.9-1.5 2.9-3.5-1-3.5-2.7-3.5zM17.5 12.5c-1.7 0-2.8 1.5-2.8 3.5s1.2 3.5 2.9 3.5 2.8-1.5 2.8-3.5-1.1-3.5-2.9-3.5zM8 10.2a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2zM16 10.2a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2zM12 12.5a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4z",
  alert: "M12 3 2 20h20L12 3zM12 9v5M12 17.5v.5",
  species: "M12 21c5-3 8-6 8-10a8 8 0 1 0-16 0c0 4 3 7 8 10zM9 11h.01M15 11h.01M9 15c1 1 5 1 6 0",
  device: "M7 3h10v18H7zM10 18h4M10 6h4",
  zone: "M12 2 3 7v10l9 5 9-5V7l-9-5zM12 22V12l9-5M12 12 3 7",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  ai: "M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  report: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  face: "M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0",
  threat: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3zM12 8v5M12 16.5v.5",
  recap: "M4 4h16v16H4zM8 16v-4M12 16V8M16 16v-6",
  media: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01",
  visit: "M12 21s-7-6-7-11a7 7 0 1 1 14 0c0 5-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  weather: "M7 18a4 4 0 0 1-.6-8 6 6 0 0 1 11.6 1.5A3.3 3.3 0 0 1 17.5 18H7z",
  export: "M12 3v12M7 10l5 5 5-5M5 21h14",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-4 3-6 7-6s7 2 7 6M17 4a4 4 0 0 1 0 7M22 21c0-3-1.5-5-4-5.6",
  shield: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3zM9 12l2 2 4-4",
  log: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6",
  check: "M9 12l2 2 4-4M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  history: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 3",
};

export function NavIconGlyph({ icon, className }: { icon: NavIcon; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className ?? "size-4 shrink-0"}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICON_PATHS[icon]} />
    </svg>
  );
}
