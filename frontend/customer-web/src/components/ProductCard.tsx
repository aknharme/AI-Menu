import type { ProductListItem } from '../types/menu';
import { formatPrice } from '../utils/formatPrice';

type ProductCardProps = {
  product: ProductListItem;
  onSelect: (product: ProductListItem) => void;
};

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm shadow-stone-950/5">
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="flex w-full flex-col gap-4 p-4 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              {product.categoryName}
            </p>
            <h3 className="text-lg font-semibold text-stone-950">{product.name}</h3>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-700">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-stone-600">{product.description}</p>

        <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <div className="flex flex-wrap gap-2">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
              >
                {tag}
              </span>
            ))}
          </div>

          <span className="text-sm font-medium text-stone-500">Detayı gör</span>
        </div>
      </button>
    </article>
  );
}
