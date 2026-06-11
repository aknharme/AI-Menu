import { useEffect, useState, type FormEvent } from 'react';
import type { AdminTable, TableFormValues } from '../types/table';

type TableFormModalProps = {
  isOpen: boolean;
  restaurantId: string;
  initialValue: AdminTable | null;
  onClose: () => void;
  onSubmit: (values: TableFormValues) => Promise<void>;
};

export default function TableFormModal({
  isOpen,
  restaurantId,
  initialValue,
  onClose,
  onSubmit,
}: TableFormModalProps) {
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(initialValue?.name ?? '');
    setIsActive(initialValue?.isActive ?? true);
    setError(null);
    setSubmitting(false);
  }, [initialValue, isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!restaurantId) {
      setError('Restoran bilgisi bulunamadi.');
      return;
    }

    if (!name.trim()) {
      setError('Masa adi zorunludur.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        restaurantId,
        name: name.trim(),
        isActive,
      });
      onClose();
    } catch {
      setError('Masa kaydedilemedi. Bilgileri kontrol edip tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-stone-950/50 p-0 sm:items-center sm:p-6">
      <div className="w-full max-w-lg rounded-t-[32px] bg-white p-5 shadow-2xl sm:rounded-[32px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Masa Yonetimi
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              {initialValue ? 'Masayi Duzenle' : 'Yeni Masa Ekle'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200 px-3 py-2 text-sm text-stone-600"
          >
            Kapat
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Masa Adi</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
              placeholder="Orn. Masa 1"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-stone-950 focus:ring-amber-400"
            />
            Masa aktif durumda olsun
          </label>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700"
            >
              Vazgec
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-stone-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Kaydediliyor...' : initialValue ? 'Guncelle' : 'Masayi Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
