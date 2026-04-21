import { useEffect, useState } from 'react';
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getCategories,
  getProducts,
  updateCategory,
  updateProduct,
} from '../services/catalogService';
import type {
  AdminCategory,
  AdminProduct,
  CategoryFormValues,
  ProductFormValues,
} from '../types/catalog';

type UseCatalogManagementOptions = {
  restaurantId: string;
};

export function useCatalogManagement({ restaurantId }: UseCatalogManagementOptions) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    if (!restaurantId) {
      setLoading(false);
      setError('Restoran bilgisi bulunamadi. restaurantId ile acmayi deneyin.');
      setCategories([]);
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [categoryData, productData] = await Promise.all([
        getCategories(restaurantId),
        getProducts(restaurantId),
      ]);
      setCategories(categoryData);
      setProducts(productData);
    } catch {
      setError('Kategori ve urun verileri yuklenemedi.');
      setCategories([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [restaurantId]);

  return {
    categories,
    products,
    loading,
    error,
    reload,
    createCategory: async (values: CategoryFormValues) => {
      await createCategory(values);
      await reload();
    },
    updateCategory: async (categoryId: string, values: CategoryFormValues) => {
      await updateCategory(categoryId, values);
      await reload();
    },
    deleteCategory: async (categoryId: string) => {
      await deleteCategory(categoryId);
      await reload();
    },
    createProduct: async (values: ProductFormValues) => {
      await createProduct(values);
      await reload();
    },
    updateProduct: async (productId: string, values: ProductFormValues) => {
      await updateProduct(productId, values);
      await reload();
    },
    deleteProduct: async (productId: string) => {
      await deleteProduct(productId);
      await reload();
    },
  };
}
