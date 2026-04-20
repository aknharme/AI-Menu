import { formatPrice } from '../utils/formatPrice';
import type { CartItem, OrderResponse } from '../types/order';

type CartSheetProps = {
  items: CartItem[];
  customerName: string;
  note: string;
  tableLabel?: string;
  isSubmitting: boolean;
  orderResult: OrderResponse | null;
  submitError: string | null;
  onCustomerNameChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onSubmit: () => void;
};

export default function CartSheet({
  items,
  customerName,
  note,
  tableLabel,
  isSubmitting,
  orderResult,
  submitError,
  onCustomerNameChange,
  onNoteChange,
  onIncrement,
  onDecrement,
  onRemove,
  onSubmit,
}: CartSheetProps) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <section className="space-y-4 rounded-[32px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Sepet
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-stone-950">
            {totalQuantity > 0 ? `${totalQuantity} urun hazir` : 'Siparisini hazirla'}
          </h3>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700">
          {tableLabel ?? 'Masa secilmedi'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm leading-7 text-stone-600">
          Urun detayini acip adet secerek sepete ekleyebilirsin. Masa bilgisi QR ile geldiyse siparisi dogrudan gonderebilirsin.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="rounded-3xl border border-stone-200 bg-stone-50 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-950">{item.name}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatPrice(item.unitPrice)} x {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-stone-950">
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDecrement(item.productId)}
                    className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold text-stone-950">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onIncrement(item.productId)}
                    className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(item.productId)}
                  className="text-sm font-medium text-rose-700"
                >
                  Kaldir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Adin</span>
          <input
            type="text"
            value={customerName}
            onChange={(event) => onCustomerNameChange(event.target.value)}
            placeholder="Opsiyonel"
            maxLength={120}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-amber-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Siparis notu</span>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Ornek: Sos ayri olsun"
            maxLength={500}
            rows={3}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-amber-500"
          />
        </label>
      </div>

      <div className="rounded-3xl bg-stone-950 px-4 py-4 text-white">
        <div className="flex items-center justify-between gap-3 text-sm text-stone-300">
          <span>Toplam</span>
          <span>{items.length} kalem</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-2xl font-semibold">{formatPrice(totalAmount)}</p>
          <button
            type="button"
            onClick={onSubmit}
            disabled={items.length === 0 || isSubmitting || !tableLabel}
            className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-300"
          >
            {isSubmitting ? 'Gonderiliyor...' : 'Siparisi gonder'}
          </button>
        </div>
      </div>

      {submitError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      {orderResult && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          Siparis alindi. Kod: <span className="font-semibold">{orderResult.orderId.slice(0, 8)}</span>
        </div>
      )}
    </section>
  );
}
