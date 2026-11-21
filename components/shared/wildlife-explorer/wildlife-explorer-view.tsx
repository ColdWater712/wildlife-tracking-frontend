import { Compass } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui/panel";

export function WildlifeExplorerView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Eksplorasi"
        title="Wildlife Explorer"
        description="Jelajahi informasi satwa, model 3D, dan lokasi persebarannya."
      />

      <Panel className="flex flex-col items-center justify-center border-dashed px-6 py-16 text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Compass aria-hidden="true" className="size-7" />
        </span>
        <h2 className="text-lg font-bold text-ink">
          Selamat Datang di Wildlife Explorer
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
          Daftar satwa, model 3D, dan mini map akan ditampilkan di sini.
        </p>
      </Panel>
    </div>
  );
}
