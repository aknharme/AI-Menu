import { useEffect, useState } from 'react';
import { getCashierOrderDetail, getCashierOrders, updateCashierOrderStatus } from '../services/orderService';
import {
  addCashierActivityLogs,
  clearCustomerActiveOrder,
  getCashierOrderStatusOverride,
  saveCashierOrderStatusOverride,
} from '../services/cashierActivityLogService';
import type { CashierOrderDetail, CashierOrderListItem } from '../types/order';
import { extractApiErrorMessage } from '../utils/apiError';

type UseCashierOrdersOptions = {
  restaurantId: string;
};

export function useCashierOrders({ restaurantId }: UseCashierOrdersOptions) {
  const [orders, setOrders] = useState<CashierOrderListItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CashierOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [statusUpdatingOrderId, setStatusUpdatingOrderId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  function updateOrderStatusInState(orderId: string, updatedOrder: CashierOrderDetail) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.orderId === orderId
          ? {
              ...order,
              status: updatedOrder.status,
              totalAmount: updatedOrder.totalAmount,
              itemCount: updatedOrder.items.length,
            }
          : order,
      ),
    );

    setSelectedOrder((currentOrder) =>
      currentOrder?.orderId === orderId ? { ...currentOrder, ...updatedOrder } : currentOrder,
    );
  }

  function updateOrderStatusLocally(orderId: string, status: string) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.orderId === orderId
          ? {
              ...order,
              status,
            }
          : order,
      ),
    );

    setSelectedOrder((currentOrder) =>
      currentOrder?.orderId === orderId ? { ...currentOrder, status } : currentOrder,
    );
  }

  function applyLocalStatusOverride<T extends CashierOrderListItem | CashierOrderDetail>(order: T) {
    const localStatus = getCashierOrderStatusOverride(order.restaurantId, order.orderId);
    return localStatus ? { ...order, status: localStatus } : order;
  }

  function findOrderTableId(orderId: string) {
    if (selectedOrder?.orderId === orderId) {
      return selectedOrder.tableId;
    }

    return orders.find((order) => order.orderId === orderId)?.tableId ?? null;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      if (!restaurantId) {
        setLoading(false);
        setError('Restoran bilgisi bulunamadi. restaurantId ile acmayi deneyin.');
        setOrders([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getCashierOrders(restaurantId);

        if (!isMounted) {
          return;
        }

        setOrders(data.map((order) => applyLocalStatusOverride(order)));
        setSelectedOrderId((current) => current ?? data[0]?.orderId ?? null);
      } catch {
        if (!isMounted) {
          return;
        }

        setError('Siparis listesi yuklenemedi. Lutfen tekrar deneyin.');
        setOrders([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      if (!restaurantId || !selectedOrderId) {
        setSelectedOrder(null);
        setDetailError(null);
        setDetailLoading(false);
        return;
      }

      try {
        setDetailLoading(true);
        setDetailError(null);
        const detail = await getCashierOrderDetail(restaurantId, selectedOrderId);

        if (isMounted) {
          setSelectedOrder(applyLocalStatusOverride(detail));
        }
      } catch {
        if (isMounted) {
          setSelectedOrder(null);
          setDetailError('Siparis detayi getirilemedi.');
        }
      } finally {
        if (isMounted) {
          setDetailLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [restaurantId, selectedOrderId]);

  async function startPreparing(orderId: string) {
    if (!restaurantId || statusUpdatingOrderId) {
      return false;
    }

    try {
      setStatusUpdatingOrderId(orderId);
      setStatusError(null);
      const updatedOrder = await updateCashierOrderStatus(restaurantId, orderId, 'Preparing');

      updateOrderStatusInState(orderId, updatedOrder);
      saveCashierOrderStatusOverride(restaurantId, orderId, updatedOrder.status);
      addCashierActivityLogs([
        {
          restaurantId,
          orderId,
          message: 'Sipariş hazırlanıyor durumuna geçti',
        },
      ]);

      return true;
    } catch (requestError) {
      setStatusError(extractApiErrorMessage(requestError, 'Sipariş hazırlanıyor olarak işaretlenemedi.'));
      return false;
    } finally {
      setStatusUpdatingOrderId(null);
    }
  }

  async function markOrderPaid(orderId: string) {
    if (!restaurantId || statusUpdatingOrderId) {
      return false;
    }

    try {
      setStatusUpdatingOrderId(orderId);
      setStatusError(null);
      const updatedOrder = await updateCashierOrderStatus(restaurantId, orderId, 'Paid');

      updateOrderStatusInState(orderId, updatedOrder);
      saveCashierOrderStatusOverride(restaurantId, orderId, updatedOrder.status);
      clearCustomerActiveOrder(restaurantId, updatedOrder.tableId);
      addCashierActivityLogs([
        {
          restaurantId,
          orderId,
          message: 'Ödeme alındı',
        },
        {
          restaurantId,
          orderId,
          message: 'Masa aktif sipariş ekranı sıfırlandı',
        },
      ]);

      return true;
    } catch (requestError) {
      setStatusError(extractApiErrorMessage(requestError, 'Ödeme alındı olarak işaretlenemedi.'));
      return false;
    } finally {
      setStatusUpdatingOrderId(null);
    }
  }

  async function cancelOrder(orderId: string, reason: string) {
    const trimmedReason = reason.trim();

    if (!restaurantId || statusUpdatingOrderId || !trimmedReason) {
      return false;
    }

    try {
      setStatusUpdatingOrderId(orderId);
      setStatusError(null);
      const updatedOrder = await updateCashierOrderStatus(restaurantId, orderId, 'Cancelled');

      updateOrderStatusInState(orderId, updatedOrder);
      saveCashierOrderStatusOverride(restaurantId, orderId, updatedOrder.status);
      clearCustomerActiveOrder(restaurantId, updatedOrder.tableId);
      addCashierActivityLogs([
        {
          restaurantId,
          orderId,
          message: 'Sipariş iptal edildi',
        },
        {
          restaurantId,
          orderId,
          message: `İptal sebebi: ${trimmedReason}`,
          reason: trimmedReason,
        },
        {
          restaurantId,
          orderId,
          message: 'Masa aktif sipariş ekranı sıfırlandı',
        },
      ]);

      return true;
    } catch (requestError) {
      setStatusError(extractApiErrorMessage(requestError, 'Sipariş iptal edilemedi.'));
      return false;
    } finally {
      setStatusUpdatingOrderId(null);
    }
  }

  async function deliverOrder(orderId: string) {
    if (!restaurantId || statusUpdatingOrderId) {
      return false;
    }

    try {
      setStatusUpdatingOrderId(orderId);
      setStatusError(null);
      const updatedOrder = await updateCashierOrderStatus(restaurantId, orderId, 'Ready');

      updateOrderStatusInState(orderId, updatedOrder);
      saveCashierOrderStatusOverride(restaurantId, orderId, updatedOrder.status);
      addCashierActivityLogs([
        {
          restaurantId,
          orderId,
          message: 'Sipariş teslim edildi',
        },
      ]);

      return true;
    } catch (requestError) {
      setStatusError(extractApiErrorMessage(requestError, 'Sipariş teslim edildi olarak işaretlenemedi.'));
      return false;
    } finally {
      setStatusUpdatingOrderId(null);
    }
  }

  async function refundOrder(orderId: string, reason: string) {
    const trimmedReason = reason.trim();

    if (!restaurantId || statusUpdatingOrderId || !trimmedReason) {
      return false;
    }

    try {
      setStatusUpdatingOrderId(orderId);
      setStatusError(null);
      const tableId = findOrderTableId(orderId);
      const closedOrder = await updateCashierOrderStatus(restaurantId, orderId, 'Cancelled');
      updateOrderStatusLocally(orderId, 'Refunded');
      saveCashierOrderStatusOverride(restaurantId, orderId, 'Refunded');

      clearCustomerActiveOrder(restaurantId, tableId ?? closedOrder.tableId);

      addCashierActivityLogs([
        {
          restaurantId,
          orderId,
          message: 'Sipariş iade edildi',
        },
        {
          restaurantId,
          orderId,
          message: `İade sebebi: ${trimmedReason}`,
          reason: trimmedReason,
        },
        {
          restaurantId,
          orderId,
          message: 'Masa aktif sipariş ekranı sıfırlandı',
        },
      ]);

      return true;
    } catch {
      setStatusError('Sipariş iade edilemedi.');
      return false;
    } finally {
      setStatusUpdatingOrderId(null);
    }
  }

  return {
    orders,
    selectedOrderId,
    setSelectedOrderId,
    selectedOrder,
    loading,
    error,
    detailLoading,
    detailError,
    statusUpdatingOrderId,
    statusError,
    startPreparing,
    markOrderPaid,
    cancelOrder,
    deliverOrder,
    refundOrder,
  };
}
