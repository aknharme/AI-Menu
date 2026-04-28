import { useEffect, useState } from 'react';
import { getCashierOrderDetail, getCashierOrders } from '../services/orderService';
import type { CashierOrderDetail, CashierOrderListItem } from '../types/order';

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

        setOrders(data);
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
          setSelectedOrder(detail);
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

  return {
    orders,
    selectedOrderId,
    setSelectedOrderId,
    selectedOrder,
    loading,
    error,
    detailLoading,
    detailError,
  };
}
