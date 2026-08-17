// AdminCategory, kategori listeleme ve form ekranlarinda kullanilan API modelidir.
export type AdminCategory = {
  categoryId: string;
  restaurantId: string;
  parentCategoryId: string | null;
  parentCategoryName: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  subCategoryCount: number;
  productCount: number;
};

// SaveAdminCategoryRequest, kategori create ve update isteklerinde kullanilir.
export type SaveAdminCategoryRequest = {
  restaurantId: string;
  parentCategoryId?: string | null;
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
  parentCategoryId: string | null;
  parentCategoryName: string;
  name: string;
  price: number;
  description: string;
  content: string;
  calories: number | null;
  preparationTimeMinutes: number | null;
  allergens: string[];
  tags: string[];
  variants: AdminProductVariant[];
  isActive: boolean;
};

export type AdminProductVariant = {
  productVariantId: string;
  name: string;
  priceDelta: number;
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
  calories: number | null;
  preparationTimeMinutes: number | null;
  allergens: string[];
  tags: string[];
  variants: SaveAdminProductVariantRequest[];
  isActive: boolean;
};

export type SaveAdminProductVariantRequest = {
  productVariantId?: string;
  name: string;
  priceDelta: number;
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
  paidOrderCount: number;
  revenue: number;
  activeOrderValue: number;
  cancelledOrderValue: number;
  averagePaidOrderValue: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  popularProducts: TopProduct[];
};

// TopProduct, en cok siparis edilen veya gunun populer urunlerini ayni tip ile temsil eder.
export type TopProduct = {
  productId: string;
  name: string;
  count: number;
  revenue: number;
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

// OrderStatusLog, admin panelde siparis durum gecmisini gosteren API modelidir.
export type OrderStatusLog = {
  id: string;
  restaurantId: string;
  orderId: string;
  tableName: string;
  orderTotalAmount: number;
  oldStatus: string | null;
  newStatus: string;
  changedByUserId: string | null;
  changedAt: string;
};

export type AdminOrderStatus =
  | 'Pending'
  | 'Preparing'
  | 'Ready'
  | 'Paid'
  | 'Cancelled'
  | string;

export type AdminOrderListItem = {
  orderId: string;
  restaurantId: string;
  tableId: string;
  tableName: string;
  status: AdminOrderStatus;
  createdAtUtc: string;
  totalAmount: number;
  itemCount: number;
};

export type AdminOrderItem = {
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  note: string;
  variantName: string;
  unitPrice: number;
  lineTotal: number;
};

export type AdminOrderDetail = {
  orderId: string;
  restaurantId: string;
  tableId: string;
  tableName: string;
  customerName: string;
  note: string;
  status: AdminOrderStatus;
  createdAtUtc: string;
  totalAmount: number;
  items: AdminOrderItem[];
};
