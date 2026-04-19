import type { Order } from '../types/order';

type OrderCardProps = {
  order: Order;
};

// Backend durum kodlarını kullanıcıya gösterilecek Türkçe metinlere çevirir.
const statusLabels: Record<Order['status'], string> = {
  pending: 'Bekliyor',
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  paid: 'Ödendi',
};

// OrderCard tek bir siparişin masa, durum, saat ve tutar bilgisini gösterir.
export default function OrderCard({ order }: OrderCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Sipariş #{order.id}</p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900">
            {order.tableName}
          </h2>
        </div>
        <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-sm text-gray-500">{order.createdAt}</span>
        <span className="text-base font-semibold text-gray-900">
          {order.totalPrice.toLocaleString('tr-TR')} TL
        </span>
      </div>
    </article>
  );
}
