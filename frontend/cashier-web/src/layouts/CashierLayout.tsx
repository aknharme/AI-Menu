import { Outlet, useNavigate } from 'react-router-dom';
import { clearAuthSession, getStoredUser } from '../services/authStorage';

export default function CashierLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();

  function handleLogout() {
    clearAuthSession();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.15),_transparent_30%),linear-gradient(180deg,_#fffaf5_0%,_#f5f5f4_100%)]">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Siparis Takibi
            </p>
            <h1 className="text-lg font-semibold text-stone-950">Kasiyer Paneli</h1>
            <p className="mt-1 text-sm text-stone-500">{user?.fullName ?? 'Bilinmeyen Kullanici'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700">
              {user?.role ?? 'Rol Yok'}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Cikis Yap
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
