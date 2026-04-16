import api from './api';
import type { MenuItem, MenuQueryParams } from '../types/menu';

// Menü verisini backend'deki /menu endpoint'inden query param desteğiyle çeker.
export async function getMenu(params: MenuQueryParams = {}) {
  const response = await api.get<MenuItem[]>('/menu', { params });
  return response.data;
}
