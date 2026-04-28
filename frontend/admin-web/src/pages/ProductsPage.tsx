import { FormEvent, useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import InlineAlert from '../components/InlineAlert';
import LoadingState from '../components/LoadingState';
import { useRestaurantContext } from '../hooks/useRestaurantContext';
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from '../services/adminService';
import type {
  AdminCategory,
  AdminProduct,
  SaveAdminProductRequest,
} from '../types/admin';
import { extractApiErrorMessage } from '../utils/apiError';

type ProductFormState = {
  name: string;
  price: string;
  categoryId: string;
  description: string;
  content: string;
  isActive: boolean;
};

const initialFormState: ProductFormState = {
  name: '',
  price: '',
  categoryId: '',
  description: '',
  content: '',
  isActive: true,
};

// ProductsPage, urun listeleme ve urun ekleme-duzenleme akislarini admin panelde sunar.
export default function ProductsPage() {
  const { restaurantId } = useRestaurantContext();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
  }, [restaurantId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [categoriesResponse, productsResponse] = await Promise.all([
        getCategories(restaurantId),
        getProducts(restaurantId),
      ]);
      setCategories(categoriesResponse);
      setProducts(productsResponse);
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || categoriesResponse[0]?.categoryId || '',
      }));
    } catch {
      setError('Ürün veya kategori verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingProductId(null);
    setForm({
      ...initialFormState,
      categoryId: categories[0]?.categoryId ?? '',
    });
  }

  function validateForm() {
    if (!form.name.trim()) {
      return 'Ürün adı boş olamaz.';
    }

    if (!form.categoryId) {
      return 'Kategori seçimi zorunludur.';
    }

    if (!form.price.trim() || Number.isNaN(Number(form.price))) {
      return 'Fiyat sayısal olmalıdır.';
    }

    if (Number(form.price) < 0) {
      return 'Fiyat negatif olamaz.';
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const request: SaveAdminProductRequest = {
      restaurantId,
      categoryId: form.categoryId,
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      content: form.content.trim(),
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      setError(null);

      if (editingProductId) {
        await updateProduct(editingProductId, request);
      } else {
        await createProduct(request);
      }

      resetForm();
      await loadData();
    } catch (submitError: any) {
      setError(extractApiErrorMessage(submitError, 'Ürün kaydedilemedi.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(productId: string) {
    try {
      setError(null);
      await deleteProduct(productId);
      if (editingProductId === productId) {
        resetForm();
      }
      await loadData();
    } catch (deleteError: any) {
      setError(extractApiErrorMessage(deleteError, 'Ürün silinemedi.'));
    }
  }

  function handleEdit(product: AdminProduct) {
    // Secilen urun form alanlarina aktarilarak duzenleme akisi hizlandirilir.
    setEditingProductId(product.productId);
    setForm({
      name: product.name,
      price: String(product.price),
      categoryId: product.categoryId,
      description: product.description,
      content: product.content,
      isActive: product.isActive,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            Ürün Formu
          </p>
          <h2 className="text-xl font-semibold text-stone-950">
            {editingProductId ? 'Ürün Düzenle' : 'Yeni Ürün'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">İsim</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Fiyat</span>
            <input
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Kategori</span>
            <select
              value={form.categoryId}
              onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            >
              <option value="">Kategori seçin</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Açıklama</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">İçerik</span>
            <textarea
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
            <span className="text-sm font-medium text-stone-700">Aktif / Pasif</span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              className="h-4 w-4 accent-amber-600"
            />
          </label>

          {error ? <InlineAlert message={error} /> : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
            >
              {saving ? 'Kaydediliyor...' : editingProductId ? 'Güncelle' : 'Ekle'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700"
            >
              Temizle
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Ürün Listesi
          </p>
          <h2 className="text-xl font-semibold text-stone-950">{products.length} ürün</h2>
        </div>

        {loading ? (
          <div className="mt-5">
            <LoadingState count={4} />
          </div>
        ) : products.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="Urun yok" description="Henuz urun eklenmedi." />
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {products.map((product) => (
              <article
                key={product.productId}
                className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      {product.categoryName}
                    </p>
                    <h3 className="text-base font-semibold text-stone-950">{product.name}</h3>
                    <p className="text-sm leading-6 text-stone-600">{product.description || 'Açıklama yok'}</p>
                    <p className="text-sm font-medium text-stone-500">{product.content || 'İçerik yok'}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-base font-semibold text-stone-950">{product.price.toFixed(2)} TL</p>
                    <span
                      className={[
                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                        product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600',
                      ].join(' ')}
                    >
                      {product.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(product.productId)}
                    className="rounded-full border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700"
                  >
                    Sil
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
