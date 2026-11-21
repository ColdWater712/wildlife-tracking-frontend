import { Box } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { WildlifeCatalogItem } from "@/types/wildlife-explorer.type";

type Wildlife3DViewerProps = {
  selected: WildlifeCatalogItem | null;
};

export function Wildlife3DViewer({ selected }: Wildlife3DViewerProps) {
  return (
    <Panel>
      <SectionHeader
        title="Kenali Satwa dalam 3D"
        description="Ruang untuk eksplorasi model satwa interaktif."
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface-muted/60 p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Box aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">
              {selected?.animalCode ?? "Belum ada satwa dipilih"}
            </p>
            <p className="truncate text-xs text-muted">
              {selected?.speciesName ?? "Pilih satwa dari katalog atau peta"}
            </p>
          </div>
          {selected ? (
            <StatusBadge
              label={selected.monitoringStatus}
              variant={selected.monitoringStatus === "Aktif" ? "success" : "neutral"}
            />
          ) : null}
        </div>

        <EmptyState
          title="Model 3D belum tersedia"
          description="Belum ada aset model GLB atau GLTF yang terhubung dengan data satwa. Bagian ini siap digunakan ketika aset model tersedia."
        />
      </div>
    </Panel>
  );
}
