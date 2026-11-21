
"use client";

import {
  PawPrint,
  Leaf,
  RadioTower,
  AlertTriangle,
  MapPin,
} from "lucide-react";

import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { useAnimals } from "@/hooks/use-animals";
import { useSpecies } from "@/hooks/use-species";
import { useTrackingDevices } from "@/hooks/use-devices";
import { useIncidentReports } from "@/hooks/use-incidents";

import type { IncidentReport } from "@/types/incident.type";

const SPECIES_COLORS = [
  "bg-emerald-600",
  "bg-amber-500",
  "bg-blue-600",
  "bg-violet-600",
  "bg-rose-500",
];

const formatIncidentTimestamp = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getSyncStatus = (status: IncidentReport["sync_status"]) => {
  switch (status) {
    case "synced":
      return {
        label: "Tersinkronisasi",
        color: "bg-emerald-100 text-emerald-700",
      };

    case "pending_sync":
      return {
        label: "Menunggu sinkronisasi",
        color: "bg-amber-100 text-amber-700",
      };

    case "failed":
      return {
        label: "Sinkronisasi gagal",
        color: "bg-red-100 text-red-700",
      };
  }
};

export function StatisticsView() {
  const animalsQuery = useAnimals({
    page: 1,
    per_page: 100,
  });

  const speciesQuery = useSpecies({
    page: 1,
    per_page: 100,
  });

  const devicesQuery = useTrackingDevices();

  const incidentsQuery = useIncidentReports();

  const isLoading =
    animalsQuery.isLoading ||
    speciesQuery.isLoading ||
    devicesQuery.isLoading ||
    incidentsQuery.isLoading;

  const isError =
    animalsQuery.isError ||
    speciesQuery.isError ||
    devicesQuery.isError ||
    incidentsQuery.isError;

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
          <p className="text-sm text-muted">
            Memuat data statistik...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">
              Gagal memuat data statistik
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Periksa koneksi ke backend dan coba muat ulang data.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void Promise.all([
              animalsQuery.refetch(),
              speciesQuery.refetch(),
              devicesQuery.refetch(),
              incidentsQuery.refetch(),
            ]);
          }}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const animals = animalsQuery.data?.data?.items ?? [];
  const species = speciesQuery.data?.data?.items ?? [];
  const devices = devicesQuery.data?.data ?? [];
  const incidents = incidentsQuery.data?.data ?? [];

  const totalAnimals = animals.length;
  const totalSpecies = species.length;

  const activeDevices = devices.filter(
    (device) =>
      device.is_active === true || device.is_active === 1,
  ).length;

  const totalIncidents = incidents.length;

  const speciesData = species.map((item, index) => {
    const animalCount = animals.filter(
      (animal) => animal.species_id === item.species_id,
    ).length;

    return {
      id: item.species_id,
      name: item.common_name,
      count: animalCount,
      color: SPECIES_COLORS[index % SPECIES_COLORS.length],
    };
  });

  const recentIncidents = [...incidents]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime(),
    )
    .slice(0, 5);

  const statistics = [
    {
      title: "Total Satwa Terpantau",
      value: totalAnimals,
      description: "Satwa dalam pemantauan",
      icon: PawPrint,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Jumlah Spesies",
      value: totalSpecies,
      description: "Spesies yang terdata",
      icon: Leaf,
      color: "bg-lime-100 text-lime-700",
    },
    {
      title: "Perangkat Aktif",
      value: activeDevices,
      description: "Perangkat GPS aktif",
      icon: RadioTower,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Laporan Insiden",
      value: totalIncidents,
      description: "Laporan tercatat",
      icon: AlertTriangle,
      color: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Analitik"
        title="Statistik Kawasan"
        description="Ringkasan data pemantauan satwa liar Taman Nasional Gunung Leuser."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <StatCard
              key={item.title}
              label={item.title}
              value={item.value.toLocaleString("id-ID")}
              hint={item.description}
              icon={<Icon className="size-5" />}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="ui-panel p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-ink">
              Sebaran Satwa per Spesies
            </h3>

            <p className="mt-1 text-sm text-muted">
              Ringkasan satwa berdasarkan spesies.
            </p>
          </div>

          <div className="mb-6 flex items-end justify-between rounded-xl bg-emerald-50 p-4">
            <div>
              <p className="text-sm text-emerald-800">
                Total satwa terdaftar
              </p>

              <p className="mt-1 text-3xl font-bold text-emerald-950">
                {totalAnimals.toLocaleString("id-ID")}
              </p>
            </div>

            <PawPrint className="size-10 text-emerald-700" />
          </div>

          {speciesData.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Belum ada data spesies.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {speciesData.map((item) => {
                const percentage =
                  totalAnimals > 0
                    ? (item.count / totalAnimals) * 100
                    : 0;

                return (
                  <div key={item.id}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="font-medium text-ink-soft">
                        {item.name}
                      </span>

                      <span className="font-bold text-ink">
                        {item.count.toLocaleString("id-ID")} satwa
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="ui-panel p-6">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-ink">
              Ringkasan Insiden
            </h3>

            <p className="mt-1 text-sm text-muted">
              Lima laporan insiden terbaru dari backend.
            </p>
          </div>

          {recentIncidents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Belum ada laporan insiden.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-zinc-100">
              {recentIncidents.map((incident) => {
                const syncStatus = getSyncStatus(
                  incident.sync_status,
                );

                return (
                  <div
                    key={incident.report_id}
                    className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink-soft">
                      <MapPin className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink">
                        {incident.incident_type}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {incident.location}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {formatIncidentTimestamp(incident.timestamp)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${syncStatus.color}`}
                    >
                      {syncStatus.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary-soft p-4">
        <Leaf className="mt-0.5 size-5 shrink-0 text-primary" />

        <div>
          <p className="text-sm font-semibold text-emerald-950">
            Informasi pemantauan
          </p>

          <p className="mt-1 text-sm text-emerald-800">
            Statistik dan laporan ditampilkan berdasarkan data yang
            diterima dari backend sistem pemantauan satwa liar.
          </p>
        </div>
      </div>
    </div>
  );
}
