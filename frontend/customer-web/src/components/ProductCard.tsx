import type { ProductListItem } from '../types/menu';
import { formatPrice } from '../utils/formatPrice';

type ProductCardProps = {
  product: ProductListItem;
  quantity: number;
  onSelect: (product: ProductListItem) => void;
  onIncrement: (product: ProductListItem) => void;
  onDecrement: (product: ProductListItem) => void;
};

function getProductImage(product: ProductListItem) {
  return product.imageUrl ?? product.photoUrl ?? product.thumbnailUrl;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toLocaleUpperCase('tr-TR');
}

export default function ProductCard({
  product,
  quantity,
  onSelect,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const productImage = getProductImage(product);
  const productInitials = getInitials(product.name);

  return (
    <article className="flex items-center gap-3 bg-white py-3 sm:gap-4">
      <div className="shrink-0">
          {quantity > 0 ? (
            <div className="inline-flex items-center rounded-full border border-stone-950 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => onDecrement(product)}
                className="grid h-7 w-7 place-items-center rounded-full text-sm font-black text-stone-950"
              >
                -
              </button>
              <span className="min-w-6 text-center text-sm font-black text-stone-950">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrement(product)}
                className="grid h-7 w-7 place-items-center rounded-full bg-stone-950 text-sm font-black text-white"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onIncrement(product)}
              className="grid h-8 w-8 place-items-center rounded-[10px] border border-stone-300 bg-white text-lg font-black text-stone-950 shadow-sm"
              aria-label={`${product.name} sepete ekle`}
            >
              +
            </button>
          )}
        </div>

      <button
        type="button"
        onClick={() => onSelect(product)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[22px] bg-[#ead8bf] sm:h-28 sm:w-28">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-3 text-center">
              <span className="text-2xl font-black text-stone-950/75">{productInitials}</span>
              <span className="mt-2 line-clamp-1 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-700">
                {product.categoryName}
              </span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-0.5">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 text-base font-semibold leading-6 text-stone-950">
                {product.name}
              </h3>
              <span className="shrink-0 rounded-full bg-stone-950 px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-stone-950/15">
                {formatPrice(product.price)}
              </span>
            </div>

            <p className="line-clamp-2 text-sm leading-5 text-stone-600">{product.description}</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <span className="shrink-0 text-sm font-semibold text-stone-500">Detay</span>
          </div>
        </div>
      </button>
    </article>
  );
}
