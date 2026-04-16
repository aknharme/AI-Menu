import { useEffect, useState } from 'react';
import { getMenu } from '../services/menuService';
import type { MenuItem } from '../types/menu';

type MenuListProps = {
  restaurantId?: string;
  tableId?: string;
};

// MenuList backend'den menüyü çeker ve loading/error/success durumlarını yönetir.
export default function MenuList({ restaurantId, tableId }: MenuListProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Component ekrandayken menü verisini yükler; unmount sonrası state güncellemez.
    async function loadMenu() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMenu({ restaurantId, tableId });

        if (isMounted) {
          setItems(data.filter((item) => item.isActive));
        }
      } catch {
        if (isMounted) {
          setError('Menü şu anda yüklenemedi. Lütfen tekrar deneyin.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, [restaurantId, tableId]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        Menü yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        Aktif ürün bulunamadı.
      </div>
    );
  }

  // Başarılı durumda aktif ürünler mobil-first kart grid yapısıyla listelenir.
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white"
        >
          <div className="aspect-video bg-gray-100">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Görsel yok
              </div>
            )}
          </div>

          <div className="space-y-3 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {item.categoryName}
              </p>
              <h2 className="mt-1 text-base font-semibold text-gray-900">
                {item.name}
              </h2>
            </div>

            <p className="text-sm leading-6 text-gray-600">{item.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">
                {item.price.toLocaleString('tr-TR')} TL
              </span>
              <button className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white">
                Ekle
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
