export function formatTableLabel(tableId?: string, tableName?: string | null) {
  if (!tableId) {
    return 'QR Sipariş';
  }

  return tableName?.trim() || 'Masa bilgisi';
}
