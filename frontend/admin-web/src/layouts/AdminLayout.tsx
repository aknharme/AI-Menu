import { NavLink, Outlet, useSearchParams } from 'react-router-dom';

export default function AdminLayout() {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  const withRestaurantId = (path: string) =>
    restaurantId ? `${path}?restaurantId=${restaurantId}` : path;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.15),_transparent_30%),linear-gradient(180deg,_#fffaf5_0%,_#f5f5f4_100%)]">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                Restoran Yonetimi
              </p>
              <h1 className="text-lg font-semibold text-stone-950">Admin Paneli</h1>
            </div>

            <nav className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 p-1">
              <NavLink
                to={withRestaurantId('/')}
                end
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-stone-950 text-white' : 'text-stone-600'
                  }`
                }
              >
                Katalog
              </NavLink>
              <NavLink
                to={withRestaurantId('/tables')}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-stone-950 text-white' : 'text-stone-600'
                  }`
                }
              >
                Masalar
              </NavLink>
            </nav>
          </div>
          <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700">
            Restaurant Ops
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
