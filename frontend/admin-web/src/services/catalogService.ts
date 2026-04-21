import api from './api';
import type {
  AdminCategory,
  AdminProduct,
  CategoryFormValues,
  ProductFormValues,
} from '../types/catalog';

export async function getCategories(restaurantId: string) {
  const response = await api.get<AdminCategory[]>(`/admin/categories/${restaurantId}`);
  return response.data;
}

export async function createCategory(payload: CategoryFormValues) {
  const response = await api.post<AdminCategory>('/admin/categories', {
    restaurantId: payload.restaurantId,
    name: payload.name,
    displayOrder: Number(payload.displayOrder),
    isActive: payload.isActive,
  });

  return response.data;
}

export async function updateCategory(categoryId: string, payload: CategoryFormValues) {
  const response = await api.put<AdminCategory>(`/admin/categories/${categoryId}`, {
    restaurantId: payload.restaurantId,
    name: payload.name,
    displayOrder: Number(payload.displayOrder),
    isActive: payload.isActive,
  });

  return response.data;
}

export async function deleteCategory(categoryId: string) {
  await api.delete(`/admin/categories/${categoryId}`);
}

export async function getProducts(restaurantId: string) {
  const response = await api.get<AdminProduct[]>(`/admin/products/${restaurantId}`);
  return response.data;
}

export async function createProduct(payload: ProductFormValues) {
  const response = await api.post<AdminProduct>('/admin/products', {
    restaurantId: payload.restaurantId,
    name: payload.name,
    price: Number(payload.price),
    categoryId: payload.categoryId,
    description: payload.description,
    content: payload.content,
    isActive: payload.isActive,
  });

  return response.data;
}

export async function updateProduct(productId: string, payload: ProductFormValues) {
  const response = await api.put<AdminProduct>(`/admin/products/${productId}`, {
    restaurantId: payload.restaurantId,
    name: payload.name,
    price: Number(payload.price),
    categoryId: payload.categoryId,
    description: payload.description,
    content: payload.content,
    isActive: payload.isActive,
  });

  return response.data;
}

export async function deleteProduct(productId: string) {
  await api.delete(`/admin/products/${productId}`);
}
