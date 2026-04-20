import { useEffect, useMemo, useState } from 'react';
import { getMenu, getProductDetail } from '../services/menuService';
import type {
  MenuCategory,
  MenuResponse,
  ProductDetail,
  ProductListItem,
} from '../types/menu';

type UseMenuOptions = {
  restaurantId?: string;
};

export function useMenu({ restaurantId }: UseMenuOptions) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [productDetailLoading, setProductDetailLoading] = useState(false);
  const [productDetailError, setProductDetailError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      if (!restaurantId) {
        setLoading(false);
        setError('Restoran bilgisi bulunamadı. QR kodunu tekrar okutun.');
        setMenu(null);
        setCategories([]);
        setProducts([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getMenu(restaurantId);

        if (!isMounted) {
          return;
        }

        const activeCategories = data.categories.filter((category) => category.products.length > 0);

        setMenu(data);
        setCategories(activeCategories);
        setProducts(activeCategories.flatMap((category) => category.products));
      } catch {
        if (!isMounted) {
          return;
        }

        setError('Menü yüklenemedi. Lütfen birazdan tekrar deneyin.');
        setMenu(null);
        setCategories([]);
        setProducts([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  useEffect(() => {
    let isMounted = true;

    async function loadProductDetail() {
      if (!restaurantId || !selectedProduct) {
        setProductDetail(null);
        setProductDetailError(null);
        setProductDetailLoading(false);
        return;
      }

      try {
        setProductDetailLoading(true);
        setProductDetailError(null);
        const detail = await getProductDetail(restaurantId, selectedProduct.productId);

        if (isMounted) {
          setProductDetail(detail);
        }
      } catch {
        if (isMounted) {
          setProductDetail(null);
          setProductDetailError('Ürün detayı şu anda getirilemedi.');
        }
      } finally {
        if (isMounted) {
          setProductDetailLoading(false);
        }
      }
    }

    loadProductDetail();

    return () => {
      isMounted = false;
    };
  }, [restaurantId, selectedProduct]);

  const featuredCategory = useMemo(() => categories[0] ?? null, [categories]);

  return {
    loading,
    error,
    menu,
    categories,
    products,
    selectedProduct,
    setSelectedProduct,
    productDetail,
    productDetailLoading,
    productDetailError,
    featuredCategory,
  };
}
