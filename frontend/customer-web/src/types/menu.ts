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
  imageUrl?: string;
  photoUrl?: string;
  thumbnailUrl?: string;
  allergens: string[];
  tags: string[];
  variants: ProductVariant[];
};

// RecommendationProduct, onerilen urun karti icin gereken sade backend cevabini temsil eder.
export type RecommendationProduct = {
  productId: string;
  name: string;
  price: number;
  description: string;
};

// RecommendationResponse, AI tag cikarma ve fallback bilgisini frontend'e tasir.
export type RecommendationResponse = {
  restaurantId: string;
  tags: string[];
  isFallback: boolean;
  message: string;
  products: RecommendationProduct[];
};

export type MenuQueryParams = {
  restaurantId?: string;
  tableId?: string;
};
