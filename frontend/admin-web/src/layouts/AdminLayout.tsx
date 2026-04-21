import { Outlet } from 'react-router-dom';

// AdminLayout panel ekranlarında ortak header ve içerik genişliğini sağlar.
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Restoran Yönetimi
            </p>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
          <button className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
            Çıkış
          </button>
        </div>
      </header>

      {/* Dashboard ve ileride eklenecek admin sayfaları burada gösterilir. */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
