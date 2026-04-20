import api from './api';
import type { CreateOrderRequest, OrderResponse } from '../types/order';

export async function createOrder(request: CreateOrderRequest) {
  const response = await api.post<OrderResponse>('/orders', request);
  return response.data;
}
