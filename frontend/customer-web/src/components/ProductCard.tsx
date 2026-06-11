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

  return (
    <article className="rounded-[24px] border border-[#d8c998] bg-[#fff8e9] p-2.5 shadow-sm shadow-[#14351f]/10">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onSelect(product)}
          className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[20px] bg-[#f4ead4] text-left ring-1 ring-[#d8c998]"
        >
          {productImage ? (
            <img src={productImage} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1e482a] px-5 text-center">
              <span className="pub-display text-3xl font-bold text-[#d8b95f]">{getInitials(product.name)}</span>
            </div>
          )}
        </button>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-1 pr-1">
          <button type="button" onClick={() => onSelect(product)} className="min-w-0 text-left">
            <span className="mb-1.5 block truncate text-xs font-semibold uppercase text-[#b3903f]">
              {product.categoryName}
            </span>
            <h3 className="pub-display line-clamp-2 text-base font-bold leading-[1.35] text-[#14351f]">
              {product.name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[#52624a]">{product.description}</p>
          </button>

          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-[#e7f0df] px-3 py-1.5 text-sm font-semibold text-[#14351f] ring-1 ring-[#cfe0c6]">
              {formatPrice(product.price)}
            </span>

            {quantity > 0 ? (
              <div className="inline-flex items-center rounded-full bg-[#e7f0df] p-1 text-[#14351f]">
                <button
                  type="button"
                  onClick={() => onDecrement(product)}
                  className="grid h-8 w-8 place-items-center rounded-full text-lg font-black"
                  aria-label={`${product.name} azalt`}
                >
                  -
                </button>
                <span className="min-w-7 text-center text-sm font-black">{quantity}</span>
                <button
                  type="button"
                  onClick={() => onIncrement(product)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#fff8e9] text-lg font-black text-[#14351f] shadow-sm"
                  aria-label={`${product.name} artır`}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onIncrement(product)}
                className="rounded-full bg-[#14351f] px-3.5 py-2 text-sm font-semibold text-[#f8efd9] shadow-sm shadow-[#14351f]/20 active:scale-[0.98]"
                aria-label={`${product.name} sepete ekle`}
              >
                Ekle
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
