import { useEffect, useMemo, useState } from 'react';
import type { ProductDetail, ProductListItem } from '../types/menu';
import type { AddToCartInput } from '../types/order';
import { formatPrice } from '../utils/formatPrice';
import { formatTableLabel } from '../utils/formatTableLabel';

type ProductDetailDrawerProps = {
  isOpen: boolean;
  product: ProductListItem | null;
  detail: ProductDetail | null;
  isLoading: boolean;
  error: string | null;
  tableId?: string;
  onAddToCart: (input: AddToCartInput) => void;
  onClose: () => void;
};

export default function ProductDetailDrawer({
  isOpen,
  product,
  detail,
  isLoading,
  error,
  tableId,
  onAddToCart,
  onClose,
}: ProductDetailDrawerProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setQuantity(1);
    setSelectedVariantId('');
    setNote('');
  }, [isOpen, product?.productId]);

  const selectedVariant = useMemo(
    () => detail?.variants.find((variant) => variant.productVariantId === selectedVariantId),
    [detail?.variants, selectedVariantId],
  );

  if (!isOpen || !product) {
    return null;
  }

  const currentProduct = product;

  const unitPrice = selectedVariant?.finalPrice ?? detail?.price ?? currentProduct.price;

  function handleAddToCart() {
    if (!detail) {
      return;
    }

    onAddToCart({
      productId: currentProduct.productId,
      productName: currentProduct.name,
      categoryName: currentProduct.categoryName,
      basePrice: detail.price,
      quantity,
      note,
      variantId: selectedVariant?.productVariantId,
      variantName: selectedVariant?.name,
      unitPrice,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-[#0b2012]/70 p-0 sm:p-6">
      <div className="w-full max-w-xl rounded-t-[32px] bg-[#fff8e9] shadow-2xl sm:rounded-[32px]">
        <div className="flex items-center justify-between border-b border-[#d8c998] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b3903f]">
              {detail?.categoryName ?? currentProduct.categoryName}
            </p>
            <h2 className="pub-display mt-1 text-xl font-bold text-[#14351f]">{currentProduct.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d8c998] bg-[#f4ead4] px-3 py-2 text-sm font-semibold text-[#14351f] active:scale-[0.98]"
          >
            Kapat
          </button>
        </div>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto px-5 py-5">
          {isLoading && (
            <div className="space-y-3">
              <div className="h-4 w-1/3 animate-pulse rounded bg-[#e8ddbf]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#f4ead4]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[#f4ead4]" />
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          {!isLoading && !error && detail && (
            <>
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-2xl font-bold text-[#14351f]">
                    {formatPrice(detail.price)}
                  </p>
                  {tableId && (
                    <span className="rounded-full bg-[#e7f0df] px-3 py-1 text-xs font-semibold text-[#14351f] ring-1 ring-[#cfe0c6]">
                      {formatTableLabel(tableId)}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-7 text-[#52624a]">{detail.description}</p>
              </section>

              {detail.ingredients && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b3903f]">
                    İçerik
                  </h3>
                  <p className="text-sm leading-7 text-[#52624a]">{detail.ingredients}</p>
                </section>
              )}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b3903f]">
                  Alerjen Bilgisi
                </h3>
                {detail.allergens.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detail.allergens.map((allergen) => (
                      <span
                        key={allergen}
                        className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#52624a]">Alerjen bilgisi belirtilmemiş.</p>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b3903f]">
                  Varyantlar
                </h3>
                {detail.variants.length > 0 ? (
                  <div className="space-y-2">
                    <label className="flex items-center justify-between rounded-2xl border border-[#d8c998] bg-white px-4 py-3">
                      <div>
                        <p className="font-medium text-[#14351f]">Standart</p>
                        <p className="text-sm text-[#52624a]">
                          Toplam {formatPrice(detail.price)}
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariantId === ''}
                        onChange={() => setSelectedVariantId('')}
                        className="h-4 w-4 accent-[#14351f]"
                      />
                    </label>

                    {detail.variants.map((variant) => (
                      <label
                        key={variant.productVariantId}
                        className="flex items-center justify-between rounded-2xl border border-[#d8c998] bg-[#f4ead4] px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-[#14351f]">{variant.name}</p>
                          <p className="text-sm text-[#52624a]">
                            Toplam {formatPrice(variant.finalPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-[#b3903f]">
                            {variant.priceDelta > 0 ? `+${formatPrice(variant.priceDelta)}` : 'Dahil'}
                          </span>
                          <input
                            type="radio"
                            name="variant"
                            checked={selectedVariantId === variant.productVariantId}
                            onChange={() => setSelectedVariantId(variant.productVariantId)}
                            className="h-4 w-4 accent-[#14351f]"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#52624a]">Bu ürün için varyant bulunmuyor.</p>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b3903f]">
                  Sipariş Tercihi
                </h3>

                <div className="flex items-center justify-between rounded-2xl border border-[#d8c998] bg-[#f4ead4] p-3">
                  <span className="text-sm text-[#14351f]">Adet</span>
                  <div className="inline-flex items-center rounded-full border border-[#d8c998] bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="rounded-full px-3 py-1.5 text-sm text-[#14351f]"
                    >
                      -
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold text-[#14351f]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                      className="rounded-full px-3 py-1.5 text-sm text-[#14351f]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm text-[#14351f]">Ürün notu</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={500}
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-[#d8c998] bg-[#fff8e9] px-4 py-3 text-sm text-[#14351f] outline-none transition focus:border-[#d8b95f] focus:bg-white"
                    placeholder="Örn. az buzlu, soğansız, ekstra sos"
                  />
                </label>
              </section>
            </>
          )}
        </div>

        <div className="border-t border-[#d8c998] bg-[#fff8e9] px-5 py-4">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isLoading || !detail}
            className="w-full rounded-2xl bg-[#14351f] px-4 py-3 text-sm font-semibold text-[#f8efd9] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#e8ddbf] disabled:text-[#6d775e]"
          >
            {detail
              ? `${quantity} adet için sepete ekle • ${formatPrice(unitPrice * quantity)}`
              : 'Ürün hazırlanıyor'}
          </button>
        </div>
      </div>
    </div>
  );
}
