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
