import type { MenuCategory } from '../types/menu';

type CategoryTabsProps = {
  categories: MenuCategory[];
  activeCategoryId?: string;
  onSelect: (categoryId: string) => void;
};

export default function CategoryTabs({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryTabsProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="-mx-4 overflow-x-auto border-y border-stone-100 bg-white px-4 py-2.5">
      <div className="flex min-w-max gap-2">
        {categories.map((category) => {
          const isActive = category.categoryId === activeCategoryId;

          return (
            <button
              key={category.categoryId}
              type="button"
              onClick={() => onSelect(category.categoryId)}
              className={[
                'rounded-full border px-4 py-2 text-sm font-semibold transition',
                isActive
                  ? 'border-stone-700 bg-stone-700 text-white shadow-sm shadow-stone-950/10 hover:bg-stone-700'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:bg-stone-50',
              ].join(' ')}
            >
              <span>{category.name}</span>
              <span
                className={[
                  'ml-2 rounded-full px-2 py-0.5 text-[11px]',
                  isActive ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-500',
                ].join(' ')}
              >
                {category.products.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
