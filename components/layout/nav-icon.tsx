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
