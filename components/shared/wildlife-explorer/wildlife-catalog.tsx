"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, PawPrint, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { BadgeVariant } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { toApiErrorState } from "@/services/api";
import {
  TYPE_CONSERVATION_STATUS_LABELS,
  type TYPE_CONSERVATION_STATUS,
} from "@/types/species.type";
import type {
  WildlifeCatalogItem,
  WildlifeFilterOption,
} from "@/types/wildlife-explorer.type";
import { formatDateTime } from "@/utils/format";

const PAGE_SIZE = 8;

const CONSERVATION_VARIANTS: Record<TYPE_CONSERVATION_STATUS, BadgeVariant> = {
  "Least Concern": "success",
  "Near Threatened": "info",
  Vulnerable: "warning",
  Endangered: "warning",
  "Critically Endangered": "danger",
  Extinct: "danger",
};

type WildlifeCatalogProps = {
  items: WildlifeCatalogItem[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  hasSourceAnimals: boolean;
  hasActiveFilters: boolean;
  selectedAnimalId: number | null;
  onSelect: (animalId: number) => void;
  speciesOptions: WildlifeFilterOption[];
  statusOptions: string[];
  search: string;
  onSearchChange: (value: string) => void;
  speciesFilter: string;
  onSpeciesFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onResetFilters: () => void;
};

export function WildlifeCatalog({
  items,
  isLoading,
  error,
  onRetry,
  hasSourceAnimals,
  hasActiveFilters,
  selectedAnimalId,
  onSelect,
  speciesOptions,
  statusOptions,
  search,
  onSearchChange,
  speciesFilter,
  onSpeciesFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
}: WildlifeCatalogProps) {
  const [pagination, setPagination] = useState({
    key: "",
    count: PAGE_SIZE,
  });
  const filterKey = `${search}|${speciesFilter}|${statusFilter}`;
  const visibleCount = pagination.key === filterKey ? pagination.count : PAGE_SIZE;
  const visibleItems = items.slice(0, visibleCount);

  return (
    <Panel>
      <SectionHeader
        title="Jelajahi Satwa"
        description="Cari, filter, dan pilih satwa dari data yang tersedia di backend."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink-soft">
            <PawPrint aria-hidden="true" className="size-3.5" />
            {items.length} satwa ditampilkan
          </span>
        }
      />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,12rem)_minmax(0,12rem)]">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="wildlife-search" className="sr-only">
            Cari satwa atau spesies
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              id="wildlife-search"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari satwa atau spesies..."
              className="ui-input pl-9"
            />
          </div>
        </div>

        <label className="block min-w-0">
          <span className="ui-label">Spesies</span>
          <select
            value={speciesFilter}
            onChange={(event) => onSpeciesFilterChange(event.target.value)}
            disabled={speciesOptions.length === 0}
            className="ui-input"
          >
            <option value="all">Semua spesies</option>
            {speciesOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="ui-label">Status Pemantauan</span>
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            disabled={statusOptions.length === 0}
            className="ui-input"
          >
            <option value="all">Semua status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {speciesOptions.length === 0 ? (
        <p className="ui-hint flex items-center gap-1.5">
          <SlidersHorizontal aria-hidden="true" className="size-3.5" />
          Data spesies belum tersedia; filter spesies dinonaktifkan.
        </p>
      ) : null}

      <div className="mt-5">
        {isLoading ? (
          <Loading label="Memuat katalog satwa..." />
        ) : error ? (
          <ErrorState
            kind={toApiErrorState(error).kind}
            message={toApiErrorState(error).message}
            status={toApiErrorState(error).status}
            errors={toApiErrorState(error).errors}
            onRetry={onRetry}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={
              hasSourceAnimals
                ? "Tidak ada satwa yang cocok"
                : "Belum ada satwa tersedia"
            }
            description={
              hasSourceAnimals
                ? "Ubah kata kunci atau filter untuk melihat satwa lain."
                : "Backend belum mengembalikan data satwa untuk ditampilkan."
            }
            action={
              hasActiveFilters
                ? { label: "Reset filter", onClick: onResetFilters }
                : undefined
            }
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleItems.map((item) => (
                <WildlifeCard
                  key={item.animalId}
                  item={item}
                  selected={selectedAnimalId === item.animalId}
                  onSelect={onSelect}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-xs text-muted">
                Menampilkan {visibleItems.length} dari {items.length} satwa
              </p>
              {visibleItems.length < items.length ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setPagination({ key: filterKey, count: visibleCount + PAGE_SIZE })
                  }
                >
                  Muat lebih banyak
                </Button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}

type WildlifeCardProps = {
  item: WildlifeCatalogItem;
  selected: boolean;
  onSelect: (animalId: number) => void;
};

function WildlifeCard({ item, selected, onSelect }: WildlifeCardProps) {
  return (
    <article
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-card border bg-surface transition",
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-line hover:border-primary/50",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(item.animalId)}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 flex-col gap-3 p-4 text-left focus-visible:outline-none"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <PawPrint aria-hidden="true" className="size-5" />
          </span>
          <StatusBadge
            label={item.monitoringStatus}
            variant={item.monitoringStatus === "Aktif" ? "success" : "neutral"}
          />
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-ink">
            {item.animalCode}
          </h3>
          <p className="truncate text-sm text-ink-soft">{item.speciesName}</p>
          <p className="truncate text-xs italic text-muted">
            {item.scientificName ?? "Nama ilmiah belum tersedia"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.conservationStatus ? (
            <StatusBadge
              label={TYPE_CONSERVATION_STATUS_LABELS[item.conservationStatus]}
              variant={CONSERVATION_VARIANTS[item.conservationStatus]}
            />
          ) : null}
          {item.deviceModel ? (
            <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-soft">
              {item.deviceModel}
            </span>
          ) : null}
        </div>

        <p className="mt-auto text-xs text-muted">
          {item.latestLocation
            ? `Lokasi terakhir ${formatDateTime(item.latestLocation.recordedAt)}`
            : "Belum ada lokasi GPS"}
        </p>
      </button>

      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
        <span className="truncate text-xs text-muted">{item.gender}</span>
        <Link
          href={`/animals/${item.animalId}/detail`}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
        >
          Lihat detail
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
