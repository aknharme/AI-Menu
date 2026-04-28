import { FormEvent, useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import InlineAlert from '../components/InlineAlert';
import LoadingState from '../components/LoadingState';
import { useRestaurantContext } from '../hooks/useRestaurantContext';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/adminService';
import type { AdminCategory, SaveAdminCategoryRequest } from '../types/admin';
import { extractApiErrorMessage } from '../utils/apiError';

type CategoryFormState = {
  name: string;
  displayOrder: string;
  isActive: boolean;
};

const initialFormState: CategoryFormState = {
  name: '',
  displayOrder: '1',
  isActive: true,
};

// CategoriesPage, kategori listeleme ve kategori ekleme-duzenleme akislarini tek ekranda toplar.
export default function CategoriesPage() {
  const { restaurantId } = useRestaurantContext();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<CategoryFormState>(initialFormState);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadCategories();
  }, [restaurantId]);

  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);
      setCategories(await getCategories(restaurantId));
    } catch {
      setError('Kategoriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialFormState);
    setEditingCategoryId(null);
  }

  function validateForm() {
    if (!form.name.trim()) {
      return 'Kategori adı boş olamaz.';
    }

    if (!/^\d+$/.test(form.displayOrder.trim())) {
      return 'Sıra alanı sayısal olmalıdır.';
    }

    if (Number(form.displayOrder) < 0) {
      return 'Sıra alanı negatif olamaz.';
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

    const request: SaveAdminCategoryRequest = {
      restaurantId,
      name: form.name.trim(),
      displayOrder: Number(form.displayOrder),
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      setError(null);

      if (editingCategoryId) {
        await updateCategory(editingCategoryId, request);
      } else {
        await createCategory(request);
      }

      resetForm();
      await loadCategories();
    } catch (submitError: any) {
      setError(extractApiErrorMessage(submitError, 'Kategori kaydedilemedi.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(categoryId: string) {
    try {
      setError(null);
      await deleteCategory(categoryId);
      if (editingCategoryId === categoryId) {
        resetForm();
      }
      await loadCategories();
    } catch (deleteError: any) {
      setError(extractApiErrorMessage(deleteError, 'Kategori silinemedi.'));
    }
  }

  function handleEdit(category: AdminCategory) {
    // Duzenleme icin secilen kategori form alanlarina tasinir.
    setEditingCategoryId(category.categoryId);
    setForm({
      name: category.name,
      displayOrder: String(category.displayOrder),
      isActive: category.isActive,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            Kategori Formu
          </p>
          <h2 className="text-xl font-semibold text-stone-950">
            {editingCategoryId ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Kategori adı</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Sıra</span>
            <input
              value={form.displayOrder}
              onChange={(event) => setForm((current) => ({ ...current, displayOrder: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
            <span className="text-sm font-medium text-stone-700">Aktif</span>
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
              {saving ? 'Kaydediliyor...' : editingCategoryId ? 'Güncelle' : 'Ekle'}
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
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Kategori Listesi
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">{categories.length} kategori</h2>
          </div>
        </div>

        {loading ? (
          <div className="mt-5">
            <LoadingState count={3} />
          </div>
        ) : categories.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="Kategori yok" description="Henuz kategori eklenmedi." />
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {categories.map((category) => (
              <article
                key={category.categoryId}
                className="flex flex-col gap-3 rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-stone-950">{category.name}</h3>
                    <p className="mt-1 text-sm text-stone-500">Sıra: {category.displayOrder}</p>
                  </div>
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600',
                    ].join(' ')}
                  >
                    {category.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(category.categoryId)}
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
