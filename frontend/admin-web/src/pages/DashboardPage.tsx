import { Link, useLocation } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { useRestaurantContext } from '../hooks/useRestaurantContext';

// DashboardPage restoran yönetiminin ilk admin ekranıdır.
export default function DashboardPage() {
  const location = useLocation();
  const { customerBaseUrl, restaurantId } = useRestaurantContext();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-stone-950">Dashboard</h2>
        <p className="text-sm leading-6 text-stone-600">
          Restoran menüsü, masalar ve sipariş özetleri buradan yönetilecek.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Aktif Ürün" value="0" />
        <StatCard label="Bugünkü Sipariş" value="0" />
        <StatCard label="Açık Masa" value="0" />
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <h3 className="text-base font-semibold text-stone-950">Hızlı İşlemler</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            to={{ pathname: '/products', search: location.search }}
            className="rounded-full bg-stone-950 px-4 py-3 text-sm font-medium text-white"
          >
            Ürün Ekle
          </Link>
          <Link
            to={{ pathname: '/tables', search: location.search }}
            className="rounded-full border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
          >
            Masa Yönet
          </Link>
          <Link
            to={{ pathname: '/categories', search: location.search }}
            className="rounded-full border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
          >
            Kategori Yönet
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <h3 className="text-base font-semibold text-stone-950">Müşteri Menü URL</h3>
        <p className="mt-3 break-all text-sm leading-6 text-stone-600">
          {customerBaseUrl.replace(/\/$/, '')}/menu?restaurantId={restaurantId}
        </p>
      </section>
    </div>
  );
}
