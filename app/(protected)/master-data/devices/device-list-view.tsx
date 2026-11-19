
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { DataFilters } from "@/components/ui/data-filters";
import { ErrorState } from "@/components/ui/error-state";
import { DeviceForm } from "@/components/devices/device-form";

import { getDeviceColumns } from "@/app/(protected)/master-data/devices/columns";

import {
  ACTIVE_OPTIONS,
  CONDITION_OPTIONS,
  DEFAULT_DEVICE_FILTERS,
} from "@/app/(protected)/master-data/devices/filter";

import {
  useTrackingDevices,
  useTrackingDeviceDelete,
} from "@/hooks/tracking-device.hook";

import { useToast } from "@/components/providers/toast-provider";
import { toApiErrorState } from "@/services/api-client";

import type { TrackingDevice } from "@/types/tracking-device.type";

export function DeviceListView() {
  const router = useRouter();
  const { showToast } = useToast();

  const [filters, setFilters] = useState(DEFAULT_DEVICE_FILTERS);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [selectedDevice, setSelectedDevice] =
    useState<TrackingDevice | null>(null);

  const [selectedDeleteDevice, setSelectedDeleteDevice] =
    useState<TrackingDevice | null>(null);

  const query = useTrackingDevices();

  const deleteMutation = useTrackingDeviceDelete(
    selectedDeleteDevice?.device_id ?? 0,
  );

  const devices = query.data?.data ?? [];

  // Membuka form tambah perangkat
  const handleCreate = useCallback(() => {
    setSelectedDevice(null);
    setIsFormOpen(true);
  }, []);

  // Membuka form edit perangkat
  const handleEdit = useCallback((device: TrackingDevice) => {
    setSelectedDevice(device);
    setIsFormOpen(true);
  }, []);

  // Menutup form
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedDevice(null);
  }, []);

  // Membuka dialog konfirmasi hapus
  const handleDelete = useCallback((device: TrackingDevice) => {
    setSelectedDeleteDevice(device);
  }, []);

  // Menghapus perangkat
  const handleConfirmDelete = async () => {
    if (!selectedDeleteDevice) return;

    try {
      await deleteMutation.mutateAsync();

      showToast("Perangkat berhasil dihapus.", "success");
      setSelectedDeleteDevice(null);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Gagal menghapus perangkat.",
        "error",
      );
    }
  };

  // Kolom tabel
  const columns = useMemo(
    () =>
      getDeviceColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete],
  );

  // Filter perangkat
  const visibleDevices = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return devices.filter((device) => {
      const matchesSearch =
        search.length === 0 ||
        device.model.toLowerCase().includes(search) ||
        (device.animal?.animal_code ?? "")
          .toLowerCase()
          .includes(search) ||
        String(device.device_id).includes(search);

      const matchesCondition =
        !filters.device_condition ||
        filters.device_condition === "all" ||
        device.device_condition === filters.device_condition;

      const matchesActive =
        !filters.only_active ||
        filters.only_active === "all" ||
        (filters.only_active === "active" &&
          Boolean(device.is_active)) ||
        (filters.only_active === "inactive" &&
          !Boolean(device.is_active));

      return (
        matchesSearch &&
        matchesCondition &&
        matchesActive
      );
    });
  }, [devices, filters]);

  // Statistik perangkat
  const totalDevices = devices.length;

  const activeDevices = devices.filter(
    (device) => Boolean(device.is_active),
  ).length;

  const lowBatteryDevices = devices.filter(
    (device) =>
      device.battery_level !== null &&
      device.battery_level < 20,
  ).length;

  // Loading
  if (query.isPending) {
    return (
      <DataTable
        data={[]}
        columns={columns}
        loading
        label="daftar perangkat"
      />
    );
  }

  // Error
  if (query.isError) {
    const error = toApiErrorState(query.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header halaman */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">
          Perangkat Pelacak
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Pantau perangkat GPS, kondisi perangkat, dan level baterai satwa.
        </p>
      </div>

      {/* Statistik perangkat */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">
            Total Perangkat
          </p>

          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {totalDevices}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">
            Perangkat Aktif
          </p>

          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {activeDevices}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Baterai di Bawah 20%
          </p>

          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {lowBatteryDevices}
          </p>
        </div>

      </div>

      {/* Filter perangkat */}
      <DataFilters
        fields={[
          {
            key: "search",
            kind: "search",
            label: "Cari",
            placeholder: "Model, ID, atau kode satwa",
          },
          {
            key: "device_condition",
            kind: "select",
            label: "Kondisi",
            options: CONDITION_OPTIONS,
          },
          {
            key: "only_active",
            kind: "select",
            label: "Aktif",
            options: ACTIVE_OPTIONS,
          },
        ]}
        values={filters}
        onFilterChange={(values) =>
          setFilters({
            ...DEFAULT_DEVICE_FILTERS,
            ...values,
          })
        }
        onReset={() => setFilters(DEFAULT_DEVICE_FILTERS)}
      />

      {/* Tombol tambah - hanya satu, tepat di atas tabel */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#286747] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#174C35]"
        >
          <Plus className="h-4 w-4" />
          Tambah Perangkat
        </button>
      </div>

      {/* Tabel perangkat */}
      <DataTable
        data={visibleDevices}
        columns={columns}
        loading={query.isFetching}
        onRowClick={(row: TrackingDevice) =>
          router.push(
            `/master-data/devices/${row.device_id}/detail`,
          )
        }
        getRowId={(row) => String(row.device_id)}
        label="daftar perangkat"
        emptyTitle="Belum ada perangkat"
        emptyDescription="Tidak ada perangkat yang cocok dengan filter saat ini."
      />

      {/* Modal tambah dan edit perangkat */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-zinc-900">
                {selectedDevice
                  ? "Edit Perangkat"
                  : "Tambah Perangkat"}
              </h3>

              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Tutup form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <DeviceForm
                device={selectedDevice}
                onSuccess={handleCloseForm}
                onCancel={handleCloseForm}
              />
            </div>

          </div>
        </div>
      )}

      {/* Dialog konfirmasi hapus */}
      {selectedDeleteDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h3 className="text-lg font-semibold text-zinc-900">
              Hapus Perangkat?
            </h3>

            <p className="mt-2 text-sm text-zinc-600">
              Apakah kamu yakin ingin menghapus perangkat{" "}
              <span className="font-semibold text-zinc-900">
                {selectedDeleteDevice.model}
              </span>{" "}
              (ID: {selectedDeleteDevice.device_id})?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setSelectedDeleteDevice(null)}
                disabled={deleteMutation.isPending}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteMutation.isPending
                  ? "Menghapus..."
                  : "Ya, Hapus"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
