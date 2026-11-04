import { useEffect, useMemo, useState } from 'react';
import { getMenu, getProductDetail } from '../services/menuService';
import type { MenuCategory, MenuResponse, ProductDetail, ProductListItem } from '../types/menu';

function flattenCategoryProducts(categories: MenuCategory[]): ProductListItem[] {
  return categories.flatMap(category => [
    ...category.products,
    ...flattenCategoryProducts(category.subCategories ?? []),
  ]);
}

export function useMenu({ restaurantId, tableId }: { restaurantId?: string; tableId?: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [productDetailLoading, setProductDetailLoading] = useState(false);
  const [productDetailError, setProductDetailError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setMenu(null);
    setSelectedProduct(null);
    setError(null);
    setLoading(true);
    if (!restaurantId) {
      setError('Restoran bilgisi bulunamadı. Lütfen QR kodu tekrar okutun.');
      setLoading(false);
      return;
    }
    getMenu(restaurantId, tableId)
      .then(data => { if (active) setMenu(data); })
      .catch(() => {
        if (active) setError('Menüye ulaşılamıyor. Lütfen bağlantınızı kontrol edip sayfayı yenileyin.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [restaurantId, tableId]);

  useEffect(() => {
    let active = true;
    setProductDetail(null);
    setProductDetailError(null);
    if (!restaurantId || !selectedProduct) {
      setProductDetailLoading(false);
      return;
    }
    setProductDetailLoading(true);
    getProductDetail(restaurantId, selectedProduct.productId)
      .then(detail => { if (active) setProductDetail(detail); })
      .catch(() => { if (active) setProductDetailError('Ürün detayı şu anda getirilemedi.'); })
      .finally(() => { if (active) setProductDetailLoading(false); });
    return () => { active = false; };
  }, [restaurantId, selectedProduct]);

  const categories = useMemo(() => menu?.categories ?? [], [menu]);
  const products = useMemo(() => flattenCategoryProducts(categories), [categories]);
  return {
    loading, error, menu, categories, products, selectedProduct, setSelectedProduct,
    productDetail, productDetailLoading, productDetailError, featuredCategory: categories[0] ?? null,
  };
}
