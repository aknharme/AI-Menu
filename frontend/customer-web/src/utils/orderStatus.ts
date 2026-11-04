// Ready is the existing cashier workflow's delivery confirmation.
export const orderStatusLabels: Record<string, string> = {
  Pending: 'Sipariş alındı',
  Preparing: 'Hazırlanıyor',
  Ready: 'Teslim edildi',
  Paid: 'Ödeme alındı',
  Cancelled: 'İptal edildi',
  Refunded: 'İade edildi',
};

export const orderStatusDescriptions: Record<string, string> = {
  Pending: 'Siparişin işletmeye ulaştı. Onay bekliyor.',
  Preparing: 'İşletme siparişini hazırlıyor.',
  Ready: 'İşletme siparişini teslim edildi olarak işaretledi. Afiyet olsun.',
  Paid: 'İşletme ödemenin alındığını onayladı.',
  Cancelled: 'Sipariş iptal edildi. Ayrıntılar için işletme ile görüşebilirsin.',
  Refunded: 'İşletme siparişi iade edildi olarak işaretledi. Ayrıntılar için personelle görüşebilirsin.',
};

export const orderSteps = [
  { key: 'Pending', label: 'Alındı' },
  { key: 'Preparing', label: 'Hazırlanıyor' },
  { key: 'Ready', label: 'Teslim edildi' },
  { key: 'Paid', label: 'Ödeme alındı' },
];
