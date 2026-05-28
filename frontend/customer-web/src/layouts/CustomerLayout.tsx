import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import CartButton from '../components/CartButton';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../contexts/CartContext';
import { useQueryParams } from '../hooks/useQueryParams';
import { getOrder } from '../services/orderService';
import {
  clearActiveCustomerOrder,
  CUSTOMER_ACTIVE_ORDER_KEY,
  getActiveCustomerOrderId,
  getCustomerOrderStatusOverride,
  ORDER_STATUS_OVERRIDE_KEY,
} from '../services/customerOrderStateService';
import type { OrderResponse } from '../types/order';
import { formatPrice } from '../utils/formatPrice';
import {
  getActiveOrderStorageEventName,
  getStoredActiveOrder,
  type StoredActiveOrder,
} from '../utils/activeOrderStorage';

const customerStatusLabels: Record<string, string> = {
  Pending: 'Bekliyor',
  Preparing: 'Onaylandi',
  Ready: 'Hazirlaniyor',
  Paid: 'Teslim edildi',
  Cancelled: 'Iptal edildi',
};

const orderStatusLabels: Record<string, string> = {
  Pending: 'Bekliyor',
  Preparing: 'Hazırlanıyor',
  Ready: 'Teslim',
};

const orderButtonLabels: Record<string, string> = {
  Pending: 'BEKLENİYOR',
  Preparing: 'HAZIRLANIYOR',
  Ready: 'TESLİM',
};

function formatOrderNumber(orderId: string) {
  return `#${orderId.slice(0, 8)}`;
}

function formatOrderStatus(status: string) {
  return orderStatusLabels[status] ?? status;
}

function formatOrderButtonStatus(status: string) {
  return orderButtonLabels[status] ?? formatOrderStatus(status).toLocaleUpperCase('tr-TR');
}

function isClosedOrderStatus(status: string) {
  return status === 'Paid' || status === 'Cancelled' || status === 'Refunded';
}

