// Kasiyer ekranında gösterilecek sipariş durumları.
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'paid';

// Sipariş kartlarının ihtiyaç duyduğu temel veri modeli.
export type Order = {
  id: number;
  tableName: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
};
