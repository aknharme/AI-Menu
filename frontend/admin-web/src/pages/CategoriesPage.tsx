import { FormEvent, useEffect, useMemo, useState } from 'react';
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

type SubCategoryFormState = CategoryFormState & {
  parentCategoryId: string;
};

const initialMainFormState: CategoryFormState = {
  name: '',
  displayOrder: '1',
  isActive: true,
};

const initialSubFormState: SubCategoryFormState = {
  name: '',
  displayOrder: '1',
  isActive: true,
  parentCategoryId: '',
};

function sortCategories(categories: AdminCategory[]) {
  return [...categories].sort((first, second) => {
    if (first.displayOrder !== second.displayOrder) {
      return first.displayOrder - second.displayOrder;
    }

    return first.name.localeCompare(second.name, 'tr');
  });
}

function validateCategoryForm(form: CategoryFormState) {
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

// CategoriesPage, ana kategori ve alt menü yönetimini aynı admin ekranında toplar.
export default function CategoriesPage() {
  const { restaurantId } = useRestaurantContext();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [mainForm, setMainForm] = useState<CategoryFormState>(initialMainFormState);
  const [subForm, setSubForm] = useState<SubCategoryFormState>(initialSubFormState);
  const [editingMainCategoryId, setEditingMainCategoryId] = useState<string | null>(null);
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadCategories();
  }, [restaurantId]);

  const mainCategories = useMemo(
    () => sortCategories(categories.filter((category) => !category.parentCategoryId)),
    [categories],
  );

  const selectedMainCategory = useMemo(
    () => mainCategories.find((category) => category.categoryId === selectedMainCategoryId) ?? mainCategories[0],
    [mainCategories, selectedMainCategoryId],
  );

  const subCategories = useMemo(
    () =>
      selectedMainCategory
        ? sortCategories(
            categories.filter((category) => category.parentCategoryId === selectedMainCategory.categoryId),
          )
        : [],
    [categories, selectedMainCategory],
  );

  useEffect(() => {
    if (!selectedMainCategoryId && mainCategories.length > 0) {
      setSelectedMainCategoryId(mainCategories[0].categoryId);
      setSubForm((current) => ({ ...current, parentCategoryId: mainCategories[0].categoryId }));
    }
  }, [mainCategories, selectedMainCategoryId]);

  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);
      const response = await getCategories(restaurantId);
      setCategories(response);
    } catch {
      setError('Kategoriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  function resetMainForm() {
    setMainForm(initialMainFormState);
    setEditingMainCategoryId(null);
  }

  function resetSubForm(parentCategoryId = selectedMainCategory?.categoryId ?? '') {
    setSubForm({
      ...initialSubFormState,
      parentCategoryId,
    });
    setEditingSubCategoryId(null);
  }

  async function saveCategory(
    form: CategoryFormState,
    categoryId: string | null,
    parentCategoryId: string | null,
  ) {
    const validationError = validateCategoryForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const request: SaveAdminCategoryRequest = {
      restaurantId,
      parentCategoryId,
      name: form.name.trim(),
      displayOrder: Number(form.displayOrder),
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      setError(null);

      if (categoryId) {
        await updateCategory(categoryId, request);
      } else {
        await createCategory(request);
      }

      await loadCategories();
      if (parentCategoryId) {
        resetSubForm(parentCategoryId);
      } else {
        resetMainForm();
      }
    } catch (submitError: any) {
      setError(extractApiErrorMessage(submitError, 'Kategori kaydedilemedi.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleMainSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveCategory(mainForm, editingMainCategoryId, null);
  }

  async function handleSubSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subForm.parentCategoryId) {
      setError('Alt menü için bağlı ana kategori seçilmelidir.');
      return;
    }

    await saveCategory(subForm, editingSubCategoryId, subForm.parentCategoryId);
  }

  async function handleDelete(category: AdminCategory) {
    try {
      setError(null);
      await deleteCategory(category.categoryId);
      if (editingMainCategoryId === category.categoryId) {
        resetMainForm();
      }
      if (editingSubCategoryId === category.categoryId) {
        resetSubForm(category.parentCategoryId ?? selectedMainCategory?.categoryId ?? '');
      }
      await loadCategories();
    } catch (deleteError: any) {
      setError(extractApiErrorMessage(deleteError, 'Kategori silinemedi.'));
    }
  }

  function editMainCategory(category: AdminCategory) {
    setEditingMainCategoryId(category.categoryId);
    setMainForm({
      name: category.name,
      displayOrder: String(category.displayOrder),
      isActive: category.isActive,
    });
  }

  function editSubCategory(category: AdminCategory) {
    setEditingSubCategoryId(category.categoryId);
    setSubForm({
      parentCategoryId: category.parentCategoryId ?? '',
      name: category.name,
      displayOrder: String(category.displayOrder),
      isActive: category.isActive,
    });
  }

  function selectMainCategory(category: AdminCategory) {
    setSelectedMainCategoryId(category.categoryId);
    resetSubForm(category.categoryId);
  }

  return (
    <div className="space-y-6">
      {error ? <InlineAlert message={error} /> : null}

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              Ana Kategori
            </p>
            <h2 className="text-xl font-semibold text-stone-950">
              {editingMainCategoryId ? 'Ana Kategori Düzenle' : 'Yeni Ana Kategori'}
            </h2>
          </div>

          <form onSubmit={handleMainSubmit} className="mt-5 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Ana kategori adı</span>
              <input
                value={mainForm.name}
                onChange={(event) => setMainForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Sıra</span>
              <input
                value={mainForm.displayOrder}
                onChange={(event) => setMainForm((current) => ({ ...current, displayOrder: event.target.value }))}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
              <span className="text-sm font-medium text-stone-700">Aktif</span>
              <input
                type="checkbox"
                checked={mainForm.isActive}
                onChange={(event) => setMainForm((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-4 w-4 accent-amber-600"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                {saving ? 'Kaydediliyor...' : editingMainCategoryId ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={resetMainForm}
                disabled={saving}
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700"
              >
                Temizle
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Ana Kategoriler
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">{mainCategories.length} ana kategori</h2>
          </div>

          {loading ? (
            <div className="mt-5">
              <LoadingState count={3} />
            </div>
          ) : mainCategories.length === 0 ? (
            <div className="mt-5">
              <EmptyState title="Ana kategori yok" description="Henüz ana kategori eklenmedi." />
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {mainCategories.map((category) => (
                <article
                  key={category.categoryId}
                  className={[
                    'rounded-[24px] border px-4 py-4',
                    selectedMainCategory?.categoryId === category.categoryId
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-stone-200 bg-stone-50',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-stone-950">{category.name}</h3>
                      <p className="mt-1 text-sm text-stone-500">
                        Sıra: {category.displayOrder} · {category.subCategoryCount} alt menü
                      </p>
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => selectMainCategory(category)}
                      className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white"
                    >
                      Alt Menüleri Yönet
                    </button>
                    <button
                      type="button"
                      onClick={() => editMainCategory(category)}
                      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(category)}
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

      <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              Alt Menü
            </p>
            <h2 className="text-xl font-semibold text-stone-950">
              {editingSubCategoryId ? 'Alt Menü Düzenle' : 'Yeni Alt Menü'}
            </h2>
          </div>

          <form onSubmit={handleSubSubmit} className="mt-5 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Bağlı olduğu ana kategori</span>
              <select
                value={subForm.parentCategoryId}
                onChange={(event) => setSubForm((current) => ({ ...current, parentCategoryId: event.target.value }))}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              >
                <option value="">Ana kategori seçin</option>
                {mainCategories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Alt menü adı</span>
              <input
                value={subForm.name}
                onChange={(event) => setSubForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Sıra</span>
              <input
                value={subForm.displayOrder}
                onChange={(event) => setSubForm((current) => ({ ...current, displayOrder: event.target.value }))}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
              <span className="text-sm font-medium text-stone-700">Aktif</span>
              <input
                type="checkbox"
                checked={subForm.isActive}
                onChange={(event) => setSubForm((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-4 w-4 accent-amber-600"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                {saving ? 'Kaydediliyor...' : editingSubCategoryId ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => resetSubForm()}
                disabled={saving}
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700"
              >
                Temizle
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Alt Kategoriler
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">
              {selectedMainCategory ? `${selectedMainCategory.name} · ${subCategories.length} alt menü` : 'Ana kategori seçin'}
            </h2>
          </div>

          {loading ? (
            <div className="mt-5">
              <LoadingState count={3} />
            </div>
          ) : !selectedMainCategory ? (
            <div className="mt-5">
              <EmptyState title="Ana kategori yok" description="Alt menü eklemek için önce ana kategori oluşturun." />
            </div>
          ) : subCategories.length === 0 ? (
            <div className="mt-5">
              <EmptyState title="Alt menü yok" description="Bu ana kategoriye bağlı henüz alt menü eklenmedi." />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {subCategories.map((category) => (
                <article
                  key={category.categoryId}
                  className="flex flex-col gap-3 rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-stone-950">{category.name}</h3>
                      <p className="mt-1 text-sm text-stone-500">
                        Sıra: {category.displayOrder} · {category.productCount} ürün
                      </p>
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

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => editSubCategory(category)}
                      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(category)}
                      className="rounded-full border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700"
                    >
                      Sil
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
