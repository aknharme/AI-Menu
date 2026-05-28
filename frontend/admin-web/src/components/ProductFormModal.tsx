import { useEffect, useState } from 'react';
import type { AdminCategory, AdminProduct, ProductFormValues } from '../types/catalog';

type ProductFormModalProps = {
  isOpen: boolean;
  restaurantId: string;
  categories: AdminCategory[];
  initialValue?: AdminProduct | null;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
};

export default function ProductFormModal({
  isOpen,
  restaurantId,
  categories,
  initialValue,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [values, setValues] = useState<ProductFormValues>({
    restaurantId,
    name: '',
    price: '',
    categoryId: '',
    description: '',
    content: '',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues({
      restaurantId,
      name: initialValue?.name ?? '',
      price: initialValue ? String(initialValue.price) : '',
      categoryId: initialValue?.categoryId ?? categories[0]?.categoryId ?? '',
      description: initialValue?.description ?? '',
      content: initialValue?.content ?? '',
      isActive: initialValue?.isActive ?? true,
    });
    setError(null);
  }, [categories, initialValue, isOpen, restaurantId]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.name.trim()) {
      setError('Urun adi bos birakilamaz.');
      return;
    }

    if (!values.categoryId) {
      setError('Bir kategori secmelisin.');
      return;
    }

    if (!values.price.trim() || Number.isNaN(Number(values.price))) {
      setError('Fiyat sayisal olmalidir.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSubmit(values);
      onClose();
    } catch {
      setError('Urun kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-stone-950/55 p-4">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
              Urun Formu
            </p>
            <h3 className="mt-2 text-xl font-semibold text-stone-950">
              {initialValue ? 'Urun Duzenle' : 'Yeni Urun'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-stone-500">
            Kapat
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Urun adi</span>
            <input
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">Fiyat</span>
            <input
              value={values.price}
              onChange={(event) => setValues((current) => ({ ...current, price: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">Kategori</span>
            <select
              value={values.categoryId}
              onChange={(event) => setValues((current) => ({ ...current, categoryId: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            >
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
            <span className="text-sm font-medium text-stone-700">Aktif</span>
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))}
              className="h-4 w-4 accent-amber-600"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-stone-700">Aciklama</span>
            <textarea
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-stone-700">Icerik</span>
            <textarea
              value={values.content}
              onChange={(event) => setValues((current) => ({ ...current, content: event.target.value }))}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
}
