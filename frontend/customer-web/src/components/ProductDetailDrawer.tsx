import { useEffect, useMemo, useState } from 'react';
import type { ProductDetail, ProductListItem } from '../types/menu';
import type { AddToCartInput } from '../types/order';
import { formatPrice } from '../utils/formatPrice';

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
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-stone-950/50 p-0 sm:p-6">
      <div className="w-full max-w-xl rounded-t-[32px] bg-white shadow-2xl sm:rounded-[32px]">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
              {detail?.categoryName ?? currentProduct.categoryName}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-stone-950">{currentProduct.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200 px-3 py-2 text-sm text-stone-600"
          >
            Kapat
          </button>
        </div>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto px-5 py-5">
          {isLoading && (
            <div className="space-y-3">
              <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200" />
              <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-stone-100" />
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
                  <p className="text-2xl font-semibold text-stone-950">
                    {formatPrice(detail.price)}
                  </p>
                  {tableId && (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                      Masa {tableId}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-7 text-stone-600">{detail.description}</p>
              </section>

              {detail.ingredients && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Icerik
                  </h3>
                  <p className="text-sm leading-7 text-stone-600">{detail.ingredients}</p>
                </section>
              )}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
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
                  <p className="text-sm text-stone-500">Alerjen bilgisi belirtilmemis.</p>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Varyantlar
                </h3>
                {detail.variants.length > 0 ? (
                  <div className="space-y-2">
                    <label className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3">
                      <div>
                        <p className="font-medium text-stone-900">Standart</p>
                        <p className="text-sm text-stone-500">
                          Toplam {formatPrice(detail.price)}
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariantId === ''}
                        onChange={() => setSelectedVariantId('')}
                        className="h-4 w-4 accent-amber-600"
                      />
                    </label>

                    {detail.variants.map((variant) => (
                      <label
                        key={variant.productVariantId}
                        className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-stone-900">{variant.name}</p>
                          <p className="text-sm text-stone-500">
                            Toplam {formatPrice(variant.finalPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-amber-700">
                            {variant.priceDelta > 0 ? `+${formatPrice(variant.priceDelta)}` : 'Dahil'}
                          </span>
                          <input
                            type="radio"
                            name="variant"
                            checked={selectedVariantId === variant.productVariantId}
                            onChange={() => setSelectedVariantId(variant.productVariantId)}
                            className="h-4 w-4 accent-amber-600"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">Bu urun icin varyant bulunmuyor.</p>
                )}
              </section>

              {detail.tags.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Etiketler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {detail.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Siparis Tercihi
                </h3>

                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-3">
                  <span className="text-sm text-stone-600">Adet</span>
                  <div className="inline-flex items-center rounded-full border border-stone-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="rounded-full px-3 py-1.5 text-sm text-stone-700"
                    >
                      -
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold text-stone-950">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                      className="rounded-full px-3 py-1.5 text-sm text-stone-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm text-stone-600">Urun notu</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={500}
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:bg-white"
                    placeholder="Orn. az buzlu, sogansiz, ekstra sos"
                  />
                </label>
              </section>
            </>
          )}
        </div>

        <div className="border-t border-stone-200 px-5 py-4">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isLoading || !detail}
            className="w-full rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {detail
              ? `${quantity} adet icin sepete ekle • ${formatPrice(unitPrice * quantity)}`
              : 'Urun hazirlaniyor'}
          </button>
        </div>
      </div>
    </div>
  );
}
