export type ProductListItem = {
  productId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  photoUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
};

export type MenuCategory = {
  categoryId: string;
  parentCategoryId?: string | null;
  name: string;
  displayOrder: number;
  products: ProductListItem[];
  subCategories?: MenuCategory[];
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
  imageUrl?: string;
  photoUrl?: string;
  thumbnailUrl?: string;
  allergens: string[];
  tags: string[];
  variants: ProductVariant[];
};

export type MenuQueryParams = {
  restaurantId?: string;
  tableId?: string;
};
