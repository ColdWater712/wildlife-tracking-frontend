"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock, Footprints, Mountain, Pause, Play, Ticket } from "lucide-react";

import { useUserRole } from "@/components/providers/preferences-provider";
import { ElevationProfile, routeColor } from "@/components/tourism";
import type { Map3DRoute } from "@/components/tourism/route-map-3d";
import { AnimalDetail, relativeTime } from "@/components/tracking/animal-detail";
import type { TrackedAnimal } from "@/components/tracking/live-terrain-map";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { useTrackingDevices } from "@/hooks/use-devices";
import { useGeoZones } from "@/hooks/use-geo-zones";
import { useTourRoutes } from "@/hooks/use-tourism";
import { useGpsReadings } from "@/hooks/use-tracking";
import { cn } from "@/lib/utils";
import { toApiErrorState } from "@/services/api";
import { roleHasPermission } from "@/types/auth.type";
import { DIFFICULTY_LABELS } from "@/types/tourism.type";
import type { GpsReading } from "@/types/tracking.type";
import { formatRupiah } from "@/utils/format";

const LiveTerrainMap = dynamic(
  () => import("@/components/tracking/live-terrain-map").then((mod) => mod.LiveTerrainMap),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-surface-muted" /> },
);

const REFRESH_MS = 10_000;
/** Titik yang lebih tua dari ini tidak lagi dianggap "live". */
const LIVE_WINDOW_MS = 60_000;
const TRAIL_WINDOW_MS = 15 * 60_000;
const TRAIL_MAX_POINTS = 90;

/** Warna per spesies — cukup kontras di atas citra satelit hijau tua. */
const SPECIES_COLORS = ["#f97316", "#facc15", "#38bdf8", "#f472b6", "#a78bfa", "#fb7185", "#2dd4bf", "#fde68a"];

const toNumber = (value: number | string | null | undefined) => {
  const n = Number(value);
  return value === null || value === undefined || !Number.isFinite(n) ? null : n;
};

const distanceM = (a: [number, number], b: [number, number]) => {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
};

const bearingDeg = (a: [number, number], b: [number, number]) => {
  const rad = Math.PI / 180;
  const y = Math.sin((b[0] - a[0]) * rad) * Math.cos(b[1] * rad);
  const x = Math.cos(a[1] * rad) * Math.sin(b[1] * rad) - Math.sin(a[1] * rad) * Math.cos(b[1] * rad) * Math.cos((b[0] - a[0]) * rad);
  return (Math.atan2(y, x) / rad + 360) % 360;
};

