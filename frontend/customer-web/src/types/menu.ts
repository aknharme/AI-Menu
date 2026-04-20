export type ProductListItem = {
  productId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
};

export type MenuCategory = {
  categoryId: string;
  name: string;
  displayOrder: number;
  products: ProductListItem[];
};

export type MenuResponse = {
  restaurantId: string;
  restaurantName: string;
  categories: MenuCategory[];
};

export type ProductVariant = {
  productVariantId: string;
  name: string;
  priceDelta: number;
  finalPrice: number;
};

export type ProductDetail = {
  productId: string;
  restaurantId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  allergens: string[];
  tags: string[];
  variants: ProductVariant[];
};

export type MenuQueryParams = {
  restaurantId?: string;
  tableId?: string;
};
