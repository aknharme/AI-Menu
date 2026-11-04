import api from './api';
import type { MenuResponse, ProductDetail } from '../types/menu';

export async function getMenu(restaurantId: string, tableId?: string) {
  const response = await api.get<MenuResponse>(`/menu/${restaurantId}`, { params: { tableId } });
  return response.data;
}

export async function getProductDetail(restaurantId: string, productId: string) {
  const response = await api.get<ProductDetail>(`/menu/${restaurantId}/products/${productId}`);
  return response.data;
}

