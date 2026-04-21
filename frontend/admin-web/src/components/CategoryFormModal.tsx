import { useEffect, useState } from 'react';
import type { AdminCategory, CategoryFormValues } from '../types/catalog';

type CategoryFormModalProps = {
  isOpen: boolean;
  restaurantId: string;
  initialValue?: AdminCategory | null;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

export default function CategoryFormModal({
  isOpen,
  restaurantId,
  initialValue,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [values, setValues] = useState<CategoryFormValues>({
    restaurantId,
    name: '',
    displayOrder: '0',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues({
      restaurantId,
      name: initialValue?.name ?? '',
      displayOrder: String(initialValue?.displayOrder ?? 0),
      isActive: initialValue?.isActive ?? true,
    });
    setError(null);
  }, [initialValue, isOpen, restaurantId]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.name.trim()) {
      setError('Kategori adi bos birakilamaz.');
      return;
    }

    if (Number.isNaN(Number(values.displayOrder))) {
      setError('Liste sirasi sayisal olmalidir.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSubmit(values);
      onClose();
    } catch {
      setError('Kategori kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-stone-950/55 p-4">
      <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
              Kategori Formu
            </p>
            <h3 className="mt-2 text-xl font-semibold text-stone-950">
              {initialValue ? 'Kategori Duzenle' : 'Yeni Kategori'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-stone-500">
            Kapat
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Kategori adi</span>
            <input
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">Liste sirasi</span>
            <input
              value={values.displayOrder}
              onChange={(event) => setValues((current) => ({ ...current, displayOrder: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
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

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
}
