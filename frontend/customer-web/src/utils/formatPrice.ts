// Para gösterimini Türkçe locale ile tek yerden standartlaştırır.
export function formatPrice(value: number) {
  return `${value.toLocaleString('tr-TR')} TL`;
}
