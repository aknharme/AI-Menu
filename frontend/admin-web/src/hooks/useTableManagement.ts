import { useEffect, useState } from 'react';
import {
  createTable,
  deleteTable,
  getTables,
  updateTable,
} from '../services/tableService';
import type { AdminTable, TableFormValues } from '../types/table';

type UseTableManagementOptions = {
  restaurantId: string;
};

export function useTableManagement({ restaurantId }: UseTableManagementOptions) {
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    if (!restaurantId) {
      setLoading(false);
      setError('Restoran bilgisi bulunamadi. restaurantId ile acmayi deneyin.');
      setTables([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const tableData = await getTables(restaurantId);
      setTables(tableData);
    } catch {
      setError('Masa verileri yuklenemedi.');
      setTables([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [restaurantId]);

  return {
    tables,
    loading,
    error,
    reload,
    createTable: async (values: TableFormValues) => {
      await createTable(values);
      await reload();
    },
    updateTable: async (tableId: string, values: TableFormValues) => {
      await updateTable(tableId, values);
      await reload();
    },
    deleteTable: async (tableId: string) => {
      await deleteTable(tableId);
      await reload();
    },
  };
}
