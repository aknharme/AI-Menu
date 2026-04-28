import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useRestaurantContext } from '../hooks/useRestaurantContext';
import { clearAuthSession, getStoredUser } from '../services/authStorage';

// AdminLayout panel ekranlarında ortak header ve içerik genişliğini sağlar.
export default function AdminLayout() {
  const navigate = useNavigate();
  const { restaurantId } = useRestaurantContext();
  const user = getStoredUser();
  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Kategoriler', path: '/categories' },
    { label: 'Ürünler', path: '/products' },
    { label: 'Masalar', path: '/tables' },
  ];

  function handleLogout() {
    clearAuthSession();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fffdf8_0%,_#f5f5f4_100%)]">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Restoran Yönetimi
            </p>
            <h1 className="text-lg font-semibold text-stone-950">Admin Panel</h1>
            <p className="mt-1 text-sm text-stone-500">{user?.fullName ?? 'Bilinmeyen Kullanici'}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600">
              restaurantId: {restaurantId}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Cikis Yap
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-stone-950 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Dashboard ve ileride eklenecek admin sayfaları burada gösterilir. */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
