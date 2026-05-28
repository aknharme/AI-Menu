import { useState } from 'react';
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
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setIsMouseDown(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const container = e.currentTarget;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="-mx-4 max-w-[calc(100%+2rem)] overflow-x-auto border-y border-stone-100 bg-white px-4 py-2.5 cursor-grab active:cursor-grabbing select-none scrollbar-none"
    >
      <div className="flex w-max max-w-none gap-2">
        {categories.map((category) => {
          const isActive = category.categoryId === activeCategoryId;

          return (
            <button
              key={category.categoryId}
              type="button"
              onClick={() => onSelect(category.categoryId)}
              className={[
                'flex max-w-[220px] shrink-0 items-center rounded-full border px-4 py-2 text-sm font-semibold transition',
                isActive
                  ? 'border-stone-700 bg-stone-700 text-white shadow-sm shadow-stone-950/10 hover:bg-stone-700'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:bg-stone-50',
              ].join(' ')}
            >
              <span className="min-w-0 truncate">{category.name}</span>
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
