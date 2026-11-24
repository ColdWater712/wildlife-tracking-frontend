"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { GeoJSONSource, Map as MlMap, Marker, StyleSpecification } from "maplibre-gl";
import { Layers, Mountain, Pause, Play } from "lucide-react";

import { cn } from "@/lib/utils";

export type Map3DRoute = {
  id: number;
  name: string;
  color: string;
  /** [lintang, bujur, ketinggian m] dari backend. */
  waypoints: [number, number, number][];
  meeting?: { lat: number; lon: number; label: string } | null;
};

export type RouteMap3DHandle = { flyThrough: (id: number) => void; stop: () => void; focus: (id: number | null) => void };

type Basemap = "satellite" | "osm";

/*
 * Sumber tile publik tanpa API key, bisa diganti lewat env (mis. penyedia berlisensi dengan key untuk trafik besar).
 * Dipanggil langsung dari browser pengguna (lihat README: privasi & lisensi).
 */
const TERRARIUM =
  process.env.NEXT_PUBLIC_MAP_TERRAIN_URL || "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const SATELLITE =
  process.env.NEXT_PUBLIC_MAP_SATELLITE_URL ||
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const OSM = process.env.NEXT_PUBLIC_MAP_STREET_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const SATELLITE_ATTRIBUTION = process.env.NEXT_PUBLIC_MAP_SATELLITE_ATTRIBUTION || "Citra © Esri, Maxar, Earthstar Geographics";
const EXAGGERATION = 1.6;
/** Pusat TN Gunung Leuser bila belum ada rute. */
const LEUSER: [number, number] = [97.6, 3.75];

const buildStyle = (basemap: Basemap): StyleSpecification => ({
  version: 8,
  sources: {
    satellite: { type: "raster", tiles: [SATELLITE], tileSize: 256, maxzoom: 18, attribution: SATELLITE_ATTRIBUTION },
    osm: { type: "raster", tiles: [OSM], tileSize: 256, maxzoom: 19, attribution: "© OpenStreetMap contributors" },
    terrainDem: { type: "raster-dem", tiles: [TERRARIUM], encoding: "terrarium", tileSize: 256, maxzoom: 15, attribution: "Elevasi: Mapzen Terrain Tiles (AWS Open Data)" },
    hillshadeDem: { type: "raster-dem", tiles: [TERRARIUM], encoding: "terrarium", tileSize: 256, maxzoom: 15 },
  },
  layers: [
    { id: "satellite", type: "raster", source: "satellite", layout: { visibility: basemap === "satellite" ? "visible" : "none" } },
    { id: "osm", type: "raster", source: "osm", layout: { visibility: basemap === "osm" ? "visible" : "none" } },
    {
      id: "hillshade",
      type: "hillshade",
      source: "hillshadeDem",
      paint: { "hillshade-shadow-color": "#13241a", "hillshade-highlight-color": "#ffffff", "hillshade-exaggeration": 0.3 },
    },
  ],
  terrain: { source: "terrainDem", exaggeration: EXAGGERATION },
  sky: {
    "sky-color": "#a9cbe0",
    "horizon-color": "#e6eee4",
    "fog-color": "#dce6d8",
    "sky-horizon-blend": 0.6,
    "horizon-fog-blend": 0.7,
    "fog-ground-blend": 0.35,
  },
});

const toLngLat = ([lat, lon]: [number, number, number]): [number, number] => [lon, lat];

const distance = (a: [number, number], b: [number, number]) => {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
};

const bearing = (a: [number, number], b: [number, number]) => {
  const rad = Math.PI / 180;
  const y = Math.sin((b[0] - a[0]) * rad) * Math.cos(b[1] * rad);
  const x = Math.cos(a[1] * rad) * Math.sin(b[1] * rad) - Math.sin(a[1] * rad) * Math.cos(b[1] * rad) * Math.cos((b[0] - a[0]) * rad);
  return (Math.atan2(y, x) / rad + 360) % 360;
};

