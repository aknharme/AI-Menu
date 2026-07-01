export function formatTableLabel(tableId?: string) {
  if (!tableId) {
    return 'QR Siparis';
  }

  const compactValue = tableId.length > 8 ? tableId.slice(0, 8).toUpperCase() : tableId;
  return `Masa #${compactValue}`;
}
