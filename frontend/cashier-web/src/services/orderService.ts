import api from './api';
import type { CashierOrderDetail, CashierOrderListItem } from '../types/order';

export async function getCashierOrders(restaurantId: string) {
  const response = await api.get<CashierOrderListItem[]>(`/cashier/orders/${restaurantId}`);
  return response.data;
}

export async function getCashierOrderDetail(restaurantId: string, orderId: string) {
  const response = await api.get<CashierOrderDetail>(`/cashier/orders/${restaurantId}/${orderId}`);
  return response.data;
}
