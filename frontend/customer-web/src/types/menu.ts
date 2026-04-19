// Menü listesinde kart olarak gösterilecek aktif ürünün backend response tipi.
export type ProductListItem = {
  productId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
};

// Backend menüyü kategori bazlı döndürdüğü için frontend de aynı yapıyı kullanır.
export type MenuCategory = {
  categoryId: string;
  name: string;
  displayOrder: number;
  products: ProductListItem[];
};

// GET /api/menu/{restaurantId} endpoint'inin müşteri tarafındaki ana response tipi.
export type MenuResponse = {
  restaurantId: string;
  restaurantName: string;
  categories: MenuCategory[];
};

// Menü isteğinde restoran ve masa bilgileri opsiyonel query param olarak taşınır.
export type MenuQueryParams = {
  restaurantId?: string;
  tableId?: string;
};
