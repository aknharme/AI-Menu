import { useEffect, useMemo, useState } from 'react';
import { getAdminOrders } from '../services/adminService';
import { useRestaurantContext } from '../hooks/useRestaurantContext';
import type { AdminOrderListItem } from '../types/admin';

function formatPrice(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSameLocalDate(dateValue: string, selectedDate: string) {
  const date = new Date(dateValue);
  return toDateInputValue(date) === selectedDate;
}

const statusLabels: Record<string, string> = {
  Pending: 'Bekliyor',
  Preparing: 'Onaylandi',
  Ready: 'Hazir',
  Paid: 'Teslim Edildi',
  Cancelled: 'Iptal Edildi',
};

const statusTone: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-800',
  Preparing: 'bg-sky-50 text-sky-800',
  Ready: 'bg-emerald-50 text-emerald-800',
  Paid: 'bg-stone-100 text-stone-700',
  Cancelled: 'bg-rose-50 text-rose-700',
};

export default function AccountingPage() {
  const { restaurantId } = useRestaurantContext();
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      if (!restaurantId) {
        setError('Restoran bilgisi bulunamadi.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await getAdminOrders(restaurantId);

        if (!isMounted) {
          return;
        }

        setOrders(response);
      } catch {
        if (!isMounted) {
          return;
        }

        setError('Muhasebe verileri yuklenemedi. Lutfen tekrar deneyin.');
        setOrders([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => isSameLocalDate(order.createdAtUtc, selectedDate)),
    [orders, selectedDate],
  );

  const summary = useMemo(() => {
    const grossTotal = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const cancelledTotal = filteredOrders
      .filter((order) => order.status === 'Cancelled')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const deliveredTotal = filteredOrders
      .filter((order) => order.status === 'Paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const openOrderTotal = filteredOrders
      .filter((order) => ['Pending', 'Preparing', 'Ready'].includes(order.status))
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      grossTotal,
      cancelledTotal,
      netTotal: grossTotal - cancelledTotal,
      deliveredTotal,
      openOrderTotal,
      orderCount: filteredOrders.length,
      cancelledCount: filteredOrders.filter((order) => order.status === 'Cancelled').length,
      deliveredCount: filteredOrders.filter((order) => order.status === 'Paid').length,
      activeCount: filteredOrders.filter((order) =>
        ['Pending', 'Preparing', 'Ready'].includes(order.status),
      ).length,
    };
  }, [filteredOrders]);

  const sortedOrders = useMemo(
    () =>
      [...filteredOrders].sort(
        (left, right) =>
          new Date(right.createdAtUtc).getTime() - new Date(left.createdAtUtc).getTime(),
      ),
    [filteredOrders],
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.32),_transparent_30%),linear-gradient(135deg,_#111827_0%,_#1f2937_46%,_#7c2d12_150%)] p-6 text-white shadow-lg shadow-stone-950/10">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/90">
              On Muhasebe
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Gunluk gelir kontrolu</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-200">
              Secilen tarihte gelen siparisleri topla, iptal edilenleri dus ve gun icindeki net akisi hizlica gor.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <label htmlFor="accounting-date" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">
              Tarih Sec
            </label>
            <input
              id="accounting-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-stone-950/30 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSelectedDate(toDateInputValue(new Date()))}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-900"
              >
                Bugun
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(toDateInputValue(new Date(Date.now() - 86400000)))}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white"
              >
                Dun
              </button>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100"
            />
          ))}
        </section>
      ) : error ? (
        <section className="rounded-[28px] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Net Ciro</p>
              <p className="mt-4 text-3xl font-semibold text-stone-950">{formatPrice(summary.netTotal)}</p>
              <p className="mt-2 text-sm text-stone-500">Iptaller dusulmus secili tarih geliri</p>
            </article>

            <article className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 shadow-sm shadow-rose-950/5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">Iptal Dusumu</p>
              <p className="mt-4 text-3xl font-semibold text-rose-700">{formatPrice(summary.cancelledTotal)}</p>
              <p className="mt-2 text-sm text-rose-600">{summary.cancelledCount} siparis reddedildi / iptal edildi</p>
            </article>

            <article className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm shadow-emerald-950/5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Teslim Edilen</p>
              <p className="mt-4 text-3xl font-semibold text-emerald-800">{formatPrice(summary.deliveredTotal)}</p>
              <p className="mt-2 text-sm text-emerald-700">{summary.deliveredCount} siparis tamamlandi</p>
            </article>

            <article className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 shadow-sm shadow-amber-950/5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Acik Bakiye</p>
              <p className="mt-4 text-3xl font-semibold text-amber-900">{formatPrice(summary.openOrderTotal)}</p>
              <p className="mt-2 text-sm text-amber-700">{summary.activeCount} siparis hala akista</p>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
              <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                    Gunluk Ozet
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-stone-950">{selectedDate}</h3>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                  {summary.orderCount} siparis
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Brut Toplam</p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">
                    {formatPrice(summary.grossTotal)}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Net Sonuc</p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">
                    {formatPrice(summary.netTotal)}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Teslim Edilen Adet</p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">{summary.deliveredCount}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Iptal Adet</p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">{summary.cancelledCount}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm leading-6 text-stone-600">
                Formul: <span className="font-semibold text-stone-900">Net Ciro = Brut Toplam - Iptal Dusumu</span>
                <br />
                Acik Bakiye ise henuz teslim edilmemis ama sistemde aktif duran siparislerin toplam tutarini gosterir.
              </div>
            </div>

            <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                Durum Dagilimi
              </p>
              <div className="mt-5 space-y-4">
                {[
                  { label: 'Bekleyen', count: filteredOrders.filter((order) => order.status === 'Pending').length },
                  { label: 'Onaylanan', count: filteredOrders.filter((order) => order.status === 'Preparing').length },
                  { label: 'Hazir', count: filteredOrders.filter((order) => order.status === 'Ready').length },
                  { label: 'Teslim Edildi', count: filteredOrders.filter((order) => order.status === 'Paid').length },
                  { label: 'Iptal Edildi', count: filteredOrders.filter((order) => order.status === 'Cancelled').length },
                ].map((item) => {
                  const width = summary.orderCount === 0 ? 0 : (item.count / summary.orderCount) * 100;

                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-stone-700">{item.label}</span>
                        <span className="text-stone-500">{item.count}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-stone-100">
                        <div
                          className="h-2 rounded-full bg-[linear-gradient(90deg,_#f59e0b_0%,_#1f2937_100%)]"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
            <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                  Siparis Dokumu
                </p>
                <h3 className="mt-1 text-xl font-semibold text-stone-950">Gun icindeki hareketler</h3>
              </div>
              <span className="text-sm text-stone-500">{sortedOrders.length} kayit</span>
            </div>

            {sortedOrders.length === 0 ? (
              <div className="mt-5 rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-sm text-stone-500">
                Secilen tarihte siparis bulunamadi.
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-400">
                      <th className="px-3">Masa</th>
                      <th className="px-3">Durum</th>
                      <th className="px-3">Saat</th>
                      <th className="px-3">Kalem</th>
                      <th className="px-3 text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOrders.map((order) => (
                      <tr key={order.orderId} className="rounded-2xl bg-stone-50 text-sm text-stone-700">
                        <td className="rounded-l-2xl px-3 py-4 font-medium text-stone-950">{order.tableName}</td>
                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone[order.status] ?? 'bg-stone-100 text-stone-700'}`}
                          >
                            {statusLabels[order.status] ?? order.status}
                          </span>
                        </td>
                        <td className="px-3 py-4">{formatDate(order.createdAtUtc)}</td>
                        <td className="px-3 py-4">{order.itemCount} urun</td>
                        <td className="rounded-r-2xl px-3 py-4 text-right font-semibold text-stone-950">
                          {formatPrice(order.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