/** Titik di sepanjang jalur pada jarak `d` meter, beserta ketinggian hasil interpolasi. */
const pointAt = (points: [number, number, number][], cumulative: number[], d: number) => {
  let index = cumulative.findIndex((value) => value >= d);
  if (index <= 0) index = 1;
  const span = cumulative[index] - cumulative[index - 1] || 1;
  const t = Math.min(1, Math.max(0, (d - cumulative[index - 1]) / span));
  const [lat1, lon1, e1] = points[index - 1];
  const [lat2, lon2, e2] = points[index];
  return { lngLat: [lon1 + (lon2 - lon1) * t, lat1 + (lat2 - lat1) * t] as [number, number], elevation: e1 + (e2 - e1) * t };
};

const routesGeoJson = (routes: Map3DRoute[]) => ({
  type: "FeatureCollection" as const,
  features: routes
    .filter((route) => route.waypoints.length > 1)
    .map((route) => ({
      type: "Feature" as const,
      properties: { id: route.id, color: route.color, name: route.name },
      geometry: { type: "LineString" as const, coordinates: route.waypoints.map(toLngLat) },
    })),
});

export const RouteMap3D = forwardRef<
  RouteMap3DHandle,
  { routes: Map3DRoute[]; selectedId?: number | null; onSelect?: (id: number) => void; className?: string }