export default function LiveMapPage() {
  const role = useUserRole();
  const canBookTours = role ? roleHasPermission(role, "book_tickets") : false;

  const [panelTab, setPanelTab] = useState<"animals" | "routes">("animals");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [speciesId, setSpeciesId] = useState("all");
  const [onlyActive, setOnlyActive] = useState(true);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const devicesQuery = useTrackingDevices();
  const readingsQuery = useGpsReadings(undefined, { refetchInterval: paused ? false : REFRESH_MS });
  const zonesQuery = useGeoZones();
  const tourRoutesQuery = useTourRoutes();

  // Jam 1 detik untuk teks "x dtk lalu".
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const devices = useMemo(() => devicesQuery.data?.data ?? [], [devicesQuery.data]);
  const tourRoutes = useMemo(() => tourRoutesQuery.data ?? [], [tourRoutesQuery.data]);

  const mapTourRoutes = useMemo<Map3DRoute[]>(
    () =>
      tourRoutes.map((route, index) => ({
        id: route.route_id,
        name: route.name,
        color: routeColor(index),
        waypoints: route.waypoints ?? [],
        meeting:
          route.meeting_lat && route.meeting_lon
            ? { lat: Number(route.meeting_lat), lon: Number(route.meeting_lon), label: route.meeting_point }
            : null,
      })),
    [tourRoutes],
  );

  const animals = useMemo<TrackedAnimal[]>(() => {
    const byDevice = new Map<number, GpsReading[]>();
    for (const reading of readingsQuery.data?.data ?? []) {
      const list = byDevice.get(reading.device_id);
      if (list) list.push(reading);
      else byDevice.set(reading.device_id, [reading]);
    }

    const speciesOrder = [...new Set(devices.map((d) => d.animal?.species_id).filter((id): id is number => id != null))].sort((a, b) => a - b);

    return devices.flatMap((device) => {
      const animal = device.animal;
      if (!animal || device.animal_id === null) return [];

      const readings = (byDevice.get(device.device_id) ?? [])
        .map((r) => ({ lat: toNumber(r.latitude), lon: toNumber(r.longitude), at: new Date(r.recorded_at).getTime(), iso: r.recorded_at }))
        .filter((r): r is { lat: number; lon: number; at: number; iso: string } => r.lat !== null && r.lon !== null && Number.isFinite(r.at))
        .sort((a, b) => b.at - a.at);
      const latest = readings[0];
      if (!latest) return [];

      const recent = readings.filter((r) => latest.at - r.at <= TRAIL_WINDOW_MS).slice(0, TRAIL_MAX_POINTS);
      const trail = recent.map((r) => [r.lon, r.lat] as [number, number]).reverse();

      let speedKmh: number | null = null;
      let headingDeg: number | null = null;
      const previous = readings[1];
      if (previous && latest.at - previous.at <= LIVE_WINDOW_MS && latest.at > previous.at) {
        const a: [number, number] = [previous.lon, previous.lat];
        const b: [number, number] = [latest.lon, latest.lat];
        const meters = distanceM(a, b);
        speedKmh = (meters / ((latest.at - previous.at) / 1000)) * 3.6;
        headingDeg = meters > 0.5 ? bearingDeg(a, b) : null;
      }

      const speciesIndex = speciesOrder.indexOf(animal.species_id);
      return [
        {
          key: animal.animal_code ?? `SAT-${animal.animal_id}`,
          animalId: animal.animal_id,
          deviceId: device.device_id,
          speciesId: animal.species_id,
          name: animal.name_animal || animal.name || animal.animal_code || `Satwa #${animal.animal_id}`,
          speciesName: animal.species?.common_name ?? "Spesies tidak diketahui",
          latitude: latest.lat,
          longitude: latest.lon,
          recordedAt: latest.iso,
          isActive: device.is_active === true && Boolean(animal.is_active),
          trail,
          speedKmh,
          headingDeg,
          batteryLevel: device.battery_level,
          color: SPECIES_COLORS[(speciesIndex < 0 ? 0 : speciesIndex) % SPECIES_COLORS.length],
        },
      ];
    });
  }, [devices, readingsQuery.data]);

  const speciesOptions = useMemo(() => {
    const map = new Map<number, { name: string; color: string }>();
    animals
      .filter((a) => !onlyActive || a.isActive)
      .forEach((a) => map.set(a.speciesId, { name: a.speciesName, color: a.color }));
    return [...map.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => a.name.localeCompare(b.name));
  }, [animals, onlyActive]);

  const visible = useMemo(
    () =>
      animals
        .filter((a) => (speciesId === "all" || a.speciesId === Number(speciesId)) && (!onlyActive || a.isActive))
        .sort((a, b) => a.speciesName.localeCompare(b.speciesName) || a.key.localeCompare(b.key)),
    [animals, speciesId, onlyActive],
  );

  const selected = visible.find((a) => a.key === selectedKey) ?? null;
  const selectedRouteIndex = tourRoutes.findIndex((r) => r.route_id === selectedRouteId);
  const selectedRoute = selectedRouteIndex >= 0 ? tourRoutes[selectedRouteIndex] : null;

  const scrollPanelIntoViewOnMobile = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => document.getElementById("live-map-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const handleSelectAnimal = useCallback((key: string) => {
    setSelectedRouteId(null);
    setPanelTab("animals");
    setSelectedKey(key);
    scrollPanelIntoViewOnMobile();
  }, []);

  const handleSelectRoute = useCallback((routeId: number) => {
    setSelectedKey(null);
    setPanelTab("routes");
    setSelectedRouteId((current) => (current === routeId ? null : routeId));
    scrollPanelIntoViewOnMobile();
  }, []);

  if (devicesQuery.isLoading || readingsQuery.isLoading) {
    return <Loading label="Memuat posisi satwa…" />;
  }

  if (devicesQuery.error || readingsQuery.error) {
    const apiError = toApiErrorState(devicesQuery.error ?? readingsQuery.error);
    return (
      <ErrorState
        kind={apiError.kind}
        message={apiError.message}
        status={apiError.status}
        errors={apiError.errors}
        onRetry={() => {
          void devicesQuery.refetch();
          void readingsQuery.refetch();
        }}
      />
    );
  }

  const liveCount = visible.filter((a) => now - new Date(a.recordedAt).getTime() <= LIVE_WINDOW_MS).length;
  const fetchedAt = readingsQuery.dataUpdatedAt;

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Pelacakan & Peta 3D"
        title="Live Map"
        description="Posisi kalung GPS satwa, zona geografis, dan jalur rute tur 3D di TN Gunung Leuser."
        actions={
          <div className="flex items-center gap-3 text-[13px] text-muted">
            <span aria-live="polite">
              {paused ? "Pembaruan dijeda" : "Diperbarui tiap 10 detik"}
              {fetchedAt ? ` · terakhir ${new Date(fetchedAt).toLocaleTimeString("id-ID")}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 font-medium text-ink hover:bg-surface-muted"
            >
              {paused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
              {paused ? "Lanjutkan" : "Jeda"}
            </button>
          </div>
        }
        className="mb-4"
      />

      <div className="grid overflow-hidden rounded-lg border border-line bg-surface lg:h-[calc(100dvh-13rem)] lg:min-h-[560px] lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="order-1 h-[60dvh] min-h-[360px] lg:order-2 lg:h-full">
          <LiveTerrainMap
            animals={visible}
            zones={zonesQuery.data ?? []}
            selectedKey={selected?.key ?? null}
            onSelect={handleSelectAnimal}
            tourRoutes={mapTourRoutes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={handleSelectRoute}
          />
        </div>

        <aside id="live-map-panel" className="order-2 scroll-mt-16 min-h-0 overflow-y-auto border-t border-line lg:order-1 lg:border-r lg:border-t-0">
          {selected ? (
            <AnimalDetail key={selected.key} animal={selected} now={now} onBack={() => setSelectedKey(null)} />
          ) : selectedRoute ? (
            <div className="flex flex-col gap-4 p-4">
              <button
                type="button"
                onClick={() => setSelectedRouteId(null)}
                className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Kembali ke daftar rute
              </button>

              <div className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-3 w-5 shrink-0 rounded-full"
                  style={{ background: routeColor(selectedRouteIndex) }}
                />
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-ink">{selectedRoute.name}</h2>
                  <p className="text-xs text-muted">
                    {selectedRoute.entry_point} · {DIFFICULTY_LABELS[selectedRoute.difficulty]}
                  </p>
                </div>
              </div>

              <p className="text-sm leading-6 text-ink-soft">{selectedRoute.summary}</p>

              <dl className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg border border-line bg-surface-muted p-2">
                  <dt className="flex items-center gap-1 text-muted">
                    <Clock className="size-3" aria-hidden="true" />
                    Durasi
                  </dt>
                  <dd className="mt-0.5 font-bold text-ink">
                    {selectedRoute.duration_days > 1 ? `${selectedRoute.duration_days} hari` : `${selectedRoute.duration_hours} jam`}
                  </dd>
                </div>
                <div className="rounded-lg border border-line bg-surface-muted p-2">
                  <dt className="flex items-center gap-1 text-muted">
                    <Footprints className="size-3" aria-hidden="true" />
                    Jarak
                  </dt>
                  <dd className="mt-0.5 font-bold text-ink">
                    {selectedRoute.distance_km ? `${Number(selectedRoute.distance_km)} km` : "-"}
                  </dd>
                </div>
                <div className="rounded-lg border border-line bg-surface-muted p-2">
                  <dt className="flex items-center gap-1 text-muted">
                    <Mountain className="size-3" aria-hidden="true" />
                    Puncak
                  </dt>
                  <dd className="mt-0.5 font-bold text-ink">
                    {selectedRoute.waypoints?.length
                      ? `${Math.max(...selectedRoute.waypoints.map((point) => point[2]))} m`
                      : "-"}
                  </dd>
                </div>
              </dl>

              {selectedRoute.waypoints && selectedRoute.waypoints.length > 1 ? (
                <ElevationProfile waypoints={selectedRoute.waypoints} />
              ) : null}

              {selectedRoute.meeting_point ? (
                <p className="text-xs text-muted">
                  <span className="font-semibold text-ink-soft">Titik kumpul:</span> {selectedRoute.meeting_point}
                </p>
              ) : null}

              {canBookTours ? (
                <Link
                  href={`/tours/${selectedRoute.slug}/detail`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  <Ticket className="size-4" aria-hidden="true" />
                  Detail & pesan ({formatRupiah(selectedRoute.guide_fee_per_person)})
                </Link>
              ) : null}
            </div>
          ) : (
            <>
              <div role="tablist" aria-label="Layer peta" className="grid grid-cols-2 border-b border-line bg-surface-muted/50">
                <button
                  type="button"
                  role="tab"
                  aria-selected={panelTab === "animals"}
                  onClick={() => setPanelTab("animals")}
                  className={cn(
                    "border-b-2 py-2.5 text-xs font-semibold transition",
                    panelTab === "animals"
                      ? "border-primary bg-surface text-ink"
                      : "border-transparent text-muted hover:text-ink",
                  )}
                >
                  Satwa ({visible.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={panelTab === "routes"}
                  onClick={() => setPanelTab("routes")}
                  className={cn(
                    "border-b-2 py-2.5 text-xs font-semibold transition",
                    panelTab === "routes"
                      ? "border-primary bg-surface text-ink"
                      : "border-transparent text-muted hover:text-ink",
                  )}
                >
                  Rute Tur ({tourRoutes.length})
                </button>
              </div>

              {panelTab === "animals" ? (
                <>
                  <div className="flex flex-col gap-3 border-b border-line p-4">
                    <div className="flex items-end gap-3">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <label htmlFor="map-species" className="text-[13px] text-muted">
                          Spesies
                        </label>
                        <select
                          id="map-species"
                          value={speciesId}
                          onChange={(event) => setSpeciesId(event.target.value)}
                          className="ui-input h-9 py-0 text-[13px]"
                        >
                          <option value="all">Semua spesies</option>
                          {speciesOptions.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <label className="flex h-9 items-center gap-2 text-[13px] text-ink-soft">
                        <input
                          type="checkbox"
                          checked={onlyActive}
                          onChange={(event) => setOnlyActive(event.target.checked)}
                          className="size-4"
                        />
                        Aktif saja
                      </label>
                    </div>
                    <p className="text-[13px] text-muted">
                      {visible.length} satwa · {liveCount} mengirim data dalam 1 menit terakhir
                    </p>
                  </div>

                  {visible.length === 0 ? (
                    <p className="p-4 text-[13px] text-muted">
                      {animals.length === 0
                        ? "Belum ada kalung GPS yang terpasang pada satwa dan mengirim titik lokasi."
                        : "Tidak ada satwa yang cocok dengan filter ini."}
                    </p>
                  ) : (
                    <ul>
                      {visible.map((animal) => {
                        const live = now - new Date(animal.recordedAt).getTime() <= LIVE_WINDOW_MS;
                        return (
                          <li key={animal.key} className="border-b border-line last:border-b-0">
                            <button
                              type="button"
                              onClick={() => handleSelectAnimal(animal.key)}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-muted focus-visible:bg-surface-muted"
                            >
                              <span
                                aria-hidden="true"
                                className="size-2.5 shrink-0 rounded-full ring-1 ring-black/20"
                                style={{ background: animal.isActive ? animal.color : "#9ca3af" }}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="flex items-baseline justify-between gap-2">
                                  <span className="truncate text-sm font-medium text-ink">
                                    {animal.name === animal.key ? animal.speciesName : animal.name}
                                  </span>
                                  <span className="shrink-0 font-mono text-xs text-muted">{animal.key}</span>
                                </span>
                                <span className="flex items-baseline justify-between gap-2 text-xs text-muted">
                                  <span className="truncate">{animal.name === animal.key ? `Kalung #${animal.deviceId}` : animal.speciesName}</span>
                                  <span className={cn("shrink-0 tabular-nums", live && "text-success")}>
                                    {relativeTime(animal.recordedAt, now)}
                                  </span>
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {speciesOptions.length > 0 ? (
                    <div className="border-t border-line p-4 text-xs text-muted">
                      <p className="mb-2 font-medium text-ink-soft">Keterangan</p>
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {speciesOptions.map((s) => (
                          <li key={s.id} className="flex items-center gap-2">
                            <span className="size-2.5 rounded-full ring-1 ring-black/20" style={{ background: s.color }} />
                            <span className="truncate">{s.name}</span>
                          </li>
                        ))}
                        <li className="flex items-center gap-2">
                          <span className="h-0 w-3 border-t-2 border-dashed border-[#f59e0b]" /> Zona rawan
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-0 w-3 border-t-2 border-dashed border-[#22c55e]" /> Zona lindung
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1 w-3 rounded-full bg-[#38bdf8]" /> Jalur rute tur
                        </li>
                      </ul>
                      {zonesQuery.error ? (
                        <p className="mt-2 text-danger">
                          Zona gagal dimuat.{" "}
                          <button type="button" onClick={() => void zonesQuery.refetch()} className="underline">
                            Coba lagi
                          </button>
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : tourRoutesQuery.isLoading ? (
                <div className="p-4">
                  <Loading label="Memuat rute tur…" />
                </div>
              ) : tourRoutes.length === 0 ? (
                <p className="p-4 text-[13px] text-muted">Belum ada rute tur yang tersedia.</p>
              ) : (
                <ul>
                  {tourRoutes.map((route, index) => (
                    <li key={route.route_id} className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        onClick={() => handleSelectRoute(route.route_id)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-muted focus-visible:bg-surface-muted"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-2.5 w-5 shrink-0 rounded-full"
                          style={{ background: routeColor(index) }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{route.name}</span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {route.entry_point.split(",")[0]} · {DIFFICULTY_LABELS[route.difficulty]} ·{" "}
                            {route.distance_km ? `${Number(route.distance_km)} km` : "-"}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
