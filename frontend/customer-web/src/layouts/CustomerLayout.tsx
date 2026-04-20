import { Outlet } from 'react-router-dom';
import { useQueryParams } from '../hooks/useQueryParams';

export default function CustomerLayout() {
  const { tableId } = useQueryParams();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_30%),linear-gradient(180deg,_#fffdf8_0%,_#f5f5f4_100%)]">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              QR Menü
            </p>
            <h1 className="text-lg font-semibold text-stone-950">Menü</h1>
          </div>
          <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700">
            {tableId ? `Masa ${tableId}` : 'QR Sipariş'}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
