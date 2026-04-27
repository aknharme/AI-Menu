import api from './api';
import type { MenuResponse, ProductDetail, RecommendationResponse } from '../types/menu';

export async function getMenu(restaurantId: string) {
  const response = await api.get<MenuResponse>(`/menu/${restaurantId}`);
  return response.data;
}

export async function getProductDetail(restaurantId: string, productId: string) {
  const response = await api.get<ProductDetail>(`/menu/${restaurantId}/products/${productId}`);
  return response.data;
}

export async function getRecommendationsByPrompt(restaurantId: string, prompt: string) {
  // Prompt once backend AI akisina gider, sonra ayni istek icinde urun filtrelemesi tamamlanir.
  const response = await api.post<RecommendationResponse>('/recommendation/prompt', {
    restaurantId,
    prompt,
  });

  return response.data;
}
