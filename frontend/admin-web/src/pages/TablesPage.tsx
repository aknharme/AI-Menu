import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import QrPreviewModal from '../components/QrPreviewModal';
import TableFormModal from '../components/TableFormModal';
import { useRestaurantId } from '../hooks/useRestaurantId';
import { useTableManagement } from '../hooks/useTableManagement';
import type { AdminTable } from '../types/table';

function buildDownload(table: AdminTable) {
  const element = document.getElementById(`table-qr-${table.tableId}`);
  const svg = element?.querySelector('svg');

  if (!svg) {
    return;
  }

  const serializer = new XMLSerializer();
  const svgContent = serializer.serializeToString(svg);
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${table.name.toLowerCase().replace(/\s+/g, '-')}-qr.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function TablesPage() {
  const restaurantId = useRestaurantId();
  const { tables, loading, error, createTable, updateTable, deleteTable } = useTableManagement({
    restaurantId,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [previewTable, setPreviewTable] = useState<AdminTable | null>(null);
  const [editingTable, setEditingTable] = useState<AdminTable | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCloseModal() {
    setModalOpen(false);
    setEditingTable(null);
  }

  async function handleDelete(tableId: string) {
    try {
      setActionError(null);
      await deleteTable(tableId);
    } catch {
      setActionError('Bu masa daha once sipariste kullanildigi icin silinemedi.');
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[linear-gradient(135deg,_#111827_0%,_#292524_55%,_#f59e0b_180%)] p-6 text-white shadow-lg shadow-stone-950/10">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/90">
              Masa ve QR
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Masa Yonetimi</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-200">
              Her masa icin restoran ve masa kimligini tasiyan ozel bir menu URL&apos;si uret,
              QR kodu indir ve fiziksel masaya yerlestir.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Restoran</p>
              <p className="mt-2 break-all text-sm font-semibold">{restaurantId || 'Belirtilmedi'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Toplam Masa</p>
              <p className="mt-2 text-2xl font-semibold">{tables.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Admin Ekranlari
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-stone-950">Masalar</h3>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/?restaurantId=${restaurantId}`}
            className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700"
          >
            Kataloga Don
          </Link>
          <button
            type="button"
            onClick={() => {
              setEditingTable(null);
              setModalOpen(true);
            }}
            className="rounded-2xl bg-stone-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Masa Ekle
          </button>
        </div>
      </div>

      {actionError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </div>
      )}

      {loading ? (
        <LoadingState count={4} />
      ) : error ? (
        <EmptyState title="Masalar yuklenemedi" description={error} />
      ) : tables.length === 0 ? (
        <EmptyState
          title="Henuz masa yok"
          description="Ilk masayi ekledikten sonra sistem her masa icin benzersiz QR URL'si uretecek."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tables.map((table) => (
            <article
              key={table.tableId}
              className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                    Table
                  </p>
                  <h4 className="mt-2 text-xl font-semibold text-stone-950">{table.name}</h4>
                  <p className="mt-2 break-all text-sm text-stone-500">{table.menuUrl}</p>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                  {table.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div
                  id={`table-qr-${table.tableId}`}
                  className="inline-flex rounded-[24px] border border-stone-200 bg-stone-50 p-3"
                >
                  <QRCodeSVG value={table.qrCodeValue} size={112} includeMargin />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewTable(table)}
                    className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700"
                  >
                    QR Goster
                  </button>
                  <button
                    type="button"
                    onClick={() => buildDownload(table)}
                    className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700"
                  >
                    QR Indir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTable(table);
                      setModalOpen(true);
                    }}
                    className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700"
                  >
                    Duzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(table.tableId)}
                    className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <TableFormModal
        isOpen={modalOpen}
        restaurantId={restaurantId}
        initialValue={editingTable}
        onClose={handleCloseModal}
        onSubmit={(values) =>
          editingTable
            ? updateTable(editingTable.tableId, values)
            : createTable(values)
        }
      />

      <QrPreviewModal table={previewTable} onClose={() => setPreviewTable(null)} />
    </div>
  );
}
