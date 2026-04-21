import { useMemo, useState } from 'react';
import CategoryFormModal from '../components/CategoryFormModal';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import ProductFormModal from '../components/ProductFormModal';
import { useCatalogManagement } from '../hooks/useCatalogManagement';
import { useRestaurantId } from '../hooks/useRestaurantId';
import type { AdminCategory, AdminProduct } from '../types/catalog';

function formatPrice(value: number) {
  return `${value.toLocaleString('tr-TR')} TL`;
}

export default function DashboardPage() {
  const restaurantId = useRestaurantId();
  const {
    categories,
    products,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useCatalogManagement({ restaurantId });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeProductCount = useMemo(
    () => products.filter((product) => product.isActive).length,
    [products],
  );

  async function handleDeleteCategory(categoryId: string) {
    try {
      setActionError(null);
      await deleteCategory(categoryId);
    } catch {
      setActionError('Bu kategoriye bagli urunler oldugu icin silinemedi.');
    }
  }

  async function handleDeleteProduct(productId: string) {
    try {
      setActionError(null);
      await deleteProduct(productId);
    } catch {
      setActionError('Urun silinemedi.');
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[linear-gradient(135deg,_#111827_0%,_#292524_55%,_#f59e0b_180%)] p-6 text-white shadow-lg shadow-stone-950/10">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/90">
              Admin Web
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Urun ve Kategori Yonetimi</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-200">
              Restorana ait kategorileri ve urunleri tek panelden olustur, guncelle ve yayina al.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Restoran</p>
            <p className="mt-2 break-all text-sm font-semibold">{restaurantId || 'Belirtilmedi'}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Kategori</p>
              <p className="mt-2 text-2xl font-semibold">{categories.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Aktif Urun</p>
              <p className="mt-2 text-2xl font-semibold">{activeProductCount}</p>
            </div>
          </div>
        </div>
      </section>

      {actionError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </div>
      )}

      {loading ? (
        <LoadingState count={6} />
      ) : error ? (
        <EmptyState title="Yonetim verileri yuklenemedi" description={error} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Kategoriler
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-950">Kategori Listesi</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
                className="rounded-2xl bg-stone-950 px-4 py-2 text-sm font-semibold text-white"
              >
                Kategori Ekle
              </button>
            </div>

            {categories.length === 0 ? (
              <EmptyState
                title="Kategori yok"
                description="Bu restoran icin henuz kategori olusturulmamis."
              />
            ) : (
              categories.map((category) => (
                <article
                  key={category.categoryId}
                  className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm shadow-stone-950/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-stone-950">{category.name}</h4>
                      <p className="mt-1 text-sm text-stone-500">
                        Sira: {category.displayOrder} | {category.productCount} urun
                      </p>
                    </div>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                      {category.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryModalOpen(true);
                      }}
                      className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700"
                    >
                      Duzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteCategory(category.categoryId)}
                      className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700"
                    >
                      Sil
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Urunler
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-950">Urun Listesi</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setProductModalOpen(true);
                }}
                disabled={categories.length === 0}
                className="rounded-2xl bg-stone-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Urun Ekle
              </button>
            </div>

            {products.length === 0 ? (
              <EmptyState
                title="Urun yok"
                description={
                  categories.length === 0
                    ? 'Once kategori olusturup sonra urun eklemelisin.'
                    : 'Bu restoran icin henuz urun eklenmemis.'
                }
              />
            ) : (
              products.map((product) => (
                <article
                  key={product.productId}
                  className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm shadow-stone-950/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                        {product.categoryName}
                      </p>
                      <h4 className="mt-2 text-lg font-semibold text-stone-950">{product.name}</h4>
                      <p className="mt-1 text-sm text-stone-500">{product.description || 'Aciklama yok'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-stone-950">{formatPrice(product.price)}</p>
                      <span className="mt-2 inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                        {product.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(product);
                        setProductModalOpen(true);
                      }}
                      className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700"
                    >
                      Duzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteProduct(product.productId)}
                      className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700"
                    >
                      Sil
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      )}

      <CategoryFormModal
        isOpen={categoryModalOpen}
        restaurantId={restaurantId}
        initialValue={editingCategory}
        onClose={() => setCategoryModalOpen(false)}
        onSubmit={(values) =>
          editingCategory
            ? updateCategory(editingCategory.categoryId, values)
            : createCategory(values)
        }
      />

      <ProductFormModal
        isOpen={productModalOpen}
        restaurantId={restaurantId}
        categories={categories}
        initialValue={editingProduct}
        onClose={() => setProductModalOpen(false)}
        onSubmit={(values) =>
          editingProduct
            ? updateProduct(editingProduct.productId, values)
            : createProduct(values)
        }
      />
    </div>
  );
}
