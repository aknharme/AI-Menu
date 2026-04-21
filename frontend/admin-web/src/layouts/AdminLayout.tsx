import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.15),_transparent_30%),linear-gradient(180deg,_#fffaf5_0%,_#f5f5f4_100%)]">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Restoran Yonetimi
            </p>
            <h1 className="text-lg font-semibold text-stone-950">Admin Paneli</h1>
          </div>
          <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700">
            Catalog
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
