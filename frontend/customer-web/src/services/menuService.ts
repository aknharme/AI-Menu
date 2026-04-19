import api from './api';
import type { MenuQueryParams, MenuResponse } from '../types/menu';

// QR parametresi yokken local test için seed edilen demo restoran kullanılır.
const demoRestaurantId = '11111111-1111-1111-1111-111111111111';

// Menü verisini backend'deki restaurantId bazlı endpoint'ten çeker.
export async function getMenu(params: MenuQueryParams = {}) {
  // Backend restaurantId'yi route üzerinden beklediği için query param yerine URL path kullanıyoruz.
  const restaurantId = params.restaurantId ?? demoRestaurantId;
  const response = await api.get<MenuResponse>(`/menu/${restaurantId}`);
  return response.data;
}
