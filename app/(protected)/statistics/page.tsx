
"use client";

import {
  PawPrint,
  Leaf,
  RadioTower,
  AlertTriangle,
  MapPin,
  TrendingUp,
} from "lucide-react";

import { useAnimals } from "@/hooks/animal.hook";
import { useSpecies } from "@/hooks/species.hook";
import { useTrackingDevices } from "@/hooks/tracking-device.hook";
import { useIncidentReports } from "@/hooks/incident-report.hook";

import type { IncidentReport } from "@/types/incident-report";

const SPECIES_COLORS = [
  "bg-emerald-600",
  "bg-amber-500",
  "bg-blue-600",
  "bg-violet-600",
  "bg-rose-500",
];

const formatDate = (value: string) => {
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

export default function StatisticsPage() {
  // Mengambil data langsung dari API backend
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
          <p className="text-sm text-zinc-500">
            Memuat data statistik...
          </p>
        </div>
      </div>
    );
  }

  // Error state
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

  // Mengambil hasil API
  const animals = animalsQuery.data?.data?.items ?? [];
  const species = speciesQuery.data?.data?.items ?? [];
  const devices = devicesQuery.data?.data ?? [];
  const incidents = incidentsQuery.data?.data ?? [];

  // Menghitung statistik dari data aktual
  const totalAnimals = animals.length;
  const totalSpecies = species.length;

  const activeDevices = devices.filter(
    (device) =>
      device.is_active === true || device.is_active === 1,
  ).length;

  const totalIncidents = incidents.length;

  // Mengelompokkan satwa berdasarkan spesies
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

  // Mengurutkan laporan berdasarkan waktu terbaru
  const recentIncidents = [...incidents]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime(),
    )
    .slice(0, 5);

  // Data kartu statistik
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
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <TrendingUp className="size-6" />
          </div>

          <h2 className="text-2xl font-bold text-emerald-950">
            Statistik Kawasan
          </h2>
        </div>

        <p className="mt-2 text-sm text-zinc-600">
          Ringkasan data pemantauan satwa liar Taman Nasional Gunung Leuser.
        </p>
      </div>

      {/* Statistik utama */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    {item.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-zinc-900">
                    {item.value.toLocaleString("id-ID")}
                  </p>
                </div>

                <div
                  className={`flex size-12 items-center justify-center rounded-xl ${item.color}`}
                >
                  <Icon className="size-6" />
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-500">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sebaran satwa dan ringkasan insiden */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Sebaran satwa per spesies */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-zinc-900">
              Sebaran Satwa per Spesies
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
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
            <p className="py-6 text-center text-sm text-zinc-500">
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
                      <span className="font-medium text-zinc-700">
                        {item.name}
                      </span>

                      <span className="font-semibold text-zinc-900">
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

        {/* Ringkasan insiden */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-zinc-900">
              Ringkasan Insiden
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Lima laporan insiden terbaru dari backend.
            </p>
          </div>

          {recentIncidents.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">
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
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                      <MapPin className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900">
                        {incident.incident_type}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {incident.location}
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        {formatDate(incident.timestamp)}
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

      {/* Informasi pemantauan */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <Leaf className="mt-0.5 size-5 shrink-0 text-emerald-700" />

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
