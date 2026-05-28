import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import InlineAlert from '../components/InlineAlert';
import LoadingState from '../components/LoadingState';
import { useRestaurantContext } from '../hooks/useRestaurantContext';
import { getOrderDetail, getOrderStatusLogs } from '../services/adminService';
import type { AdminOrderDetail, OrderStatusLog } from '../types/admin';
import { extractApiErrorMessage } from '../utils/apiError';

const statusLabels: Record<string, string> = {
  Pending: 'Bekliyor',
  Preparing: 'Hazırlanıyor',
  Ready: 'Hazır',
  Paid: 'Ödendi',
  Cancelled: 'İptal edildi',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatStatus(value: string | null) {
  if (!value) {
    return 'Oluşturuldu';
  }

  return statusLabels[value] ?? value;
}

function statusBadgeClasses(status: string) {
  if (status === 'Paid') {
    return 'bg-emerald-100 text-emerald-700';
  }

  if (status === 'Cancelled') {
    return 'bg-rose-100 text-rose-700';
  }

  if (status === 'Ready') {
    return 'bg-sky-100 text-sky-700';
  }

  return 'bg-stone-100 text-stone-700';
}

// OrderLogsPage, admin panelde siparis durum gecmisini kronolojik olarak gosterir.
export default function OrderLogsPage() {
  const { restaurantId } = useRestaurantContext();
  const [logs, setLogs] = useState<OrderStatusLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrderStatusLogs(restaurantId);

        if (isMounted) {
          setLogs(response);
        }
      } catch (requestError: any) {
        if (isMounted) {
          setError(extractApiErrorMessage(requestError, 'Sipariş logları yüklenemedi.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  const paidLogCount = useMemo(
    () => logs.filter((log) => log.newStatus === 'Paid').length,
    [logs],
  );

  const filteredLogs = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().replace(/^#/, '').toLowerCase();
    if (!normalizedSearchTerm) {
      return logs;
    }

    return logs.filter((log) => log.orderId.toLowerCase().includes(normalizedSearchTerm));
  }, [logs, searchTerm]);

  async function handleSelectLog(log: OrderStatusLog) {
    try {
      setSelectedLogId(log.id);
      setDetailLoading(true);
      setDetailError(null);
      setSelectedOrder(null);
      const response = await getOrderDetail(restaurantId, log.orderId);
      setSelectedOrder(response);
    } catch (requestError: any) {
      setDetailError(extractApiErrorMessage(requestError, 'Sipariş detayı yüklenemedi.'));
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
          Geçmiş
        </p>
        <h2 className="text-2xl font-semibold text-stone-950">Sipariş Logları</h2>
        <p className="max-w-3xl text-sm leading-6 text-stone-600">
          Son 1000 sipariş hareketi burada tutulur. Sipariş numarasıyla arayıp bir log kaydına basarak detayları görebilirsiniz.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Toplam Log</p>
          <p className="mt-2 text-3xl font-semibold text-stone-950">{logs.length}</p>
        </div>
        <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Ödeme Alınan</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">{paidLogCount}</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Kayıtlar
            </p>
            <h3 className="mt-1 text-xl font-semibold text-stone-950">Son hareketler</h3>
          </div>
          <p className="text-sm text-stone-500">restaurantId: {restaurantId}</p>
        </div>

        <label className="mt-5 block max-w-xl">
          <span className="text-sm font-medium text-stone-700">Sipariş numarası ara</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Örn: 99999999 veya #99999999"
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
          />
        </label>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          {loading ? (
            <LoadingState count={5} />
          ) : error ? (
            <InlineAlert message={error} />
          ) : logs.length === 0 ? (
            <EmptyState
              title="Log yok"
              description="Siparişler oluşup durum değiştirdikçe burada görünecek."
            />
          ) : filteredLogs.length === 0 ? (
            <EmptyState
              title="Sipariş bulunamadı"
              description="Aradığınız sipariş numarasına ait log son 1000 kayıt içinde yok."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.18em] text-stone-400">
                    <th className="px-4 font-medium">Zaman</th>
                    <th className="px-4 font-medium">Masa</th>
                    <th className="px-4 font-medium">Sipariş</th>
                    <th className="px-4 font-medium">Durum</th>
                    <th className="px-4 font-medium">Tutar</th>
                    <th className="px-4 font-medium">Kullanıcı</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => void handleSelectLog(log)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          void handleSelectLog(log);
                        }
                      }}
                      className={[
                        'cursor-pointer text-sm text-stone-700 outline-none transition hover:bg-amber-50 focus:bg-amber-50',
                        selectedLogId === log.id ? 'bg-amber-50' : 'bg-stone-50',
                      ].join(' ')}
                    >
                      <td className="rounded-l-2xl px-4 py-4 font-medium text-stone-950">
                        {formatDate(log.changedAt)}
                      </td>
                      <td className="px-4 py-4">{log.tableName || 'Masa yok'}</td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs text-stone-500">
                          #{log.orderId.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600">
                            {formatStatus(log.oldStatus)}
                          </span>
                          <span className="text-stone-400">-&gt;</span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses(log.newStatus)}`}
                          >
                            {formatStatus(log.newStatus)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-stone-950">
                        {formatPrice(log.orderTotalAmount)}
                      </td>
                      <td className="rounded-r-2xl px-4 py-4">
                        {log.changedByUserId ? (
                          <span className="font-mono text-xs text-stone-500">
                            {log.changedByUserId.slice(0, 8)}
                          </span>
                        ) : (
                          <span className="text-stone-400">Sistem</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <aside className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                Sipariş Detayı
              </p>
              <h4 className="mt-1 text-lg font-semibold text-stone-950">
                {selectedOrder ? selectedOrder.tableName : 'Log seçin'}
              </h4>
            </div>

            <div className="mt-5">
              {detailLoading ? (
                <LoadingState count={3} />
              ) : detailError ? (
                <InlineAlert message={detailError} />
              ) : !selectedOrder ? (
                <EmptyState
                  title="Detay yok"
                  description="Detayları görmek için soldaki log kayıtlarından birine basın."
                />
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Sipariş</p>
                      <p className="mt-2 font-mono text-sm text-stone-700">
                        #{selectedOrder.orderId.slice(0, 8)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Durum</p>
                      <p className="mt-2 text-sm font-semibold text-stone-950">
                        {formatStatus(selectedOrder.status)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Zaman</p>
                      <p className="mt-2 text-sm text-stone-700">
                        {formatDate(selectedOrder.createdAtUtc)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Toplam</p>
                      <p className="mt-2 text-sm font-semibold text-stone-950">
                        {formatPrice(selectedOrder.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {(selectedOrder.customerName || selectedOrder.note) && (
                    <div className="rounded-2xl bg-white p-4">
                      {selectedOrder.customerName ? (
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Müşteri</p>
                          <p className="mt-1 text-sm text-stone-700">{selectedOrder.customerName}</p>
                        </div>
                      ) : null}
                      {selectedOrder.note ? (
                        <div className={selectedOrder.customerName ? 'mt-4' : ''}>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Not</p>
                          <p className="mt-1 text-sm text-stone-700">{selectedOrder.note}</p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <article key={item.orderItemId} className="rounded-2xl bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h5 className="text-sm font-semibold text-stone-950">{item.productName}</h5>
                            {item.variantName ? (
                              <p className="mt-1 text-xs text-stone-500">Varyant: {item.variantName}</p>
                            ) : null}
                          </div>
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                            {item.quantity} adet
                          </span>
                        </div>
                        {item.note ? (
                          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
                            Not: {item.note}
                          </p>
                        ) : null}
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-stone-500">{formatPrice(item.unitPrice)}</span>
                          <span className="font-semibold text-stone-950">{formatPrice(item.lineTotal)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
