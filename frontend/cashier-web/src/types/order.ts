export type CashierOrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Paid' | string;

export type CashierOrderListItem = {
  orderId: string;
  restaurantId: string;
  tableId: string;
  tableName: string;
  status: CashierOrderStatus;
  createdAtUtc: string;
  totalAmount: number;
  itemCount: number;
};

export type CashierOrderItem = {
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  note: string;
  variantName: string;
  unitPrice: number;
  lineTotal: number;
};

export type CashierOrderDetail = {
  orderId: string;
  restaurantId: string;
  tableId: string;
  tableName: string;
  customerName: string;
  note: string;
  status: CashierOrderStatus;
  createdAtUtc: string;
  totalAmount: number;
  items: CashierOrderItem[];
};
