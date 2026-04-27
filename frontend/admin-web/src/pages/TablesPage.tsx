import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useRestaurantContext } from '../hooks/useRestaurantContext';
import {
  createTable,
  deleteTable,
  getTables,
  updateTable,
} from '../services/adminService';
import type { AdminTable, SaveAdminTableRequest } from '../types/admin';

type TableFormState = {
  name: string;
  isActive: boolean;
};

const initialFormState: TableFormState = {
  name: '',
  isActive: true,
};

// TablesPage, masa CRUD ve QR gosterme-indirme deneyimini admin panelde sunar.
export default function TablesPage() {
  const { restaurantId, customerBaseUrl } = useRestaurantContext();
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [form, setForm] = useState<TableFormState>(initialFormState);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const svgRefs = useRef<Record<string, SVGSVGElement | null>>({});

  useEffect(() => {
    void loadTables();
  }, [restaurantId]);

  async function loadTables() {
    try {
      setLoading(true);
      setError(null);
      setTables(await getTables(restaurantId));
    } catch {
      setError('Masalar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  const customerOrigin = useMemo(() => customerBaseUrl.replace(/\/$/, ''), [customerBaseUrl]);

  function resetForm() {
    setForm(initialFormState);
    setEditingTableId(null);
  }

  function validateForm() {
    if (!form.name.trim()) {
      return 'Masa adı boş olamaz.';
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

    const request: SaveAdminTableRequest = {
      restaurantId,
      name: form.name.trim(),
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      setError(null);

      if (editingTableId) {
        await updateTable(editingTableId, request);
      } else {
        await createTable(request);
      }

      resetForm();
      await loadTables();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message ?? 'Masa kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tableId: string) {
    try {
      setError(null);
      await deleteTable(tableId);
      if (editingTableId === tableId) {
        resetForm();
      }
      await loadTables();
    } catch (deleteError: any) {
      setError(deleteError?.response?.data?.message ?? 'Masa silinemedi.');
    }
  }

  function handleEdit(table: AdminTable) {
    // Secilen masa forma aktarilarak hizli guncelleme saglanir.
    setEditingTableId(table.tableId);
    setForm({
      name: table.name,
      isActive: table.isActive,
    });
  }

  function getFullMenuUrl(menuUrl: string) {
    return `${customerOrigin}${menuUrl}`;
  }

  function handleDownloadQr(table: AdminTable) {
    const svgElement = svgRefs.current[table.tableId];
    if (!svgElement) {
      return;
    }

    // SVG tabanli QR kodu indirmek icin data url olusturulur.
    const serializer = new XMLSerializer();
    const svgMarkup = serializer.serializeToString(svgElement);
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${table.name.replace(/\s+/g, '-').toLowerCase()}-qr.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            Masa Formu
          </p>
          <h2 className="text-xl font-semibold text-stone-950">
            {editingTableId ? 'Masa Düzenle' : 'Yeni Masa'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Masa adı</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
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

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
            >
              {saving ? 'Kaydediliyor...' : editingTableId ? 'Güncelle' : 'Ekle'}
            </button>
            <button
              type="button"
              onClick={resetForm}
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
            Masa Listesi
          </p>
          <h2 className="text-xl font-semibold text-stone-950">{tables.length} masa</h2>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-stone-500">Masalar yükleniyor...</p>
        ) : tables.length === 0 ? (
          <p className="mt-5 text-sm text-stone-500">Henüz masa bulunmuyor.</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {tables.map((table) => (
              <article
                key={table.tableId}
                className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-stone-950">{table.name}</h3>
                    <p className="mt-1 break-all text-sm leading-6 text-stone-500">
                      {getFullMenuUrl(table.menuUrl)}
                    </p>
                  </div>
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      table.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600',
                    ].join(' ')}
                  >
                    {table.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                <div className="mt-4 flex justify-center rounded-[24px] border border-dashed border-stone-300 bg-white p-4">
                  <QRCodeSVG
                    value={getFullMenuUrl(table.menuUrl)}
                    size={172}
                    includeMargin
                    ref={(element) => {
                      svgRefs.current[table.tableId] = element;
                    }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(table)}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadQr(table)}
                    className="rounded-full border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700"
                  >
                    QR İndir
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(table.tableId)}
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
