import OrderCard from '../components/OrderCard';
import type { Order } from '../types/order';

// Backend bağlanana kadar kasiyer ekranının çalışır görünmesi için örnek siparişler.
const orders: Order[] = [
  {
    id: 1001,
    tableName: 'Masa 4',
    totalPrice: 490,
    status: 'pending',
    createdAt: '12:35',
  },
  {
    id: 1002,
    tableName: 'Masa 2',
    totalPrice: 245,
    status: 'preparing',
    createdAt: '12:41',
  },
];

// OrdersPage kasiyer tarafının ana sipariş takip ekranıdır.
export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Siparişler</h2>
        <p className="text-sm leading-6 text-gray-600">
          Açık siparişleri takip edin ve ödeme durumlarını yönetin.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </section>
    </div>
  );
}
