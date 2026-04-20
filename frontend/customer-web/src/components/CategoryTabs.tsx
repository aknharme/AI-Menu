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
    <div className="sticky top-[73px] z-10 -mx-4 overflow-x-auto border-y border-stone-200 bg-white/90 px-4 py-3 backdrop-blur">
      <div className="flex min-w-max gap-2">
        {categories.map((category) => {
          const isActive = category.categoryId === activeCategoryId;

          return (
            <button
              key={category.categoryId}
              type="button"
              onClick={() => onSelect(category.categoryId)}
              className={[
                'rounded-full border px-4 py-2 text-sm font-medium transition',
                isActive
                  ? 'border-amber-500 bg-amber-500 text-stone-950 shadow-sm'
                  : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300 hover:bg-stone-100',
              ].join(' ')}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
