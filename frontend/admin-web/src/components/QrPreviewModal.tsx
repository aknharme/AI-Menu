import { QRCodeSVG } from 'qrcode.react';
import type { AdminTable } from '../types/table';

type QrPreviewModalProps = {
  table: AdminTable | null;
  onClose: () => void;
};

export default function QrPreviewModal({ table, onClose }: QrPreviewModalProps) {
  if (!table) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-stone-950/55 p-0 sm:items-center sm:p-6">
      <div className="w-full max-w-md rounded-t-[32px] bg-white p-6 shadow-2xl sm:rounded-[32px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              QR Kod
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">{table.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200 px-3 py-2 text-sm text-stone-600"
          >
            Kapat
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 rounded-[28px] border border-stone-200 bg-stone-50 p-6">
          <QRCodeSVG value={table.qrCodeValue} size={240} includeMargin />
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium text-stone-800">{table.menuUrl}</p>
            <p className="text-xs text-stone-500">
              Musteri bu QR&apos;i okuttugunda dogrudan ilgili restoran ve masa baglami ile menuye girer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
