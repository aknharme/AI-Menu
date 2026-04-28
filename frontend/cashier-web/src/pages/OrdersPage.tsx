import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import OrderCard from '../components/OrderCard';
import OrderDetailDrawer from '../components/OrderDetailDrawer';
import { useCashierOrders } from '../hooks/useCashierOrders';
import { useRestaurantId } from '../hooks/useRestaurantId';

export default function OrdersPage() {
  const restaurantId = useRestaurantId();
  const {
    orders,
    selectedOrderId,
    setSelectedOrderId,
    selectedOrder,
    loading,
    error,
    detailLoading,
    detailError,
  } = useCashierOrders({ restaurantId });
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === 'Pending').length,
    [orders],
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[linear-gradient(135deg,_#1c1917_0%,_#334155_55%,_#f97316_180%)] p-6 text-white shadow-lg shadow-stone-950/10">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200/90">
              Cashier Web
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Siparis Akisi</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-200">
              Musteriden gelen siparisleri restoran bazli takip et, bekleyenleri once gor ve detaylarini hizlica ac.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Restoran</p>
            <p className="mt-2 break-all text-sm font-semibold">{restaurantId || 'Belirtilmedi'}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Bekleyen</p>
            <p className="mt-2 text-3xl font-semibold">{pendingCount}</p>
          </div>
        </div>
      </section>

      {loading ? (
        <LoadingState count={5} />
      ) : error ? (
        <EmptyState title="Siparisler yuklenemedi" description={error} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Henuz siparis yok"
          description="Customer tarafindan yeni siparis geldiginde bu ekranda restoran bazli listelenecek."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <section className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                isActive={order.orderId === selectedOrderId}
                onSelect={(orderId) => {
                  setSelectedOrderId(orderId);
                  setMobileDetailOpen(true);
                }}
              />
            ))}
          </section>

          <section className="hidden lg:block">
            <OrderDetailDrawer
              order={selectedOrder}
              isLoading={detailLoading}
              error={detailError}
              isOpen
              onClose={() => {}}
            />
          </section>
        </div>
      )}

      <div className="lg:hidden">
        <OrderDetailDrawer
          order={selectedOrder}
          isLoading={detailLoading}
          error={detailError}
          isOpen={mobileDetailOpen}
          onClose={() => setMobileDetailOpen(false)}
        />
      </div>
    </div>
  );
}
