import { Outlet } from 'react-router-dom';

// CashierLayout sipariş takip ekranları için ortak header ve panel alanını sağlar.
export default function CashierLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Sipariş Takibi
            </p>
            <h1 className="text-lg font-semibold text-gray-900">Kasiyer Panel</h1>
          </div>
          <span className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-700">
            Canlı
          </span>
        </div>
      </header>

      {/* Kasiyer route içerikleri burada render edilir. */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
