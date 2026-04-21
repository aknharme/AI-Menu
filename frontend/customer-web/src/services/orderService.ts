import api from './api';
import type { CreateOrderRequest, OrderResponse } from '../types/order';

export async function createOrder(payload: CreateOrderRequest) {
  const response = await api.post<OrderResponse>('/orders', payload);
  return response.data;
}

export async function getOrder(orderId: string) {
  const response = await api.get<OrderResponse>(`/orders/${orderId}`);
  return response.data;
}
