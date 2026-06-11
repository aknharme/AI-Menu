import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import CartButton from '../components/CartButton';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../contexts/CartContext';
import { useQueryParams } from '../hooks/useQueryParams';
import { getActiveOrderStorageEventName, getStoredActiveOrder } from '../utils/activeOrderStorage';
import { formatPrice } from '../utils/formatPrice';
import type { OrderResponse } from '../types/order';

type ActiveOrderSummary = Pick<OrderResponse, 'orderId' | 'status' | 'totalAmount'>;

const statusLabels: Record<string, string> = {
  Pending: 'Bekliyor',
  Preparing: 'Hazırlanıyor',
  Ready: 'Hazır',
  Paid: 'Teslim edildi',
  Cancelled: 'İptal edildi',
};

function formatOrderNumber(orderId: string) {
  return `#${orderId.slice(0, 8).toLocaleUpperCase('tr-TR')}`;
}

function isClosedStatus(status: string) {
  return status === 'Paid' || status === 'Cancelled' || status === 'Refunded';
}

export default function CustomerLayout() {
  const { restaurantId, tableId } = useQueryParams();
  const { itemCount, totalPrice } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<ActiveOrderSummary | null>(null);
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);

  useEffect(() => {
    function syncActiveOrder() {
      const storedOrder = getStoredActiveOrder(restaurantId, tableId);

      if (!storedOrder || isClosedStatus(storedOrder.status)) {
        setActiveOrder(null);
        setIsOrderStatusOpen(false);
        return;
      }

      setActiveOrder({
        orderId: storedOrder.orderId,
        status: storedOrder.status,
        totalAmount: storedOrder.totalAmount,
      });
    }

    syncActiveOrder();
    window.addEventListener('storage', syncActiveOrder);
    window.addEventListener(getActiveOrderStorageEventName(), syncActiveOrder);

    return () => {
      window.removeEventListener('storage', syncActiveOrder);
      window.removeEventListener(getActiveOrderStorageEventName(), syncActiveOrder);
    };
  }, [restaurantId, tableId]);

  const cartLabel = itemCount > 0 ? `${itemCount} ürün` : 'Sepet boş';

  return (
    <div className="min-h-screen bg-white text-[#14351f]">
      <main className="mx-auto min-h-screen w-full max-w-md bg-[#f4ead4] shadow-2xl shadow-black/35">
        <Outlet />
      </main>

      {activeOrder && itemCount === 0 ? (
        <button
          type="button"
          onClick={() => setIsOrderStatusOpen(true)}
          className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-[max(1rem,calc((100vw-28rem)/2+1rem))] z-30 rounded-full border border-[#d8b95f] bg-[#14351f] px-4 py-3 text-left text-xs font-semibold text-[#f8efd9] shadow-lg shadow-black/30 active:scale-[0.98]"
        >
          <span className="block text-[10px] uppercase text-[#d8b95f]">Sipariş</span>
          <span className="block">{statusLabels[activeOrder.status] ?? activeOrder.status}</span>
        </button>
      ) : null}

      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[max(1rem,calc((100vw-28rem)/2+1rem))] z-30 w-[176px]">
        <CartButton
          itemCount={itemCount}
          totalPriceLabel={formatPrice(totalPrice)}
          summary={cartLabel}
          onClick={() => setIsCartOpen(true)}
        />
      </div>

      {activeOrder && isOrderStatusOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1d10]/70 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-[28px] bg-[#fff8e9] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[#b3903f]">Aktif Sipariş</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#14351f]">
                  {formatOrderNumber(activeOrder.orderId)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOrderStatusOpen(false)}
                className="rounded-full border border-[#d8c998] px-3 py-2 text-sm font-semibold text-[#38543f]"
              >
                Kapat
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f4ead4] p-4">
                <p className="text-xs font-semibold uppercase text-[#b3903f]">Durum</p>
                <p className="mt-1 font-semibold text-[#14351f]">
                  {statusLabels[activeOrder.status] ?? activeOrder.status}
                </p>
              </div>
              <div className="rounded-2xl bg-[#e7f0df] p-4">
                <p className="text-xs font-semibold uppercase text-[#52624a]">Toplam</p>
                <p className="mt-1 font-semibold text-[#14351f]">
                  {formatPrice(activeOrder.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <CartDrawer
        isOpen={isCartOpen}
        restaurantId={restaurantId}
        tableId={tableId}
        onOrderCreated={(order) => setActiveOrder(order)}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
