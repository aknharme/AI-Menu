import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { useRestaurantContext } from '../hooks/useRestaurantContext';
import { getDashboard, getRecentOrders, getRecommendationStats, getTopProducts } from '../services/adminService';
import type { DashboardSummary, RecentOrder, RecommendationStat, TopProduct } from '../types/admin';

// DashboardPage restoran yönetiminin ilk admin ekranıdır.
export default function DashboardPage() {
  const { customerBaseUrl, restaurantId } = useRestaurantContext();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationStat[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const [summaryResponse, topProductsResponse, recommendationResponse, recentOrdersResponse] =
          await Promise.all([
            getDashboard(restaurantId),
            getTopProducts(restaurantId),
            getRecommendationStats(restaurantId),
            getRecentOrders(restaurantId),
          ]);

        if (!isMounted) {
          return;
        }

        setSummary(summaryResponse);
        setTopProducts(topProductsResponse);
        setRecommendations(recommendationResponse);
        setRecentOrders(recentOrdersResponse);
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
  }, [restaurantId]);

  const hasAnyListData =
    topProducts.length > 0 || recommendations.length > 0 || recentOrders.length > 0;

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
          Restoran menüsü, masalar ve sipariş özetleri buradan yönetilecek.
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
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Toplam Sipariş"
            value={String(summary?.totalOrderCount ?? 0)}
            hint="Tum zamanlar"
          />
          <StatCard
            label="Bekleyen Sipariş"
            value={String(summary?.pendingOrderCount ?? 0)}
            hint="Anlik durum"
          />
          <StatCard
            label="Günün Popüleri"
            value={summary?.popularProducts[0]?.name ?? 'Veri Yok'}
            hint={summary?.popularProducts[0] ? `${summary.popularProducts[0].count} adet` : 'Fallback'}
          />
        </section>
      )}

      {!loading && !error ? (
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5 lg:col-span-1">
            <h3 className="text-base font-semibold text-stone-950">En Çok Satanlar</h3>
            <div className="mt-4 space-y-3">
              {topProducts.length === 0 ? (
                <p className="rounded-2xl bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  Henuz siparis verisi yok.
                </p>
              ) : (
                topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {index + 1}. {product.name}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-stone-700">{product.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5 lg:col-span-1">
            <h3 className="text-base font-semibold text-stone-950">En Çok Önerilenler</h3>
            <div className="mt-4 space-y-3">
              {recommendations.length === 0 ? (
                <p className="rounded-2xl bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  Henuz recommendation verisi yok.
                </p>
              ) : (
                recommendations.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {index + 1}. {product.name}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-stone-700">
                      {product.recommendationCount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

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
        </section>
      ) : null}

      {!loading && !error && !hasAnyListData ? (
        <section className="rounded-[28px] border border-stone-200 bg-white p-6 text-sm text-stone-500 shadow-sm shadow-stone-950/5">
          Dashboard için henuz yeterli hareket verisi yok. Ilk siparisler ve recommendation kayitlari geldikce bu alan otomatik dolacak.
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
