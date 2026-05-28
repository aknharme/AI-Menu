const CASHIER_ACTIVITY_LOG_KEY = 'aimenu_cashier_activity_logs';
const ORDER_STATUS_OVERRIDE_KEY = 'aimenu_order_status_overrides';
const LEGACY_CASHIER_STATUS_OVERRIDE_KEY = 'aimenu_cashier_status_overrides';
const CUSTOMER_ACTIVE_ORDER_KEY = 'aimenu_customer_active_orders';
const MAX_LOG_COUNT = 1000;

type CashierActivityLogEntry = {
  id: string;
  restaurantId: string;
  orderId: string;
  message: string;
  reason?: string;
  createdAtUtc: string;
};

type CashierStatusOverrideMap = Record<string, string>;
type CustomerActiveOrderMap = Record<string, string>;

function createLogId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLogs() {
  try {
    const rawLogs = localStorage.getItem(CASHIER_ACTIVITY_LOG_KEY);
    const logs = rawLogs ? JSON.parse(rawLogs) : [];
    return Array.isArray(logs) ? (logs as CashierActivityLogEntry[]) : [];
  } catch {
    return [];
  }
}

function getStatusOverrideKey(restaurantId: string, orderId: string) {
  return `${restaurantId}:${orderId}`;
}

function getCustomerActiveOrderKey(restaurantId: string, tableId: string) {
  return `${restaurantId}:${tableId}`;
}

function readStatusOverrides() {
  try {
    const rawOverrides = localStorage.getItem(ORDER_STATUS_OVERRIDE_KEY);
    const rawLegacyOverrides = localStorage.getItem(LEGACY_CASHIER_STATUS_OVERRIDE_KEY);
    const overrides = rawOverrides ? JSON.parse(rawOverrides) : {};
    const legacyOverrides = rawLegacyOverrides ? JSON.parse(rawLegacyOverrides) : {};

    if (!overrides || typeof overrides !== 'object') {
      return legacyOverrides && typeof legacyOverrides === 'object'
        ? (legacyOverrides as CashierStatusOverrideMap)
        : {};
    }

    return overrides && typeof overrides === 'object'
      ? {
          ...(legacyOverrides && typeof legacyOverrides === 'object' ? legacyOverrides : {}),
          ...overrides,
        } as CashierStatusOverrideMap
      : {};
  } catch {
    return {};
  }
}

function readCustomerActiveOrders() {
  try {
    const rawOrders = localStorage.getItem(CUSTOMER_ACTIVE_ORDER_KEY);
    const orders = rawOrders ? JSON.parse(rawOrders) : {};
    return orders && typeof orders === 'object' ? (orders as CustomerActiveOrderMap) : {};
  } catch {
    return {};
  }
}

export function addCashierActivityLogs(
  entries: Array<Omit<CashierActivityLogEntry, 'id' | 'createdAtUtc'>>,
) {
  const createdAtUtc = new Date().toISOString();
  const nextLogs = entries.map((entry) => ({
    ...entry,
    id: createLogId(),
    createdAtUtc,
  }));

  // Frontend-only isteklerde iptal sebebi API'ye ek alan gondermeden burada saklanir.
  localStorage.setItem(
    CASHIER_ACTIVITY_LOG_KEY,
    JSON.stringify([...nextLogs, ...readLogs()].slice(0, MAX_LOG_COUNT)),
  );
}

export function getCashierOrderStatusOverride(restaurantId: string, orderId: string) {
  return readStatusOverrides()[getStatusOverrideKey(restaurantId, orderId)] ?? null;
}

export function saveCashierOrderStatusOverride(restaurantId: string, orderId: string, status: string) {
  localStorage.setItem(
    ORDER_STATUS_OVERRIDE_KEY,
    JSON.stringify({
      ...readStatusOverrides(),
      [getStatusOverrideKey(restaurantId, orderId)]: status,
    }),
  );
}

export function clearCustomerActiveOrder(restaurantId: string, tableId: string) {
  const currentOrders = readCustomerActiveOrders();
  const activeOrderKey = getCustomerActiveOrderKey(restaurantId, tableId);

  if (!currentOrders[activeOrderKey]) {
    return;
  }

  const nextOrders = { ...currentOrders };
  delete nextOrders[activeOrderKey];
  localStorage.setItem(CUSTOMER_ACTIVE_ORDER_KEY, JSON.stringify(nextOrders));
}
