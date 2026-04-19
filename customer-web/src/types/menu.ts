// Backend'den gelen menü ürününün frontend tarafındaki tipi.
export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
  categoryName: string;
};

// Menü isteğinde restoran ve masa bilgileri opsiyonel query param olarak taşınır.
export type MenuQueryParams = {
  restaurantId?: string;
  tableId?: string;
};
