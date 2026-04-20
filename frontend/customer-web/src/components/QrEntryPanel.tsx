import { useEffect, useMemo, useRef, useState } from 'react';

type QrEntryPanelProps = {
  currentRestaurantId?: string;
  currentTableId?: string;
  onNavigateFromQr: (value: string) => void;
};

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): BarcodeDetectorLike;
      getSupportedFormats?: () => Promise<string[]>;
    };
  }
}

export default function QrEntryPanel({
  currentRestaurantId,
  currentTableId,
  onNavigateFromQr,
}: QrEntryPanelProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [manualValue, setManualValue] = useState('');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const detectorAvailable = useMemo(
    () =>
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      'mediaDevices' in navigator &&
      typeof window.BarcodeDetector !== 'undefined',
    [],
  );

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  async function startScanner() {
    if (!detectorAvailable) {
      setScannerError(
        'Bu tarayici tarayicinda desteklenmiyor. Asagidaki alana QR linkini yapistirarak devam edebilirsin.',
      );
      return;
    }

    try {
      setScannerError(null);
      const Detector = window.BarcodeDetector;
      if (!Detector) {
        setScannerError(
          'Bu tarayici tarayicinda desteklenmiyor. Asagidaki alana QR linkini yapistirarak devam edebilirsin.',
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsScannerActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new Detector({ formats: ['qr_code'] });

      const scanFrame = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          frameRef.current = window.requestAnimationFrame(scanFrame);
          return;
        }

        try {
          const results = await detector.detect(videoRef.current);
          const rawValue = results[0]?.rawValue?.trim();

          if (rawValue) {
            stopScanner();
            onNavigateFromQr(rawValue);
            return;
          }
        } catch {
          setScannerError('Kamera acildi fakat QR okunurken hata olustu.');
          stopScanner();
          return;
        }

        frameRef.current = window.requestAnimationFrame(scanFrame);
      };

      frameRef.current = window.requestAnimationFrame(scanFrame);
    } catch {
      setScannerError('Kamera izni alinamadi. Istersen QR linkini manuel yapistir.');
      stopScanner();
    }
  }

  function stopScanner() {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScannerActive(false);
  }

  return (
    <section className="space-y-4 rounded-[32px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            QR Girisi
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-stone-950">Masa baglantisini ac</h3>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-700">
          {currentRestaurantId && currentTableId ? 'Bagli' : 'Bekleniyor'}
        </span>
      </div>

      <p className="text-sm leading-7 text-stone-600">
        Kamerayla QR taratabilir ya da QR'nin yonlendirdigi linki buraya yapistirabilirsin.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (isScannerActive) {
              stopScanner();
              return;
            }

            void startScanner();
          }}
          className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white"
        >
          {isScannerActive ? 'Taramayi durdur' : 'Kamera ile tara'}
        </button>
      </div>

      {isScannerActive && (
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-950">
          <video ref={videoRef} muted playsInline className="aspect-square w-full object-cover" />
        </div>
      )}

      <label className="grid gap-2">
        <span className="text-sm font-medium text-stone-700">QR linki veya path</span>
        <textarea
          value={manualValue}
          onChange={(event) => setManualValue(event.target.value)}
          rows={3}
          placeholder="Ornek: http://localhost:5173/menu/{restaurantId}/table/{tableId}"
          className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-amber-500"
        />
      </label>

      <button
        type="button"
        onClick={() => onNavigateFromQr(manualValue)}
        className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-800"
      >
        Linki ac
      </button>

      {scannerError && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {scannerError}
        </div>
      )}
    </section>
  );
}
