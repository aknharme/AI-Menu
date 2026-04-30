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
  const response = await api.post<{
    intent: string;
    reply: string;
    suggestedProducts: Array<{
      id?: string;
      productId?: string;
      name: string;
      price: number;
      description: string;
    }>;
  }>('/ai/message', {
    restaurantId,
    message: prompt,
  });

  return {
    restaurantId,
    tags: [],
    isFallback: false,
    message: response.data.reply,
    products: response.data.suggestedProducts
      .map((product) => ({
        productId: product.id ?? product.productId ?? '',
        name: product.name,
        price: product.price,
        description: product.description,
      }))
      .filter((product) => product.productId),
  } satisfies RecommendationResponse;
}
