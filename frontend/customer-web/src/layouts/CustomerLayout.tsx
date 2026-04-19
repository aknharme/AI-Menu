import { Outlet } from 'react-router-dom';

// CustomerLayout müşteri tarafındaki ortak header ve sayfa genişliğini sağlar.
export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              QR Menü
            </p>
            <h1 className="text-lg font-semibold text-gray-900">Menü</h1>
          </div>
          <span className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-700">
            Masa
          </span>
        </div>
      </header>

      {/* Alt route'ların sayfa içerikleri burada render edilir. */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