>(function RouteMap3D({ routes, selectedId = null, onSelect, className }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const hikerRef = useRef<Marker | null>(null);
  const frameRef = useRef<number | null>(null);
  const routesRef = useRef(routes);
  const onSelectRef = useRef(onSelect);
  const tileErrorsRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [tilesWarning, setTilesWarning] = useState(false);
  const [basemap, setBasemap] = useState<Basemap>("satellite");
  const [terrainOn, setTerrainOn] = useState(true);
  const [flying, setFlying] = useState<{ name: string; elevation: number; progress: number } | null>(null);

  useEffect(() => {
    routesRef.current = routes;
    onSelectRef.current = onSelect;
  });

  const fitTo = useCallback((id: number | null, animate = true) => {
    const map = mapRef.current;
    if (!map) return;
    const list = routesRef.current.filter((route) => (id ? route.id === id : true));
    const points = list.flatMap((route) => [...route.waypoints.map(toLngLat), ...(route.meeting ? [[route.meeting.lon, route.meeting.lat] as [number, number]] : [])]);
    if (points.length === 0) return;
    const lons = points.map((point) => point[0]);
    const lats = points.map((point) => point[1]);
    map.fitBounds(
      [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ],
      { padding: 70, pitch: 62, bearing: -25, duration: animate ? 1600 : 0, maxZoom: 15 },
    );
  }, []);

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    hikerRef.current?.remove();
    hikerRef.current = null;
    setFlying(null);
  }, []);

  const flyThrough = useCallback(
    async (id: number) => {
      const map = mapRef.current;
      const route = routesRef.current.find((item) => item.id === id);
      if (!map || !route || route.waypoints.length < 2) return;
      stop();

      const maplibregl = (await import("maplibre-gl")).default;
      const points = route.waypoints;
      const cumulative = [0];
      for (let i = 1; i < points.length; i++) cumulative.push(cumulative[i - 1] + distance(toLngLat(points[i - 1]), toLngLat(points[i])));
      const total = cumulative[cumulative.length - 1];
      // ±1,2 detik per 100 m, dibatasi 12–40 detik.
      const duration = Math.min(40_000, Math.max(12_000, total * 12));

      const dot = document.createElement("div");
      dot.className = "size-4 rounded-full border-2 border-white shadow-lg";
      dot.style.background = route.color;
      hikerRef.current = new maplibregl.Marker({ element: dot }).setLngLat(toLngLat(points[0])).addTo(map);

      let smoothBearing = bearing(toLngLat(points[0]), toLngLat(points[1]));
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const here = pointAt(points, cumulative, progress * total);
        const ahead = pointAt(points, cumulative, Math.min(total, progress * total + Math.max(60, total * 0.05)));
        const target = bearing(here.lngLat, ahead.lngLat);
        const delta = ((target - smoothBearing + 540) % 360) - 180;
        smoothBearing = (smoothBearing + delta * 0.05 + 360) % 360;

        map.jumpTo({ center: here.lngLat, bearing: smoothBearing, pitch: 70, zoom: 15.3 });
        hikerRef.current?.setLngLat(here.lngLat);
        setFlying({ name: route.name, elevation: Math.round(here.elevation), progress });

        if (progress < 1) frameRef.current = requestAnimationFrame(step);
        else {
          frameRef.current = null;
          window.setTimeout(() => {
            hikerRef.current?.remove();
            hikerRef.current = null;
            setFlying(null);
            fitTo(id);
          }, 800);
        }
      };
      map.easeTo({ center: toLngLat(points[0]), zoom: 15.3, pitch: 70, bearing: smoothBearing, duration: 1500 });
      window.setTimeout(() => {
        frameRef.current = requestAnimationFrame(step);
      }, 1500);
    },
    [fitTo, stop],
  );

  useImperativeHandle(ref, () => ({ flyThrough: (id) => void flyThrough(id), stop, focus: (id) => fitTo(id) }), [fitTo, flyThrough, stop]);

  // Inisialisasi peta (sekali).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !containerRef.current) return;
      let map: MlMap;
      try {
        map = new maplibregl.Map({
          container: containerRef.current,
          style: buildStyle("satellite"),
          center: LEUSER,
          zoom: 9,
          pitch: 55,
          maxPitch: 80,
          attributionControl: { compact: true },
        });
      } catch {
        setFailed("Browser ini tidak mendukung WebGL sehingga peta 3D tidak dapat ditampilkan. Gunakan peta 2D di halaman detail rute.");
        return;
      }
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
      map.addControl(new maplibregl.FullscreenControl(), "top-right");
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

      map.on("error", (event) => {
        // Tile gagal (offline/diblokir): peta tetap jalan, beri tahu pengguna sekali.
        if ("tile" in event || "sourceId" in event) {
          tileErrorsRef.current += 1;
          if (tileErrorsRef.current === 4) setTilesWarning(true);
        }
      });
      // Interaksi manual menghentikan animasi fly-through.
      map.on("mousedown", stop);
      map.on("touchstart", stop);
      map.on("wheel", stop);

      map.on("load", () => {
        map.addSource("routes", { type: "geojson", data: routesGeoJson(routesRef.current) });
        map.addLayer({ id: "route-casing", type: "line", source: "routes", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.85 } });
        map.addLayer({ id: "route-line", type: "line", source: "routes", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ["get", "color"], "line-width": 4.5 } });
        map.on("click", "route-line", (event) => {
          const id = Number(event.features?.[0]?.properties?.id);
          if (id) onSelectRef.current?.(id);
        });
        map.on("mouseenter", "route-line", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "route-line", () => (map.getCanvas().style.cursor = ""));
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      markersRef.current.forEach((marker) => marker.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [stop]);

  // Data rute & penanda titik kumpul.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    (map.getSource("routes") as GeoJSONSource | undefined)?.setData(routesGeoJson(routes));

    let active = true;
    void import("maplibre-gl").then(({ default: maplibregl }) => {
      if (!active) return;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = routes
        .filter((route) => route.meeting)
        .map((route) => {
          const element = document.createElement("button");
          element.type = "button";
          element.className = "rounded-full border-2 border-white px-2 py-0.5 text-[11px] font-bold text-white shadow-lg";
          element.style.background = route.color;
          element.textContent = route.name.length > 26 ? `${route.name.slice(0, 24)}…` : route.name;
          element.title = route.meeting?.label ?? route.name;
          element.addEventListener("click", () => onSelectRef.current?.(route.id));
          return new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([route.meeting!.lon, route.meeting!.lat]).addTo(map);
        });
      fitTo(selectedId, false);
    });
    return () => {
      active = false;
    };
    // selectedId sengaja tidak memicu efek ini (ditangani efek di bawah).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, routes, fitTo]);

  // Sorot rute terpilih.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setPaintProperty("route-line", "line-opacity", selectedId ? ["case", ["==", ["get", "id"], selectedId], 1, 0.35] : 1);
    map.setPaintProperty("route-line", "line-width", selectedId ? ["case", ["==", ["get", "id"], selectedId], 6, 3.5] : 4.5);
    if (selectedId) fitTo(selectedId);
  }, [ready, selectedId, fitTo]);

  const switchBasemap = (value: Basemap) => {
    setBasemap(value);
    const map = mapRef.current;
    if (!map) return;
    map.setLayoutProperty("satellite", "visibility", value === "satellite" ? "visible" : "none");
    map.setLayoutProperty("osm", "visibility", value === "osm" ? "visible" : "none");
  };

  const toggleTerrain = () => {
    const map = mapRef.current;
    if (!map) return;
    const next = !terrainOn;
    setTerrainOn(next);
    map.setTerrain(next ? { source: "terrainDem", exaggeration: EXAGGERATION } : null);
    map.easeTo({ pitch: next ? 62 : 0, duration: 800 });
  };

  if (failed) {
    return <div className={cn("flex items-center justify-center rounded-2xl border border-line bg-surface-muted p-6 text-center text-sm text-muted", className)}>{failed}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-line bg-forest-black", className)}>
      {/* maplibre memberi .maplibregl-map position:relative, jadi ukuran harus eksplisit (bukan absolute inset-0). */}
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        <div className="flex overflow-hidden rounded-xl bg-white/95 text-xs font-semibold shadow">
          {(["satellite", "osm"] as const).map((value) => (
            <button key={value} type="button" onClick={() => switchBasemap(value)} className={cn("inline-flex items-center gap-1.5 px-3 py-2", basemap === value ? "bg-primary text-white" : "text-ink-soft")}>
              <Layers className="size-3.5" /> {value === "satellite" ? "Satelit" : "Peta"}
            </button>
          ))}
        </div>
        <button type="button" onClick={toggleTerrain} aria-pressed={terrainOn} className={cn("inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow", terrainOn ? "bg-primary text-white" : "bg-white/95 text-ink-soft")}>
          <Mountain className="size-3.5" /> Relief 3D
        </button>
      </div>

      {flying ? (
        <div className="absolute inset-x-3 bottom-8 mx-auto max-w-md rounded-2xl bg-forest-black/80 p-3 text-white backdrop-blur">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-semibold">{flying.name}</span>
            <span className="tabular-nums">{flying.elevation} m dpl</span>
            <button type="button" onClick={stop} className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 font-semibold hover:bg-white/25">
              <Pause className="size-3.5" /> Stop
            </button>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-white" style={{ width: `${flying.progress * 100}%` }} /></div>
        </div>
      ) : selectedId && routes.find((route) => route.id === selectedId)?.waypoints.length ? (
        <button
          type="button"
          onClick={() => void flyThrough(selectedId)}
          className="absolute bottom-8 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary-dark shadow-lg hover:bg-white/90"
        >
          <Play className="size-4" /> Jelajahi jalur (fly-through)
        </button>
      ) : null}

      {tilesWarning ? (
        <p className="absolute right-3 top-28 max-w-60 rounded-xl bg-white/95 p-2.5 text-[11px] leading-4 text-ink-soft shadow">
          Sebagian citra/elevasi gagal dimuat. Periksa koneksi internet; jalur & titik kumpul tetap ditampilkan.
        </p>
      ) : null}
    </div>
  );
});
