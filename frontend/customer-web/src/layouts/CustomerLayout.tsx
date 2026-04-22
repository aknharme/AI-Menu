import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CartButton from '../components/CartButton';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../contexts/CartContext';
import { useQueryParams } from '../hooks/useQueryParams';
import { formatPrice } from '../utils/formatPrice';
import { formatTableLabel } from '../utils/formatTableLabel';

export default function CustomerLayout() {
  const { restaurantId, tableId } = useQueryParams();
  const { itemCount, totalPrice } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_30%),linear-gradient(180deg,_#fffdf8_0%,_#f5f5f4_100%)]">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              QR Menu
            </p>
            <h1 className="text-lg font-semibold text-stone-950">Menu</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700">
              {formatTableLabel(tableId)}
            </span>
            <CartButton
              itemCount={itemCount}
              totalPriceLabel={formatPrice(totalPrice)}
              onClick={() => setIsCartOpen(true)}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        restaurantId={restaurantId}
        tableId={tableId}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
