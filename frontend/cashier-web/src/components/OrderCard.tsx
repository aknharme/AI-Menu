import type { CashierOrderListItem } from '../types/order';

type OrderCardProps = {
  order: CashierOrderListItem;
  isActive: boolean;
  onSelect: (orderId: string) => void;
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

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderCard({ order, isActive, onSelect }: OrderCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(order.orderId)}
      className={`w-full rounded-[28px] border p-4 text-left shadow-sm transition ${
        isActive
          ? 'border-amber-400 bg-amber-50 shadow-amber-100'
          : 'border-stone-200 bg-white shadow-stone-950/5'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Siparis
          </p>
          <h3 className="mt-2 text-lg font-semibold text-stone-950">{order.tableName}</h3>
          <p className="mt-1 text-sm text-stone-500">#{order.orderId.slice(0, 8)}</p>
        </div>

        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
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
  );
}
