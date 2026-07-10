import api from './api';
import type { AdminTable, TableFormValues } from '../types/table';

export async function getTables(restaurantId: string) {
  const response = await api.get<AdminTable[]>(`/admin/catalog/tables/${restaurantId}`);
  return response.data;
}

export async function createTable(payload: TableFormValues) {
  const response = await api.post<AdminTable>('/admin/catalog/tables', {
    restaurantId: payload.restaurantId,
    name: payload.name,
    isActive: payload.isActive,
  });

  return response.data;
}

export async function updateTable(tableId: string, payload: TableFormValues) {
  const response = await api.put<AdminTable>(`/admin/catalog/tables/${tableId}`, {
    restaurantId: payload.restaurantId,
    name: payload.name,
    isActive: payload.isActive,
  });

  return response.data;
}

export async function deleteTable(tableId: string) {
  await api.delete(`/admin/catalog/tables/${tableId}`);
}