export default function CustomerLayout() {
  const { restaurantId, tableId } = useQueryParams();
  const { itemCount, totalPrice } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderResponse | null>(null);
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);

  useEffect(() => {
    if (!restaurantId || !tableId) {
      setActiveOrder(null);
      setIsOrderStatusOpen(false);
  const [activeOrder, setActiveOrder] = useState<StoredActiveOrder | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const cartRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    isDragging: false,
    hasMoved: false,
    pointerId: 0,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const suppressClickRef = useRef(false);
  const [cartPosition, setCartPosition] = useState({ x: 0, y: 0 });

  const getCartBounds = useCallback(() => {
    const container = containerRef.current;
    const cart = cartRef.current;
    const containerRect = container?.getBoundingClientRect();
    const cartRect = cart?.getBoundingClientRect();
    const heroBoundary = container?.querySelector<HTMLElement>('[data-cart-drag-top="true"]');
    const heroBottom = heroBoundary?.getBoundingClientRect().top ?? 0;
    const padding = 12;
    const footerHeight = 28;
    const cartWidth = cartRect?.width ?? 175;
    const cartHeight = cartRect?.height ?? 48;

    return {
      minX: (containerRect?.left ?? 0) + padding,
      maxX: (containerRect?.right ?? window.innerWidth) - cartWidth - padding,
      minY: Math.max(heroBottom + padding, padding),
      maxY: window.innerHeight - footerHeight - cartHeight - padding,
    };
  }, []);

  const clampCartPosition = useCallback((position: { x: number; y: number }) => {
    const bounds = getCartBounds();
    const minX = Math.min(bounds.minX, bounds.maxX);
    const maxX = Math.max(bounds.minX, bounds.maxX);
    const minY = Math.min(bounds.minY, bounds.maxY);
    const maxY = Math.max(bounds.minY, bounds.maxY);

    return {
      x: Math.min(Math.max(position.x, minX), maxX),
      y: Math.min(Math.max(position.y, minY), maxY),
    };
  }, [getCartBounds]);

  const placeCartAtStart = useCallback(() => {
    const bounds = getCartBounds();
    setCartPosition(clampCartPosition({ x: bounds.maxX, y: bounds.maxY }));
  }, [clampCartPosition, getCartBounds]);

  useEffect(() => {
    placeCartAtStart();
    window.addEventListener('resize', placeCartAtStart);

    return () => {
      window.removeEventListener('resize', placeCartAtStart);
    };
  }, [placeCartAtStart]);

  useEffect(() => {
    function syncActiveOrder() {
      setActiveOrder(getStoredActiveOrder(restaurantId, tableId));
    }

    syncActiveOrder();
    window.addEventListener('storage', syncActiveOrder);
    window.addEventListener(getActiveOrderStorageEventName(), syncActiveOrder);

    return () => {
      window.removeEventListener('storage', syncActiveOrder);
      window.removeEventListener(getActiveOrderStorageEventName(), syncActiveOrder);
    };
  }, [restaurantId, tableId]);

  function handleCartPointerDown(event: PointerEvent<HTMLDivElement>) {
    const currentPosition = clampCartPosition(cartPosition);
    dragStateRef.current = {
      isDragging: true,
      hasMoved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: currentPosition.x,
      originY: currentPosition.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleCartPointerMove(event: PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging || dragState.pointerId !== event.pointerId) {
      return;
    }

    let isMounted = true;
    const currentRestaurantId = restaurantId;
    const currentTableId = tableId;

    async function syncActiveOrder() {
      const activeOrderId = getActiveCustomerOrderId(currentRestaurantId, currentTableId);

      if (!activeOrderId) {
        if (isMounted) {
          setActiveOrder(null);
          setIsOrderStatusOpen(false);
        }

        return;
      }

      try {
        const order = await getOrder(activeOrderId);
        const localStatus = getCustomerOrderStatusOverride(currentRestaurantId, activeOrderId);
        const nextOrder = localStatus ? { ...order, status: localStatus } : order;

        // Kapanan siparisler yeni musteriye durum olarak gosterilmez.
        if (isClosedOrderStatus(nextOrder.status)) {
          clearActiveCustomerOrder(currentRestaurantId, currentTableId);
          if (isMounted) {
            setActiveOrder(null);
            setIsOrderStatusOpen(false);
          }
          return;
        }

        if (isMounted) {
          setActiveOrder(nextOrder);
        }
      } catch {
        // Durum gecici okunamazsa son gorunen aktif siparis korunur.
      }
    }

    void syncActiveOrder();
    const syncTimer = window.setInterval(() => void syncActiveOrder(), 3000);
    setCartPosition(clampCartPosition({
      x: dragState.originX + deltaX,
      y: dragState.originY + deltaY,
    }));
  }

  function handleCartPointerUp(event: PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (dragState.pointerId === event.pointerId) {
      if (!dragState.hasMoved) {
        setIsCartOpen(true);
      }

      suppressClickRef.current = dragState.hasMoved;
      dragStateRef.current.isDragging = false;
    }
  }

    function handleStorageChange(event: StorageEvent) {
      if (event.key === CUSTOMER_ACTIVE_ORDER_KEY || event.key === ORDER_STATUS_OVERRIDE_KEY) {
        void syncActiveOrder();
      }
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.clearInterval(syncTimer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [restaurantId, tableId]);

  const hasActiveOrder = Boolean(activeOrder && itemCount === 0);
  const buttonLabel = hasActiveOrder ? 'Siparisim' : 'Sepet';
  const buttonSummary = hasActiveOrder
    ? customerStatusLabels[activeOrder?.status ?? ''] ?? activeOrder?.status ?? 'Takip et'
    : `${itemCount} ürün`;
  const buttonPriceLabel = hasActiveOrder
    ? formatPrice(activeOrder?.totalAmount ?? 0)
    : formatPrice(totalPrice);

  return (
    <div className="min-h-screen bg-stone-100">
      <main
        className="relative mx-auto min-h-screen max-w-md bg-white px-4 pb-0 pt-4 shadow-2xl shadow-stone-950/10"
      >
        <Outlet />

        {/* 29 Nisan 2026: Footer - ALİ ÇAĞRI EMİR KADİR yazısı eklendi */}
        <footer className="-mx-4 mt-4 h-7 border-t border-stone-200 bg-stone-200 flex items-center justify-center">
          <p className="text-black text-sm font-medium">ALİ ÇAĞRI EMİR KADİR</p>
        </footer>
      </main>

      {activeOrder ? (
        <div
          className="fixed z-20 w-[132px] max-w-[calc(50vw-1.5rem)] select-none"
          style={{
            left: 'max(1rem, calc((100vw - 28rem) / 2 + 1rem))',
            bottom: 'calc(1rem + env(safe-area-inset-bottom))',
          }}
        >
          <button
            type="button"
            onClick={() => setIsOrderStatusOpen(true)}
            className="min-h-11 w-full rounded-[22px] border border-[#6f9f82] bg-[#7BAE8F] px-2.5 py-2 text-left text-sm font-semibold text-white shadow-xl shadow-stone-950/15 active:scale-[0.98]"
          >
            <span className="block text-[9px] uppercase tracking-[0.18em] text-white">Sipariş</span>
            <span className="block truncate text-[14px] font-black leading-tight">
              {formatOrderButtonStatus(activeOrder.status)}
            </span>
          </button>
        </div>
      ) : null}

      <div
        className="fixed z-20 w-[175px] max-w-[calc(50vw-1.5rem)] select-none"
        style={{
          right: 'max(1rem, calc((100vw - 28rem) / 2 + 1rem))',
          bottom: 'calc(1rem + env(safe-area-inset-bottom))',
        }}
      >
        <div className="pointer-events-auto w-[175px] shrink-0">
          <CartButton
            itemCount={itemCount}
            totalPriceLabel={formatPrice(totalPrice)}
            onClick={() => setIsCartOpen(true)}
            totalPriceLabel={buttonPriceLabel}
            label={buttonLabel}
            summary={buttonSummary}
            onClick={handleCartClick}
          />
        </div>
      </div>

      {activeOrder && isOrderStatusOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/55 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl shadow-stone-950/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Sipariş Alındı
                </p>
                <h2 className="mt-2 text-xl font-semibold text-stone-950">
                  {formatOrderNumber(activeOrder.orderId)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOrderStatusOpen(false)}
                className="rounded-full border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-600"
              >
                Kapat
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Durum</p>
                <p className="mt-1 text-lg font-semibold text-stone-950">
                  {formatOrderStatus(activeOrder.status)}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Toplam</p>
                <p className="mt-1 text-lg font-semibold text-stone-950">
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
        onOrderCreated={setActiveOrder}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
