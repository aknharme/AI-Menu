import { FormEvent, useEffect, useMemo, useState } from 'react';
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
  calories: string;
  preparationTimeMinutes: string;
  allergens: string;
  tags: string;
  variants: ProductVariantFormState[];
  isActive: boolean;
};

type ProductVariantFormState = {
  productVariantId?: string;
  name: string;
  priceDelta: string;
  isActive: boolean;
};

const initialFormState: ProductFormState = {
  name: '',
  price: '',
  categoryId: '',
  description: '',
  content: '',
  calories: '',
  preparationTimeMinutes: '',
  allergens: '',
  tags: '',
  variants: [],
  isActive: true,
};

function sortCategories(categories: AdminCategory[]) {
  return [...categories].sort((first, second) => {
    if (first.displayOrder !== second.displayOrder) {
      return first.displayOrder - second.displayOrder;
    }

    return first.name.localeCompare(second.name, 'tr');
  });
}

// ProductsPage, ürünleri doğrudan kategoriye bağlayarak admin CRUD akışını sunar.
export default function ProductsPage() {
  const { restaurantId } = useRestaurantContext();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedCategories = useMemo(() => sortCategories(categories), [categories]);

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
      const firstCategoryId = sortCategories(categoriesResponse)[0]?.categoryId ?? '';

      setCategories(categoriesResponse);
      setProducts(productsResponse);
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || firstCategoryId,
      }));
    } catch {
      setError('Ürün veya kategori verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    const firstCategoryId = sortedCategories[0]?.categoryId ?? '';

    setEditingProductId(null);
    setForm({
      ...initialFormState,
      categoryId: firstCategoryId,
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

    if (form.calories && (!Number.isInteger(Number(form.calories)) || Number(form.calories) < 0 || Number(form.calories) > 5000)) {
      return 'Kalori 0 ile 5000 arasında tam sayı olmalıdır.';
    }

    if (form.preparationTimeMinutes && (!Number.isInteger(Number(form.preparationTimeMinutes)) || Number(form.preparationTimeMinutes) < 1 || Number(form.preparationTimeMinutes) > 480)) {
      return 'Hazırlanma süresi 1 ile 480 dakika arasında tam sayı olmalıdır.';
    }

    const filledVariants = form.variants.filter((variant) => variant.name.trim());
    const invalidVariant = filledVariants.find((variant) => {
      const priceDelta = Number(variant.priceDelta || '0');
      return Number.isNaN(priceDelta) || Number(form.price) + priceDelta < 0;
    });

    if (invalidVariant) {
      return 'Varyant fiyat farkı sayısal olmalı ve toplam fiyat negatif olmamalıdır.';
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
      calories: form.calories ? Number(form.calories) : null,
      preparationTimeMinutes: form.preparationTimeMinutes ? Number(form.preparationTimeMinutes) : null,
      allergens: form.allergens
        .split(',')
        .map((allergen) => allergen.trim())
        .filter(Boolean),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      variants: form.variants
        .filter((variant) => variant.name.trim())
        .map((variant) => ({
          productVariantId: variant.productVariantId,
          name: variant.name.trim(),
          priceDelta: Number(variant.priceDelta || '0'),
          isActive: variant.isActive,
        })),
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
    setEditingProductId(product.productId);
    setForm({
      name: product.name,
      price: String(product.price),
      categoryId: product.categoryId,
      description: product.description,
      content: product.content,
      calories: product.calories === null ? '' : String(product.calories),
      preparationTimeMinutes: product.preparationTimeMinutes === null ? '' : String(product.preparationTimeMinutes),
      allergens: product.allergens.join(', '),
      tags: product.tags.join(', '),
      variants: product.variants.map((variant) => ({
        productVariantId: variant.productVariantId,
        name: variant.name,
        priceDelta: String(variant.priceDelta),
        isActive: variant.isActive,
      })),
      isActive: product.isActive,
    });
  }

  function formatCategoryPath(product: AdminProduct) {
    return product.categoryName;
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [...current.variants, { name: '', priceDelta: '0', isActive: true }],
    }));
  }

  function updateVariant(index: number, values: Partial<ProductVariantFormState>) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, ...values } : variant,
      ),
    }));
  }

  function removeVariant(index: number) {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter((_, currentIndex) => currentIndex !== index),
    }));
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
              {sortedCategories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}{category.isActive ? '' : ' (Pasif)'}
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

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Kalori (kcal)</span>
              <input
                type="number"
                min="0"
                max="5000"
                step="1"
                value={form.calories}
                onChange={(event) => setForm((current) => ({ ...current, calories: event.target.value }))}
                placeholder="Bilinmiyorsa boş"
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Hazırlanma (dk)</span>
              <input
                type="number"
                min="1"
                max="480"
                step="1"
                value={form.preparationTimeMinutes}
                onChange={(event) => setForm((current) => ({ ...current, preparationTimeMinutes: event.target.value }))}
                placeholder="Bilinmiyorsa boş"
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Alerjenler</span>
            <input
              value={form.allergens}
              onChange={(event) => setForm((current) => ({ ...current, allergens: event.target.value }))}
              placeholder="gluten, süt, fıstık"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
            <p className="text-xs leading-5 text-stone-500">Alerjenleri virgül ile ayırın.</p>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Etiketler</span>
            <input
              value={form.tags}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
              placeholder="hafif, ekşi, ferah, soğuk"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
            <p className="text-xs leading-5 text-stone-500">
              Virgül ile ayırın. Bu etiketler ürünleri gruplamak ve aramada bulmak için kullanılır.
            </p>
          </label>

          <div className="space-y-3 rounded-2xl border border-stone-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-stone-700">Varyantlar</span>
              <button
                type="button"
                onClick={addVariant}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700"
              >
                Varyant ekle
              </button>
            </div>

            {form.variants.length === 0 ? (
              <p className="text-xs leading-5 text-stone-500">Varyant opsiyoneldir. Ürün tek fiyatlıysa boş bırakın.</p>
            ) : (
              <div className="space-y-3">
                {form.variants.map((variant, index) => (
                  <div key={variant.productVariantId ?? index} className="space-y-2 rounded-2xl bg-stone-50 p-3">
                    <input
                      value={variant.name}
                      onChange={(event) => updateVariant(index, { name: event.target.value })}
                      placeholder="Varyant adı"
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                    />
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        value={variant.priceDelta}
                        onChange={(event) => updateVariant(index, { priceDelta: event.target.value })}
                        placeholder="Fiyat farkı"
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                      />
                      <label className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700">
                        Aktif
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(event) => updateVariant(index, { isActive: event.target.checked })}
                          className="h-4 w-4 accent-amber-600"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700"
                    >
                      Kaldır
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
            <EmptyState title="Ürün yok" description="Henüz ürün eklenmedi." />
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
                      {formatCategoryPath(product)}
                    </p>
                    <h3 className="text-base font-semibold text-stone-950">{product.name}</h3>
                    <p className="text-sm leading-6 text-stone-600">{product.description || 'Açıklama yok'}</p>
                    <p className="text-sm font-medium text-stone-500">{product.content || 'İçerik yok'}</p>
                    {(product.calories !== null || product.preparationTimeMinutes !== null) ? (
                      <p className="text-xs font-medium text-stone-500">
                        {product.calories !== null ? `${product.calories} kcal` : 'Kalori belirtilmemiş'}
                        {' · '}
                        {product.preparationTimeMinutes !== null ? `${product.preparationTimeMinutes} dk` : 'Süre belirtilmemiş'}
                      </p>
                    ) : null}
                    {product.allergens.length > 0 ? (
                      <p className="text-xs font-medium text-rose-700">Alerjenler: {product.allergens.join(', ')}</p>
                    ) : null}
                    {product.tags.length > 0 ? (
                      <p className="text-xs font-medium text-amber-700">
                        Etiketler: {product.tags.join(', ')}
                      </p>
                    ) : null}
                    {product.variants.length > 0 ? (
                      <p className="text-xs font-medium text-stone-500">
                        Varyantlar: {product.variants.map((variant) => `${variant.name} (${variant.priceDelta >= 0 ? '+' : ''}${variant.priceDelta} TL${variant.isActive ? '' : ', pasif'})`).join(', ')}
                      </p>
                    ) : null}
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

