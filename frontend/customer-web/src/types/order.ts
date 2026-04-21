export type CreateOrderItemRequest = {
  productId: string;
  quantity: number;
  variantId?: string;
  note: string;
};

export type CreateOrderRequest = {
  restaurantId: string;
  tableId: string;
  customerName: string;
  note: string;
  items: CreateOrderItemRequest[];
};

export type OrderItemResponse = {
  orderItemId: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName: string;
  note: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderResponse = {
  orderId: string;
  restaurantId: string;
  tableId: string;
  customerName: string;
  note: string;
  status: string;
  totalAmount: number;
  createdAtUtc: string;
  items: OrderItemResponse[];
};

export type CartItem = {
  cartItemId: string;
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  note: string;
  basePrice: number;
  variantId?: string;
  variantName: string;
};

export type AddToCartInput = {
  productId: string;
  productName: string;
  categoryName: string;
  basePrice: number;
  quantity: number;
  note: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
};
