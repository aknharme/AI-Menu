import { useEffect, useState } from 'react';
import {
  getAdminOrderDetail,
  getAdminOrders,
  updateAdminOrderStatus,
} from '../services/adminService';
import { useRestaurantContext } from '../hooks/useRestaurantContext';
import type { AdminOrderDetail, AdminOrderListItem } from '../types/admin';

type OrderFilter =
  | 'live'
  | 'pending'
  | 'approved'
  | 'ready'
  | 'delivered'
  | 'history';

const filterLabels: Record<OrderFilter, string> = {
  live: 'Anlik',
  pending: 'Bekleyen',
  approved: 'Onaylanan',
  ready: 'Hazir',
  delivered: 'Teslim Edilmis',
  history: 'Gecmis',
};

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

function matchesFilter(order: AdminOrderListItem, filter: OrderFilter) {
  switch (filter) {
    case 'live':
      return ['Pending', 'Preparing', 'Ready'].includes(order.status);
    case 'pending':
      return order.status === 'Pending';
    case 'approved':
      return order.status === 'Preparing';
    case 'ready':
      return order.status === 'Ready';
    case 'delivered':
      return order.status === 'Paid';
    case 'history':
      return ['Paid', 'Cancelled'].includes(order.status);
    default:
      return true;
  }
}

