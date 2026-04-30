// AdminCategory, kategori listeleme ve form ekranlarinda kullanilan API modelidir.
export type AdminCategory = {
  categoryId: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
};

// SaveAdminCategoryRequest, kategori create ve update isteklerinde kullanilir.
export type SaveAdminCategoryRequest = {
  restaurantId: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
};

// AdminProduct, urun listesinde ve duzenleme formunda gereken alanlari tasir.
export type AdminProduct = {
  productId: string;
  restaurantId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  price: number;
  description: string;
  content: string;
  tags: string[];
  isActive: boolean;
};

// SaveAdminProductRequest, urun create ve update isteklerinde kullanilir.
export type SaveAdminProductRequest = {
  restaurantId: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  content: string;
  tags: string[];
  isActive: boolean;
};

// AdminTable, masa ve QR yonetimi ekraninda kullanilan API modelidir.
export type AdminTable = {
  tableId: string;
  restaurantId: string;
  name: string;
  isActive: boolean;
  menuUrl: string;
};

// SaveAdminTableRequest, masa create ve update isteklerinde kullanilir.
export type SaveAdminTableRequest = {
  restaurantId: string;
  name: string;
  isActive: boolean;
};

// DashboardSummary, admin panelin ozet kartlari ve liste bloklari icin gerekli toplu response modelidir.
export type DashboardSummary = {
  restaurantId: string;
  date?: string | null;
  totalOrderCount: number;
  pendingOrderCount: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  popularProducts: TopProduct[];
  topRecommendedProducts: RecommendationStat[];
};

// TopProduct, en cok siparis edilen veya gunun populer urunlerini ayni tip ile temsil eder.
export type TopProduct = {
  productId: string;
  name: string;
  count: number;
};

// RecentOrder, dashboard'da gosterilen son siparisler satirini tasir.
export type RecentOrder = {
  orderId: string;
  tableId: string;
  tableName: string;
  status: string;
  totalAmount: number;
  createdAtUtc: string;
};

// RecommendationStat, onerilerde en cok gecen urunlerin toplamini gosterir.
export type RecommendationStat = {
  productId: string;
  name: string;
  recommendationCount: number;
};

export type AdminAiGroundedProduct = {
  productId: string;
  name: string;
  categoryName: string;
  price: number;
  description: string;
  tags: string[];
};

export type AdminAiTestResponse = {
  intent: string;
  queryType: string;
  hasSpecificGrounding: boolean;
  reply: string;
  groundedProducts: AdminAiGroundedProduct[];
};
