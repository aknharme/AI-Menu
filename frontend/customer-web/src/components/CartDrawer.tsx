import { useMemo, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { createOrder } from '../services/orderService';
import type { OrderResponse } from '../types/order';
import { formatPrice } from '../utils/formatPrice';

type CartDrawerProps = {
  isOpen: boolean;
  restaurantId?: string;
  tableId?: string;
  onClose: () => void;
};

export default function CartDrawer({
  isOpen,
  restaurantId,
  tableId,
  onClose,
}: CartDrawerProps) {
  const {
    cartItems,
    totalPrice,
    removeFromCart,
    updateQuantity,
    updateItemNote,
    clearCart,
  } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);

  const canSubmit = useMemo(
    () => Boolean(restaurantId && tableId && cartItems.length > 0 && !submitting),
    [cartItems.length, restaurantId, submitting, tableId],
  );

  async function handleSubmit() {
    if (!restaurantId || !tableId || cartItems.length === 0) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const order = await createOrder({
        restaurantId,
        tableId,
        customerName: customerName.trim(),
        note: orderNote.trim(),
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.variantId,
          note: item.note.trim(),
        })),
      });

      setCreatedOrder(order);
      clearCart();
      setCustomerName('');
      setOrderNote('');
    } catch {
      setError('Sipariş gönderilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-stone-950/55 p-0 sm:p-6">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl sm:rounded-[32px]">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
              Sipariş Özeti
            </p>
            <h2 className="mt-1 text-xl font-semibold text-stone-950">Sepet</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200 px-3 py-2 text-sm text-stone-600"
          >
            Kapat
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {!tableId && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Sipariş gönderebilmek için masaya özel QR bağlantısından gelmen gerekiyor.
            </div>
          )}

          {createdOrder && (
            <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Sipariş Alındı
              </p>
              <h3 className="mt-2 text-lg font-semibold">Sipariş numarası: {createdOrder.orderId}</h3>
              <p className="mt-2 text-sm">
                Durum: {createdOrder.status} | Toplam: {formatPrice(createdOrder.totalAmount)}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-sm text-stone-500">
              Sepetin şu anda boş. Menüden ürün seçerek siparişini oluşturmaya başlayabilirsin.
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <article
                  key={item.cartItemId}
                  className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm shadow-stone-950/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                        {item.categoryName}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-stone-950">{item.productName}</h3>
                      {item.variantName && (
                        <p className="mt-1 text-sm text-stone-500">Varyant: {item.variantName}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-sm font-medium text-rose-600"
                    >
                      Çıkar
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="rounded-full px-3 py-1.5 text-sm text-stone-700"
                      >
                        -
                      </button>
                      <span className="min-w-10 text-center text-sm font-semibold text-stone-950">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="rounded-full px-3 py-1.5 text-sm text-stone-700"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-base font-semibold text-stone-950">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>

                  <label className="mt-4 block">
                    <span className="text-sm font-medium text-stone-700">Ürün notu</span>
                    <textarea
                      value={item.note}
                      onChange={(event) => updateItemNote(item.cartItemId, event.target.value)}
                      rows={2}
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:bg-white"
                      placeholder="Örn. soğansız, az buzlu"
                    />
                  </label>
                </article>
              ))}
            </div>
          )}

          <section className="rounded-[28px] border border-stone-200 bg-stone-50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Müşteri adı</span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-400"
                  placeholder="Opsiyonel"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-700">Sipariş notu</span>
                <input
                  value={orderNote}
                  onChange={(event) => setOrderNote(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-400"
                  placeholder="Örn. önce içecekler gelsin"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="border-t border-stone-200 bg-white px-5 py-4">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-stone-500">Toplam</span>
            <span className="text-lg font-semibold text-stone-950">{formatPrice(totalPrice)}</span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Sipariş gönderiliyor...' : 'Siparişi gönder'}
          </button>
        </div>
      </div>
    </div>
  );
}
