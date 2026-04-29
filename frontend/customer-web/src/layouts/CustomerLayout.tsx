import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { Outlet } from 'react-router-dom';
import CartButton from '../components/CartButton';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../contexts/CartContext';
import { useQueryParams } from '../hooks/useQueryParams';
import { formatPrice } from '../utils/formatPrice';

export default function CustomerLayout() {
  const { restaurantId, tableId } = useQueryParams();
  const { itemCount, totalPrice } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
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

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragState.hasMoved = true;
    }

    setCartPosition(clampCartPosition({
      x: dragState.originX + deltaX,
      y: dragState.originY + deltaY,
    }));
  }

  function handleCartPointerUp(event: PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (dragState.pointerId === event.pointerId) {
      suppressClickRef.current = dragState.hasMoved;
      dragStateRef.current.isDragging = false;
    }
  }

  function handleCartClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    setIsCartOpen(true);
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <main
        ref={containerRef}
        className="relative mx-auto min-h-screen max-w-md bg-white px-4 pb-0 pt-4 shadow-2xl shadow-stone-950/10"
      >
        <Outlet />

        {/* 29 Nisan 2026: Footer - ALİ ÇAĞRI EMİR KADİR yazısı eklendi */}
        <footer className="-mx-4 mt-4 h-7 border-t border-stone-200 bg-stone-200 flex items-center justify-center">
          <p className="text-black text-sm font-medium">ALİ ÇAĞRI EMİR KADİR</p>
        </footer>
      </main>

      <div
        ref={cartRef}
        onPointerDown={handleCartPointerDown}
        onPointerMove={handleCartPointerMove}
        onPointerUp={handleCartPointerUp}
        onPointerCancel={handleCartPointerUp}
        className="fixed z-20 w-[175px] max-w-[calc(100vw-2rem)] cursor-grab select-none touch-none active:cursor-grabbing active:scale-[0.98]"
        style={{
          left: `${cartPosition.x}px`,
          top: `${cartPosition.y}px`,
        }}
      >
        <div className="pointer-events-auto">
          <CartButton
            itemCount={itemCount}
            totalPriceLabel={formatPrice(totalPrice)}
            onClick={handleCartClick}
          />
        </div>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        restaurantId={restaurantId}
        tableId={tableId}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
