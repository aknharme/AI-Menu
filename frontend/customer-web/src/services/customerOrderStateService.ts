export const CUSTOMER_ACTIVE_ORDER_KEY = 'aimenu_customer_active_orders';
export const ORDER_STATUS_OVERRIDE_KEY = 'aimenu_order_status_overrides';
export const LEGACY_CASHIER_STATUS_OVERRIDE_KEY = 'aimenu_cashier_status_overrides';

type StringMap = Record<string, string>;

function getActiveOrderKey(restaurantId: string, tableId: string) {
  return `${restaurantId}:${tableId}`;
}

function getStatusOverrideKey(restaurantId: string, orderId: string) {
  return `${restaurantId}:${orderId}`;
}

function readStringMap(storageKey: string) {
  try {
    const rawValue = localStorage.getItem(storageKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : {};
    return parsedValue && typeof parsedValue === 'object' ? (parsedValue as StringMap) : {};
  } catch {
    return {};
  }
}

export function getActiveCustomerOrderId(restaurantId: string, tableId: string) {
  return readStringMap(CUSTOMER_ACTIVE_ORDER_KEY)[getActiveOrderKey(restaurantId, tableId)] ?? null;
}

export function saveActiveCustomerOrder(restaurantId: string, tableId: string, orderId: string) {
  localStorage.setItem(
    CUSTOMER_ACTIVE_ORDER_KEY,
    JSON.stringify({
      ...readStringMap(CUSTOMER_ACTIVE_ORDER_KEY),
      [getActiveOrderKey(restaurantId, tableId)]: orderId,
    }),
  );
}

export function clearActiveCustomerOrder(restaurantId: string, tableId: string) {
  const activeOrders = readStringMap(CUSTOMER_ACTIVE_ORDER_KEY);
  const activeOrderKey = getActiveOrderKey(restaurantId, tableId);

  if (!activeOrders[activeOrderKey]) {
    return;
  }

  const nextActiveOrders = { ...activeOrders };
  delete nextActiveOrders[activeOrderKey];
  localStorage.setItem(CUSTOMER_ACTIVE_ORDER_KEY, JSON.stringify(nextActiveOrders));
}

export function getCustomerOrderStatusOverride(restaurantId: string, orderId: string) {
  const currentOverrides = readStringMap(ORDER_STATUS_OVERRIDE_KEY);
  const legacyOverrides = readStringMap(LEGACY_CASHIER_STATUS_OVERRIDE_KEY);
  return currentOverrides[getStatusOverrideKey(restaurantId, orderId)]
    ?? legacyOverrides[getStatusOverrideKey(restaurantId, orderId)]
    ?? null;
}
