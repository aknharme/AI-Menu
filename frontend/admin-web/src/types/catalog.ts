export type AdminCategory = {
  categoryId: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
};

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

export type CategoryFormValues = {
  restaurantId: string;
  name: string;
  displayOrder: string;
  isActive: boolean;
};

export type ProductFormValues = {
  restaurantId: string;
  name: string;
  price: string;
  categoryId: string;
  description: string;
  content: string;
  isActive: boolean;
};
