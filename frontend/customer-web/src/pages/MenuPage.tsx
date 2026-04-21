import { useEffect, useMemo, useState } from 'react';
import CategoryTabs from '../components/CategoryTabs';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import ProductCard from '../components/ProductCard';
import ProductDetailDrawer from '../components/ProductDetailDrawer';
import { useCart } from '../contexts/CartContext';
import { useMenu } from '../hooks/useMenu';
import { useQueryParams } from '../hooks/useQueryParams';

export default function MenuPage() {
  const { restaurantId, tableId } = useQueryParams();
  const { addToCart } = useCart();
  const {
    loading,
    error,
    menu,
    categories,
    products,
    selectedProduct,
    setSelectedProduct,
    productDetail,
    productDetailLoading,
    productDetailError,
    featuredCategory,
  } = useMenu({ restaurantId });
  const [activeCategoryId, setActiveCategoryId] = useState<string>();

  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].categoryId);
    }
  }, [activeCategoryId, categories]);

  const visibleProducts = useMemo(() => {
    if (!activeCategoryId) {
      return products;
    }

    return products.filter((product) => product.categoryId === activeCategoryId);
  }, [activeCategoryId, products]);

  const activeCategoryName = useMemo(() => {
    if (!activeCategoryId) {
      return 'Menu';
    }

    return categories.find((category) => category.categoryId === activeCategoryId)?.name ?? 'Menu';
  }, [activeCategoryId, categories]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[linear-gradient(135deg,_#111827_0%,_#292524_55%,_#f59e0b_180%)] p-6 text-white shadow-lg shadow-stone-950/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/90">
                Customer Web
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                {menu?.restaurantName ?? 'Restoran Menusu'}
              </h2>
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm">
              {tableId ? `Masa ${tableId}` : 'QR ile giris'}
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-stone-200">
            Kategoriler arasinda gez, urun detaylarini incele ve siparise eklemek
            istedigin urunleri kolayca sec.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Kategori</p>
              <p className="mt-2 text-2xl font-semibold">{categories.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Aktif Urun</p>
              <p className="mt-2 text-2xl font-semibold">{products.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-300">One Cikan</p>
              <p className="mt-2 text-lg font-semibold">{featuredCategory?.name ?? 'Hazirlaniyor'}</p>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <LoadingState count={5} />
      ) : error ? (
        <EmptyState title="Menu su anda yuklenemedi" description={error} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="Aktif urun bulunamadi"
          description="Bu restoran icin su anda yayinda olan bir urun gorunmuyor."
        />
      ) : (
        <>
          <CategoryTabs
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelect={(categoryId) =>
              setActiveCategoryId((current) => (current === categoryId ? undefined : categoryId))
            }
          />

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                  Menu Listesi
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-950">{activeCategoryName}</h3>
              </div>
              <p className="text-sm text-stone-500">{visibleProducts.length} urun</p>
            </div>

            <div className="grid gap-4">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>
          </section>
        </>
      )}

      <ProductDetailDrawer
        isOpen={selectedProduct !== null}
        product={selectedProduct}
        detail={productDetail}
        isLoading={productDetailLoading}
        error={productDetailError}
        tableId={tableId}
        onAddToCart={addToCart}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
