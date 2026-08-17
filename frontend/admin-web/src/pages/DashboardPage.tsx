import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { useRestaurantContext } from '../hooks/useRestaurantContext';
import {
  getAdminOrders,
  getDashboard,
  getRecentOrders,
  getTopProducts,
} from '../services/adminService';
import type {
  AdminOrderListItem,
  DashboardSummary,
  RecentOrder,
  TopProduct,
} from '../types/admin';

function getTodayValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// DashboardPage restoran yönetiminin ilk admin ekranıdır.
export default function DashboardPage() {
  const { customerBaseUrl, restaurantId } = useRestaurantContext();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [liveOrders, setLiveOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = getTodayValue();

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const [
          summaryResponse,
          topProductsResponse,
          recentOrdersResponse,
          liveOrdersResponse,
        ] =
          await Promise.all([
            getDashboard(restaurantId, today),
            getTopProducts(restaurantId, today),
            getRecentOrders(restaurantId, today),
            getAdminOrders(restaurantId),
          ]);

        if (!isMounted) {
          return;
        }

        setSummary(summaryResponse);
        setTopProducts(topProductsResponse);
        setRecentOrders(recentOrdersResponse);
        setLiveOrders(liveOrdersResponse);
      } catch {
        if (!isMounted) {
          return;
        }

        setError('Dashboard verileri yuklenemedi. Lutfen tekrar deneyin.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [restaurantId, today]);

  const hasAnyListData =
    topProducts.length > 0 || recentOrders.length > 0;
  const pendingCount = liveOrders.filter((order) => order.status === 'Pending').length;
  const liveCount = liveOrders.filter((order) =>
    ['Pending', 'Preparing', 'Ready'].includes(order.status),
  ).length;

  function formatPrice(value: number) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatTime(value: string) {
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-stone-950">Dashboard</h2>
        <p className="text-sm leading-6 text-stone-600">
          Bugünün gerçekleşen cirosunu, siparişlerini ve en çok satılan ürünlerini takip edin.
        </p>
      </section>

      {loading ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[24px] border border-stone-200 bg-stone-100"
            />
          ))}
        </section>
      ) : error ? (
        <section className="rounded-[28px] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Günlük Ciro"
            value={formatPrice(summary?.revenue ?? 0)}
            hint={`${summary?.paidOrderCount ?? 0} tamamlanan sipariş`}
          />
          <StatCard
            label="Bugünkü Sipariş"
            value={String(summary?.totalOrderCount ?? 0)}
            hint={`${liveCount} aktif sipariş`}
          />
          <StatCard
            label="Bekleyen Sipariş"
            value={String(liveOrders.length > 0 ? pendingCount : (summary?.pendingOrderCount ?? 0))}
            hint={`Anlik durum | ${liveCount} aktif siparis`}
          />
          <StatCard
            label="Ortalama Sepet"
            value={formatPrice(summary?.averagePaidOrderValue ?? 0)}
            hint="Tamamlanan sipariş ortalaması"
          />
          <StatCard
            label="Açık Sipariş Tutarı"
            value={formatPrice(summary?.activeOrderValue ?? 0)}
            hint={`${liveCount} sipariş hâlâ akışta`}
          />
        </section>
      )}

      {!loading && !error ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5 lg:col-span-1">
            <h3 className="text-base font-semibold text-stone-950">Son Siparişler</h3>
            <div className="mt-4 space-y-3">
              {recentOrders.length === 0 ? (
                <p className="rounded-2xl bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  Henuz siparis olusmadi.
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-stone-900">{order.tableName}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600">
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm text-stone-500">
                      <span>{formatPrice(order.totalAmount)}</span>
                      <span>{formatTime(order.createdAtUtc)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-stone-950">En Çok Satılanlar</h3>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Bugün
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {topProducts.length === 0 ? (
                <p className="rounded-2xl bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  Bugün tamamlanmış ürün satışı bulunmuyor.
                </p>
              ) : (
                topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-stone-950 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-900">{product.name}</p>
                        <p className="text-xs text-stone-500">{product.count} adet satıldı</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-stone-900">
                      {formatPrice(product.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      ) : null}

      {!loading && !error && !hasAnyListData ? (
        <section className="rounded-[28px] border border-stone-200 bg-white p-6 text-sm text-stone-500 shadow-sm shadow-stone-950/5">
          Dashboard için henuz yeterli hareket verisi yok. Ilk siparisler geldikce bu alan otomatik dolacak.
        </section>
      ) : null}

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <h3 className="text-base font-semibold text-stone-950">Hızlı İşlemler</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/products"
            className="rounded-full bg-stone-950 px-4 py-3 text-sm font-medium text-white"
          >
            Ürün Ekle
          </Link>
          <Link
            to="/orders"
            className="rounded-full border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
          >
            Sipariş Yönet
          </Link>
          <Link
            to="/tables"
            className="rounded-full border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
          >
            Masa Yönet
          </Link>
          <Link
            to="/categories"
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
