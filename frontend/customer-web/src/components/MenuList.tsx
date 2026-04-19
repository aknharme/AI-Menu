import { useEffect, useState } from 'react';
import { getMenu } from '../services/menuService';
import type { MenuResponse } from '../types/menu';

type MenuListProps = {
  restaurantId?: string;
  tableId?: string;
};

// MenuList backend'den menüyü çeker ve loading/error/success durumlarını yönetir.
export default function MenuList({ restaurantId, tableId }: MenuListProps) {
  const [menu, setMenu] = useState<MenuResponse | null>(null);
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
          setMenu(data);
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

  // Kategoriler dönse bile müşteri tarafında gösterilecek aktif ürün yoksa boş durum basılır.
  const hasProducts = menu?.categories.some((category) => category.products.length > 0) ?? false;

  if (!menu || !hasProducts) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        Aktif ürün bulunamadı.
      </div>
    );
  }

  // Başarılı durumda aktif ürünler kategori bazlı ve mobil-first kart grid yapısıyla listelenir.
  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-xs font-medium uppercase text-gray-500">Restoran</p>
        <h2 className="mt-1 text-xl font-semibold text-gray-900">{menu.restaurantName}</h2>
      </div>

      {menu.categories.map((category) => (
        <section key={category.categoryId} className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.products.length} aktif ürün</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.products.map((item) => (
              <article
                key={item.productId}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">
                      {item.categoryName}
                    </p>
                    <h4 className="mt-1 text-base font-semibold text-gray-900">
                      {item.name}
                    </h4>
                  </div>

                  <p className="text-sm leading-6 text-gray-600">{item.description}</p>

                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {/* Tag'ler ileride AI filtreleme mantığıyla aynı sözlüğü kullanacak. */}
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

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
        </section>
      ))}
    </div>
  );
}
