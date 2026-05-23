import { useState } from 'react';
import type { CashierOrderListItem } from '../types/order';

type OrderCardAction = 'payment' | 'cancel' | 'deliver' | 'refund' | null;
type ReasonAction = 'cancel' | 'refund';

type OrderCardProps = {
  order: CashierOrderListItem;
  isActive: boolean;
  onSelect: (orderId: string) => void;
  onStartPreparing: (orderId: string) => Promise<boolean>;
  onMarkPaid: (orderId: string) => Promise<boolean>;
  onCancelOrder: (orderId: string, reason: string) => Promise<boolean>;
  onDeliverOrder: (orderId: string) => Promise<boolean>;
  onRefundOrder: (orderId: string, reason: string) => Promise<boolean>;
  isUpdatingStatus: boolean;
};

const statusLabels: Record<string, string> = {
  Pending: 'Bekliyor',
  Preparing: 'Hazırlanıyor',
  Ready: 'Teslim',
  Paid: 'Ödeme Alındı',
  Cancelled: 'İptal',
  Refunded: 'İade',
};

function formatPrice(value: number) {
  return `${value.toLocaleString('tr-TR')} TL`;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadgeClass(status: string) {
  if (status === 'Preparing') {
    return 'bg-amber-100 text-amber-800';
  }

  if (status === 'Ready' || status === 'Paid') {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (status === 'Cancelled' || status === 'Refunded') {
    return 'bg-rose-100 text-rose-800';
  }

  return 'bg-stone-100 text-stone-700';
}

export default function OrderCard({
  order,
  isActive,
  onSelect,
  onStartPreparing,
  onMarkPaid,
  onCancelOrder,
  onDeliverOrder,
  onRefundOrder,
  isUpdatingStatus,
}: OrderCardProps) {
  const [pendingAction, setPendingAction] = useState<OrderCardAction>(null);
  const [reasonText, setReasonText] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

  const isPending = order.status === 'Pending';
  const isPreparing = order.status === 'Preparing';
  const isDelivered = order.status === 'Ready';

  function closeActionArea() {
    setPendingAction(null);
    setReasonText('');
    setReasonError(null);
  }

  function openReasonArea(action: ReasonAction) {
    setPendingAction(action);
    setReasonText('');
    setReasonError(null);
  }

  async function handleStartPreparing() {
    const isSaved = await onStartPreparing(order.orderId);

    if (isSaved) {
      closeActionArea();
    }
  }

  async function handlePaymentConfirm() {
    const isSaved = await onMarkPaid(order.orderId);

    if (isSaved) {
      closeActionArea();
    }
  }

  async function handleDeliverConfirm() {
    const isSaved = await onDeliverOrder(order.orderId);

    if (isSaved) {
      closeActionArea();
    }
  }

  async function handleReasonConfirm(action: ReasonAction) {
    const trimmedReason = reasonText.trim();

    if (!trimmedReason) {
      setReasonError(action === 'cancel' ? 'İptal sebebi yazmalısınız.' : 'İade sebebi yazmalısınız.');
      return;
    }

    const isSaved =
      action === 'cancel'
        ? await onCancelOrder(order.orderId, trimmedReason)
        : await onRefundOrder(order.orderId, trimmedReason);

    if (isSaved) {
      closeActionArea();
    }
  }

  function renderConfirmArea(message: string, onConfirm: () => Promise<void>) {
    return (
      <div className="mt-4 flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-stone-700">{message}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={closeActionArea}
            disabled={isUpdatingStatus}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isUpdatingStatus}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isUpdatingStatus ? 'Kaydediliyor...' : 'Onayla'}
          </button>
        </div>
      </div>
    );
  }

  function renderReasonArea(action: ReasonAction) {
    const isRefund = action === 'refund';
    const title = isRefund ? 'İade sebebi' : 'İptal sebebi';
    const placeholder = isRefund ? 'İade sebebini yazın' : 'İptal sebebini yazın';
    const confirmLabel = isRefund ? 'İadeyi Onayla' : 'İptali Onayla';

    return (
      <div className="mt-4 space-y-3 border-t border-stone-200 pt-4">
        <label className="block text-sm font-medium text-stone-700" htmlFor={`${action}-reason-${order.orderId}`}>
          {title}
        </label>
        <textarea
          id={`${action}-reason-${order.orderId}`}
          value={reasonText}
          onChange={(event) => {
            setReasonText(event.target.value);
            setReasonError(null);
          }}
          disabled={isUpdatingStatus}
          rows={3}
          className="w-full resize-none rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-stone-100"
          placeholder={placeholder}
        />
        {reasonError ? <p className="text-sm font-medium text-rose-700">{reasonError}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeActionArea}
            disabled={isUpdatingStatus}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => void handleReasonConfirm(action)}
            disabled={isUpdatingStatus}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
          >
            {isUpdatingStatus ? 'Kaydediliyor...' : confirmLabel}
          </button>
        </div>
      </div>
    );
  }

  function renderActionArea() {
    // Butonlar aktif sipariş aşamasına göre istenen sırayla gösterilir.
    if (pendingAction === 'payment') {
      return renderConfirmArea('Ödemenin alındığını onaylıyor musunuz?', handlePaymentConfirm);
    }

    if (pendingAction === 'deliver') {
      return renderConfirmArea('Siparişin teslim edildiğini onaylıyor musunuz?', handleDeliverConfirm);
    }

    if (pendingAction === 'cancel' || pendingAction === 'refund') {
      return renderReasonArea(pendingAction);
    }

    if (isPending) {
      return (
        <div className="mt-4 grid gap-2 border-t border-stone-200 pt-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void handleStartPreparing()}
            disabled={isUpdatingStatus}
            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
          >
            {isUpdatingStatus ? 'Kaydediliyor...' : 'Hazırlamaya Başla'}
          </button>
          <button
            type="button"
            onClick={() => openReasonArea('cancel')}
            disabled={isUpdatingStatus}
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sipariş İptal
          </button>
        </div>
      );
    }

    if (isPreparing) {
      return (
        <div className="mt-4 grid gap-2 border-t border-stone-200 pt-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPendingAction('deliver')}
            disabled={isUpdatingStatus}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            Teslim Edildi
          </button>
          <button
            type="button"
            onClick={() => openReasonArea('cancel')}
            disabled={isUpdatingStatus}
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sipariş İptal
          </button>
        </div>
      );
    }

    if (isDelivered) {
      return (
        <div className="mt-4 grid gap-2 border-t border-stone-200 pt-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => openReasonArea('refund')}
            disabled={isUpdatingStatus}
            className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sipariş İade
          </button>
          <button
            type="button"
            onClick={() => openReasonArea('cancel')}
            disabled={isUpdatingStatus}
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sipariş İptal
          </button>
          <button
            type="button"
            onClick={() => setPendingAction('payment')}
            disabled={isUpdatingStatus}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            Ödeme Alındı
          </button>
        </div>
      );
    }

    return null;
  }

  return (
    <article
      className={`w-full rounded-[28px] border p-4 text-left shadow-sm transition ${
        isActive
          ? 'border-amber-400 bg-amber-50 shadow-amber-100'
          : 'border-stone-200 bg-white shadow-stone-950/5'
      }`}
    >
      <button type="button" onClick={() => onSelect(order.orderId)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Siparis
            </p>
            <h3 className="mt-2 text-lg font-semibold text-stone-950">{order.tableName}</h3>
            <p className="mt-1 text-sm text-stone-500">#{order.orderId.slice(0, 8)}</p>
          </div>

          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
            {statusLabels[order.status] ?? order.status}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Saat</p>
            <p className="mt-1 text-sm font-medium text-stone-700">{formatTime(order.createdAtUtc)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Kalem</p>
            <p className="mt-1 text-sm font-medium text-stone-700">{order.itemCount} urun</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Toplam</p>
            <p className="mt-1 text-sm font-semibold text-stone-950">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>
      </button>

      {renderActionArea()}
    </article>
  );
}
