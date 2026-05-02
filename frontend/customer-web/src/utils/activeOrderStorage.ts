import type { OrderResponse } from '../types/order';

export type StoredActiveOrder = {
  orderId: string;
  restaurantId: string;
  tableId: string;
  status: string;
  totalAmount: number;
  createdAtUtc: string;
};

const STORAGE_PREFIX = 'customer-active-order';
const STORAGE_EVENT = 'customer-active-order-changed';

function buildStorageKey(restaurantId?: string, tableId?: string) {
  return `${STORAGE_PREFIX}:${restaurantId ?? 'unknown'}:${tableId ?? 'unknown'}`;
}

function notifyStorageChange() {
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

export function getActiveOrderStorageEventName() {
  return STORAGE_EVENT;
}

export function getStoredActiveOrder(restaurantId?: string, tableId?: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(buildStorageKey(restaurantId, tableId));
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredActiveOrder;
  } catch {
    window.localStorage.removeItem(buildStorageKey(restaurantId, tableId));
    return null;
  }
}

export function saveActiveOrder(order: OrderResponse) {
  if (typeof window === 'undefined') {
    return;
  }

  const value: StoredActiveOrder = {
    orderId: order.orderId,
    restaurantId: order.restaurantId,
    tableId: order.tableId,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAtUtc: order.createdAtUtc,
  };

  window.localStorage.setItem(
    buildStorageKey(order.restaurantId, order.tableId),
    JSON.stringify(value),
  );
  notifyStorageChange();
}

export function clearActiveOrder(restaurantId?: string, tableId?: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(buildStorageKey(restaurantId, tableId));
  notifyStorageChange();
}
