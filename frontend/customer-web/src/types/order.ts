export type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type CreateOrderItemRequest = {
  productId: string;
  quantity: number;
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
