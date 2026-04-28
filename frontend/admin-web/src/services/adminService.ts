import api from './api';
import type {
  AdminCategory,
  DashboardSummary,
  AdminProduct,
  RecommendationStat,
  RecentOrder,
  AdminTable,
  SaveAdminCategoryRequest,
  SaveAdminProductRequest,
  SaveAdminTableRequest,
  TopProduct,
} from '../types/admin';

// Admin API service layer, tum kategori, urun ve masa CRUD isteklerini merkezden yonetir.
export async function getCategories(restaurantId: string) {
  const response = await api.get<AdminCategory[]>(`/admin/categories/${restaurantId}`);
  return response.data;
}

export async function createCategory(request: SaveAdminCategoryRequest) {
  const response = await api.post<AdminCategory>('/admin/categories', request);
  return response.data;
}

export async function updateCategory(categoryId: string, request: SaveAdminCategoryRequest) {
  const response = await api.put<AdminCategory>(`/admin/categories/${categoryId}`, request);
  return response.data;
}

export async function deleteCategory(categoryId: string) {
  await api.delete(`/admin/categories/${categoryId}`);
}

export async function getProducts(restaurantId: string) {
  const response = await api.get<AdminProduct[]>(`/admin/products/${restaurantId}`);
  return response.data;
}

export async function createProduct(request: SaveAdminProductRequest) {
  const response = await api.post<AdminProduct>('/admin/products', request);
  return response.data;
}

export async function updateProduct(productId: string, request: SaveAdminProductRequest) {
  const response = await api.put<AdminProduct>(`/admin/products/${productId}`, request);
  return response.data;
}

export async function deleteProduct(productId: string) {
  await api.delete(`/admin/products/${productId}`);
}

export async function getTables(restaurantId: string) {
  const response = await api.get<AdminTable[]>(`/admin/tables/${restaurantId}`);
  return response.data;
}

export async function createTable(request: SaveAdminTableRequest) {
  const response = await api.post<AdminTable>('/admin/tables', request);
  return response.data;
}

export async function updateTable(tableId: string, request: SaveAdminTableRequest) {
  const response = await api.put<AdminTable>(`/admin/tables/${tableId}`, request);
  return response.data;
}

export async function deleteTable(tableId: string) {
  await api.delete(`/admin/tables/${tableId}`);
}

export async function getDashboard(restaurantId: string, date?: string) {
  const response = await api.get<DashboardSummary>(`/admin/dashboard/${restaurantId}`, {
    params: date ? { date } : undefined,
  });
  return response.data;
}

export async function getTopProducts(restaurantId: string, date?: string) {
  const response = await api.get<TopProduct[]>(`/admin/stats/top-products/${restaurantId}`, {
    params: date ? { date } : undefined,
  });
  return response.data;
}

export async function getRecommendationStats(restaurantId: string, date?: string) {
  const response = await api.get<RecommendationStat[]>(
    `/admin/stats/recommendations/${restaurantId}`,
    {
      params: date ? { date } : undefined,
    },
  );
  return response.data;
}

export async function getRecentOrders(restaurantId: string, date?: string) {
  const response = await api.get<RecentOrder[]>(`/admin/stats/recent-orders/${restaurantId}`, {
    params: date ? { date } : undefined,
  });
  return response.data;
}
