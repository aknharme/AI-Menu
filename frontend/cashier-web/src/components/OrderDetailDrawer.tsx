import type { CashierOrderDetail } from '../types/order';

type OrderDetailDrawerProps = {
  order: CashierOrderDetail | null;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  onClose: () => void;
};

const statusLabels: Record<string, string> = {
  Pending: 'Bekliyor',
  Preparing: 'Hazirlaniyor',
  Ready: 'Hazir',
  Paid: 'Odendi',
};

function formatPrice(value: number) {
  return `${value.toLocaleString('tr-TR')} TL`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetailDrawer({
  order,
  isLoading,
  error,
  isOpen,
  onClose,
}: OrderDetailDrawerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-stone-950/55 p-0 lg:static lg:block lg:bg-transparent">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl lg:max-h-none lg:rounded-[32px] lg:border lg:border-stone-200 lg:shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
              Siparis Detayi
            </p>
            <h2 className="mt-1 text-xl font-semibold text-stone-950">
              {order ? order.tableName : 'Siparis secin'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200 px-3 py-2 text-sm text-stone-600 lg:hidden"
          >
            Kapat
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {isLoading && (
            <div className="space-y-3">
              <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200" />
              <div className="h-6 w-2/3 animate-pulse rounded bg-stone-100" />
              <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          {!isLoading && !error && !order && (
            <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-sm text-stone-500">
              Detaylari gormek icin listeden bir siparis secin.
            </div>
          )}

          {!isLoading && !error && order && (
            <>
              <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Masa</p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">{order.tableName}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Durum</p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">
                    {statusLabels[order.status] ?? order.status}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Zaman</p>
                  <p className="mt-2 text-sm font-medium text-stone-700">{formatDate(order.createdAtUtc)}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Toplam</p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">{formatPrice(order.totalAmount)}</p>
                </div>
              </section>

              {(order.customerName || order.note) && (
                <section className="space-y-3 rounded-[28px] border border-stone-200 bg-white p-4">
                  {order.customerName && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Musteri</p>
                      <p className="mt-1 text-sm text-stone-700">{order.customerName}</p>
                    </div>
                  )}
                  {order.note && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Siparis Notu</p>
                      <p className="mt-1 text-sm text-stone-700">{order.note}</p>
                    </div>
                  )}
                </section>
              )}

              <section className="space-y-3">
                {order.items.map((item) => (
                  <article
                    key={item.orderItemId}
                    className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm shadow-stone-950/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-stone-950">{item.productName}</h3>
                        {item.variantName && (
                          <p className="mt-1 text-sm text-stone-500">Varyant: {item.variantName}</p>
                        )}
                      </div>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                        {item.quantity} adet
                      </span>
                    </div>

                    {item.note && (
                      <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        Not: {item.note}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-stone-500">{formatPrice(item.unitPrice)} birim fiyat</span>
                      <span className="font-semibold text-stone-950">{formatPrice(item.lineTotal)}</span>
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
