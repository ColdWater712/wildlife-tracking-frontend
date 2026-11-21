import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime } from "@/utils/format";
import { TYPE_CONSERVATION_STATUS_LABELS } from "@/types/species.type";
import type { WildlifeCatalogItem } from "@/types/wildlife-explorer.type";

type WildlifeDetailPanelProps = {
  selected: WildlifeCatalogItem | null;
};

export function WildlifeDetailPanel({ selected }: WildlifeDetailPanelProps) {
  return (
    <Panel>
      <SectionHeader
        title="Informasi Satwa Terpilih"
        description="Detail satwa yang tersedia dari backend."
      />

      {selected === null ? (
        <EmptyState
          title="Pilih satwa untuk melihat detail"
          description="Klik kartu satwa di katalog atau marker pada peta persebaran."
        />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight text-ink">
                {selected.animalCode}
              </p>
              <p className="truncate text-sm text-ink-soft">
                {selected.speciesName}
              </p>
            </div>
            <StatusBadge
              label={selected.monitoringStatus}
              variant={selected.monitoringStatus === "Aktif" ? "success" : "neutral"}
            />
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Nama Ilmiah" value={selected.scientificName} />
            <DetailField
              label="Status Konservasi"
              value={
                selected.conservationStatus
                  ? TYPE_CONSERVATION_STATUS_LABELS[selected.conservationStatus]
                  : null
              }
            />
            <DetailField label="Jenis Kelamin" value={selected.gender} />
            <DetailField
              label="Tanggal Lahir"
              value={selected.birthDate ? formatDate(selected.birthDate) : null}
            />
            <DetailField label="Perangkat Pemantau" value={selected.deviceModel} />
            <DetailField
              label="Koordinat Terakhir"
              value={
                selected.latestLocation
                  ? `${selected.latestLocation.latitude.toFixed(5)}, ${selected.latestLocation.longitude.toFixed(5)}`
                  : null
              }
            />
            <DetailField
              label="Waktu Tercatat"
              value={
                selected.latestLocation
                  ? formatDateTime(selected.latestLocation.recordedAt)
                  : null
              }
            />
            <DetailField
              label="ID Perangkat"
              value={
                selected.latestLocation
                  ? String(selected.latestLocation.deviceId)
                  : null
              }
            />
          </dl>

          <Link
            href={`/animals/${selected.animalId}/detail`}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Buka halaman detail satwa
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      )}
    </Panel>
  );
}

type DetailFieldProps = {
  label: string;
  value: string | null;
};

function DetailField({ label, value }: DetailFieldProps) {
  if (!value) return null;

  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-ink">{value}</dd>
    </div>
  );
}