function buildPrintableMarkup(order: AdminOrderDetail) {
  const items = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e7e5e4;">${item.productName}${item.variantName ? ` (${item.variantName})` : ''}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e7e5e4;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e7e5e4;text-align:right;">${formatPrice(item.lineTotal)}</td>
        </tr>
      `,
    )
    .join('');

  return `
    <html>
      <head>
        <title>Siparis #${order.orderId.slice(0, 8)}</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 24px; color: #1c1917;">
        <h1 style="margin-bottom: 8px;">Siparis Fisi</h1>
        <p style="margin: 0 0 4px;">Masa: ${order.tableName}</p>
        <p style="margin: 0 0 4px;">Durum: ${statusLabels[order.status] ?? order.status}</p>
        <p style="margin: 0 0 16px;">Tarih: ${formatDate(order.createdAtUtc)}</p>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align:left; padding-bottom:8px;">Urun</th>
              <th style="text-align:center; padding-bottom:8px;">Adet</th>
              <th style="text-align:right; padding-bottom:8px;">Tutar</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
        </table>
        <p style="margin-top: 16px; font-weight: bold; text-align: right;">Toplam: ${formatPrice(order.totalAmount)}</p>
      </body>
    </html>
  `;
}

export default function OrdersPage() {
  const { restaurantId } = useRestaurantContext();
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [filter, setFilter] = useState<OrderFilter>('live');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [detailError, setDetailError] = useState('');

  async function loadOrders(showLoading = false) {
    if (!restaurantId) {
      setOrders([]);
      setError('Restoran bilgisi bulunamadi.');
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }

      setError('');
      const response = await getAdminOrders(restaurantId);
      setOrders(response);
      setSelectedOrderId((current) => {
        if (current && response.some((order) => order.orderId === current)) {
          return current;
        }

        const firstMatching = response.find((order) => matchesFilter(order, filter));
        return firstMatching?.orderId ?? response[0]?.orderId ?? null;
      });
    } catch {
      setOrders([]);
      setError('Siparisler yuklenemedi. Lutfen tekrar deneyin.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  async function loadOrderDetail(orderId: string | null) {
    if (!restaurantId || !orderId) {
      setSelectedOrder(null);
      setDetailError('');
      return;
    }

    try {
      setDetailLoading(true);
      setDetailError('');
      const response = await getAdminOrderDetail(restaurantId, orderId);
      setSelectedOrder(response);
    } catch {
      setSelectedOrder(null);
      setDetailError('Siparis detayi getirilemedi.');
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (cancelled) {
        return;
      }

      await loadOrders(true);
    }

    initialize();

    const intervalId = window.setInterval(() => {
      if (!cancelled) {
        void loadOrders(false);
      }
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [restaurantId, filter]);

  useEffect(() => {
    void loadOrderDetail(selectedOrderId);
  }, [restaurantId, selectedOrderId]);

  useEffect(() => {
    if (selectedOrderId && orders.some((order) => order.orderId === selectedOrderId && matchesFilter(order, filter))) {
      return;
    }

    const firstMatching = orders.find((order) => matchesFilter(order, filter));
    if (firstMatching) {
      setSelectedOrderId(firstMatching.orderId);
      return;
    }

    if (orders.length > 0 && filter !== 'live') {
      setSelectedOrderId(orders[0].orderId);
      return;
    }

    setSelectedOrderId(null);
  }, [orders, filter, selectedOrderId]);

  async function handleStatusChange(status: string) {
    if (!restaurantId || !selectedOrder) {
      return;
    }

    try {
      setUpdatingStatus(status);
      const updated = await updateAdminOrderStatus(restaurantId, selectedOrder.orderId, status);
      setSelectedOrder(updated);
      await loadOrders(false);
    } catch {
      setDetailError('Siparis durumu guncellenemedi.');
    } finally {
      setUpdatingStatus(null);
    }
  }

  function handlePrint() {
    if (!selectedOrder) {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(buildPrintableMarkup(selectedOrder));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  const filteredOrders = orders.filter((order) => matchesFilter(order, filter));
  const activeCount = orders.filter((order) => matchesFilter(order, 'live')).length;
  const deliveredCount = orders.filter((order) => matchesFilter(order, 'delivered')).length;
  const pendingCount = orders.filter((order) => matchesFilter(order, 'pending')).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-stone-200 bg-[linear-gradient(135deg,_#1c1917_0%,_#44403c_45%,_#d97706_160%)] p-6 text-white shadow-lg shadow-stone-950/10">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.6fr))]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/90">
              Siparis Merkezi
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Yonet, onayla, yazdir</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-200">
              Anlik siparis akisini admin panelinden takip et, durumlari tek tusla guncelle ve fis yazdir.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Toplam</p>
            <p className="mt-2 text-3xl font-semibold">{orders.length}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Anlik</p>
            <p className="mt-2 text-3xl font-semibold">{activeCount}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Teslim</p>
            <p className="mt-2 text-3xl font-semibold">{deliveredCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(filterLabels) as OrderFilter[]).map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              onClick={() => setFilter(filterKey)}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                filter === filterKey
                  ? 'bg-stone-950 text-white'
                  : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100',
              ].join(' ')}
            >
              {filterLabels[filterKey]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void loadOrders(true)}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Yenile
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-500">
          <span>Bekleyen: {pendingCount}</span>
          <span>Filtrelenen: {filteredOrders.length}</span>
          <span>Son guncelleme: otomatik 15 sn</span>
        </div>
      </section>

      {loading ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]">
          <div className="h-96 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
          <div className="h-96 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
        </section>
      ) : error ? (
        <section className="rounded-[28px] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]">
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-sm text-stone-500">
                Bu filtre icin uygun siparis bulunamadi.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <button
                  key={order.orderId}
                  type="button"
                  onClick={() => setSelectedOrderId(order.orderId)}
                  className={[
                    'w-full rounded-[28px] border p-4 text-left shadow-sm transition',
                    selectedOrderId === order.orderId
                      ? 'border-amber-400 bg-amber-50 shadow-amber-100'
                      : 'border-stone-200 bg-white shadow-stone-950/5',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                        Siparis #{order.orderId.slice(0, 8)}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-stone-950">{order.tableName}</h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone[order.status] ?? 'bg-stone-100 text-stone-700'}`}
                    >
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Kalem</p>
                      <p className="mt-1 text-sm font-medium text-stone-700">{order.itemCount} urun</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Saat</p>
                      <p className="mt-1 text-sm font-medium text-stone-700">{formatDate(order.createdAtUtc)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Toplam</p>
                      <p className="mt-1 text-sm font-semibold text-stone-950">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                  Siparis Detayi
                </p>
                <h3 className="mt-1 text-xl font-semibold text-stone-950">
                  {selectedOrder?.tableName ?? 'Siparis secin'}
                </h3>
              </div>
              {selectedOrder ? (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone[selectedOrder.status] ?? 'bg-stone-100 text-stone-700'}`}
                >
                  {statusLabels[selectedOrder.status] ?? selectedOrder.status}
                </span>
              ) : null}
            </div>

            <div className="mt-5 space-y-5">
              {detailLoading ? (
                <div className="space-y-3">
                  <div className="h-5 w-1/3 animate-pulse rounded bg-stone-200" />
                  <div className="h-24 animate-pulse rounded-[24px] bg-stone-100" />
                  <div className="h-24 animate-pulse rounded-[24px] bg-stone-100" />
                </div>
              ) : detailError ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {detailError}
                </div>
              ) : !selectedOrder ? (
                <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-sm text-stone-500">
                  Detaylari gormek icin soldan bir siparis secin.
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-stone-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Olusturma</p>
                      <p className="mt-2 text-sm font-medium text-stone-700">
                        {formatDate(selectedOrder.createdAtUtc)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Toplam</p>
                      <p className="mt-2 text-lg font-semibold text-stone-950">
                        {formatPrice(selectedOrder.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {(selectedOrder.customerName || selectedOrder.note) && (
                    <div className="space-y-3 rounded-[28px] border border-stone-200 bg-white p-4">
                      {selectedOrder.customerName ? (
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Musteri</p>
                          <p className="mt-1 text-sm text-stone-700">{selectedOrder.customerName}</p>
                        </div>
                      ) : null}
                      {selectedOrder.note ? (
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Siparis Notu</p>
                          <p className="mt-1 text-sm text-stone-700">{selectedOrder.note}</p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm font-semibold text-stone-950">Siparis Islem Butonlari</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleStatusChange('Preparing')}
                        disabled={updatingStatus !== null || ['Preparing', 'Ready', 'Paid', 'Cancelled'].includes(selectedOrder.status)}
                        className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-300"
                      >
                        {updatingStatus === 'Preparing' ? 'Guncelleniyor...' : 'Onayla'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleStatusChange('Ready')}
                        disabled={updatingStatus !== null || ['Ready', 'Paid', 'Cancelled'].includes(selectedOrder.status)}
                        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:bg-stone-100"
                      >
                        Hazirla
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleStatusChange('Paid')}
                        disabled={updatingStatus !== null || ['Paid', 'Cancelled'].includes(selectedOrder.status)}
                        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:bg-stone-100"
                      >
                        Teslim Edildi
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleStatusChange('Cancelled')}
                        disabled={updatingStatus !== null || ['Paid', 'Cancelled'].includes(selectedOrder.status)}
                        className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 disabled:cursor-not-allowed disabled:bg-rose-50"
                      >
                        Iptal Et
                      </button>
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
                      >
                        Yazdir
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <article
                        key={item.orderItemId}
                        className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm shadow-stone-950/5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-base font-semibold text-stone-950">{item.productName}</h4>
                            {item.variantName ? (
                              <p className="mt-1 text-sm text-stone-500">Varyant: {item.variantName}</p>
                            ) : null}
                          </div>
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                            {item.quantity} adet
                          </span>
                        </div>

                        {item.note ? (
                          <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                            Not: {item.note}
                          </p>
                        ) : null}

                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-stone-500">{formatPrice(item.unitPrice)} birim fiyat</span>
                          <span className="font-semibold text-stone-950">{formatPrice(item.lineTotal)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
