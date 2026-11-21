"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CircleMarker as LeafletCircleMarker,
  Map as LeafletMap,
} from "leaflet";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { toApiErrorState } from "@/services/api";
import type { WildlifeMarker } from "@/types/wildlife-explorer.type";
import { formatDateTime } from "@/utils/format";

type WildlifeMapProps = {
  markers: WildlifeMarker[];
  selectedAnimalId: number | null;
  onSelect: (animalId: number) => void;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
};

const appendPopupRow = (
  container: HTMLDivElement,
  label: string,
  value: string,
) => {
  const row = document.createElement("p");
  row.className = "mt-1 text-xs text-[#46594e]";

  const labelNode = document.createElement("span");
  labelNode.className = "font-semibold";
  labelNode.textContent = `${label}: `;

  row.append(labelNode, document.createTextNode(value));
  container.append(row);
};

export function WildlifeMap({
  markers,
  selectedAnimalId,
  onSelect,
  isLoading,
  error,
  onRetry,
}: WildlifeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef(new Map<number, LeafletCircleMarker>());
  const centerRef = useRef<[number, number] | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const shouldRenderMap = !isLoading && !error && markers.length > 0;

  useEffect(() => {
    if (centerRef.current === null && markers.length > 0) {
      centerRef.current = [markers[0].latitude, markers[0].longitude];
    }
  }, [markers]);

  useEffect(() => {
    let cancelled = false;
    const markerStore = markersRef.current;

    async function initializeMap() {
      const L = await import("leaflet");

      if (
        cancelled ||
        !shouldRenderMap ||
        !containerRef.current ||
        mapRef.current !== null ||
        centerRef.current === null
      ) {
        return;
      }

      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView(centerRef.current, 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    }

    void initializeMap();

    return () => {
      cancelled = true;
      markerStore.forEach((marker) => marker.remove());
      markerStore.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [shouldRenderMap]);

  useEffect(() => {
    const currentMap = mapRef.current;
    if (currentMap === null || !mapReady) return;

    let cancelled = false;
    const markerStore = markersRef.current;
    const mapInstance = currentMap;

    async function renderMarkers() {
      const L = await import("leaflet");
      if (cancelled) return;

      markerStore.forEach((marker) => marker.remove());
      markerStore.clear();

      markers.forEach((marker) => {
        const leafletMarker = L.circleMarker(
          [marker.latitude, marker.longitude],
          {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: "#2f6b4f",
            fillOpacity: 0.95,
          },
        ).addTo(mapInstance);

        const popupContent = document.createElement("div");
        const title = document.createElement("strong");
        title.className = "text-sm text-[#17271f]";
        title.textContent = marker.animalCode;
        popupContent.append(title);

        appendPopupRow(popupContent, "Spesies", marker.speciesName);
        appendPopupRow(
          popupContent,
          "Koordinat",
          `${marker.latitude.toFixed(5)}, ${marker.longitude.toFixed(5)}`,
        );
        appendPopupRow(
          popupContent,
          "Tercatat",
          formatDateTime(marker.recordedAt),
        );

        leafletMarker.bindPopup(popupContent);
        leafletMarker.on("click", () => onSelect(marker.animalId));
        markerStore.set(marker.animalId, leafletMarker);
      });

      if (markers.length > 1) {
        const bounds = L.latLngBounds(
          markers.map(
            (marker) =>
              [marker.latitude, marker.longitude] as [number, number],
          ),
        );
        mapInstance.fitBounds(bounds, { padding: [32, 32], maxZoom: 11 });
      } else if (markers.length === 1) {
        mapInstance.setView([markers[0].latitude, markers[0].longitude], 11);
      }
    }

    void renderMarkers();

    return () => {
      cancelled = true;
      markerStore.forEach((marker) => marker.remove());
      markerStore.clear();
    };
  }, [markers, mapReady, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (
      map === null ||
      selectedAnimalId === null ||
      !markersRef.current.has(selectedAnimalId)
    ) {
      return;
    }

    const marker = markersRef.current.get(selectedAnimalId);
    const location = markers.find(
      (item) => item.animalId === selectedAnimalId,
    );

    if (!marker || !location) return;

    map.flyTo([location.latitude, location.longitude], Math.max(map.getZoom(), 11), {
      duration: 0.5,
    });
    marker.openPopup();
  }, [selectedAnimalId, markers]);

  return (
    <Panel>
      <SectionHeader
        title="Persebaran Satwa"
        description="Posisi terakhir dari pembacaan GPS backend, bukan posisi langsung secara real-time."
        action={
          markers.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark">
              {markers.length} titik GPS
            </span>
          ) : null
        }
      />

      {isLoading ? (
        <Loading label="Memuat data lokasi GPS..." />
      ) : error ? (
        <ErrorState
          kind={toApiErrorState(error).kind}
          message={toApiErrorState(error).message}
          status={toApiErrorState(error).status}
          errors={toApiErrorState(error).errors}
          onRetry={onRetry}
        />
      ) : markers.length === 0 ? (
        <EmptyState
          title="Belum ada lokasi GPS"
          description="Backend belum mengembalikan koordinat GPS yang valid untuk satwa yang tersedia."
        />
      ) : (
        <div className="relative h-[20rem] w-full overflow-hidden rounded-card border border-line bg-surface-muted sm:h-[24rem] lg:h-[26rem]">
          <div
            ref={containerRef}
            className="h-full w-full"
            aria-label="Peta interaktif persebaran satwa"
          />
        </div>
      )}
    </Panel>
  );
}
