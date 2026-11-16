
export default function WildlifeExplorerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Wildlife Explorer
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Jelajahi informasi satwa, model 3D, dan lokasi persebarannya.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-zinc-800">
          Selamat Datang di Wildlife Explorer
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Daftar satwa, model 3D, dan mini map akan ditampilkan di sini.
        </p>
      </div>
    </div>
  );
}
