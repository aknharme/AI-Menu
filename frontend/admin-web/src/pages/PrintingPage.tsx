import { useEffect, useState } from 'react';
import api from '../services/api';
import PrintingStatus from '../components/PrintingStatus';

type Settings = { enabled: boolean; categories: { categoryId: string; name: string }[]; routes: { categoryId: string; station: string }[] };

export default function PrintingPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [routes, setRoutes] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState(false);
  const [pairing, setPairing] = useState<{ code: string; expiresAtUtc: string } | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api.get<Settings>('/printing/settings').then(({ data }) => {
      if (!active) return;
      setSettings(data); setEnabled(data.enabled);
      setRoutes(Object.fromEntries(data.routes.map(r => [r.categoryId, r.station])));
    }).catch(() => { if (active) setMessage('Yazıcı ayarları yüklenemedi. Yeni backend sürümünün çalıştığından emin olun.'); });
    return () => { active = false; };
  }, []);
  async function action(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await work(); } catch { setMessage('İşlem tamamlanamadı. Aktif kategorilerin tamamını yönlendirin ve bağlantıyı kontrol edin.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <section className="rounded-3xl border border-stone-200 bg-white p-6">
      <h1 className="text-2xl font-semibold">Yazıcı bağlantısı</h1>
      <p className="mt-2 text-sm text-stone-600">Yerel servis onaylanan siparişlerin hazırlık fişlerini alır. İlk denemeyi Simulated modunda yapın.</p>
      <p className="mt-2 text-sm text-stone-600">Her restoran için tek aktif cihaz kullanılır. Yeni eşleştirme eski cihaz anahtarını geçersiz kılar.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button disabled={busy} className="rounded-xl bg-stone-900 px-4 py-3 text-white disabled:opacity-50" onClick={() => void action(async () => {
          const { data } = await api.post('/printing/pairing-codes'); setPairing(data);
        })}>Eşleştirme kodu üret</button>
        <button disabled={busy} className="rounded-xl border border-red-200 px-4 py-3 text-red-700" onClick={() => {
          if (!window.confirm('Yerel yazıcı servisinin erişimini iptal etmek istiyor musunuz?')) return;
          void action(async () => { await api.delete('/printing/device'); setPairing(null); setMessage('Cihaz erişimi iptal edildi.'); });
        }}>Cihaz erişimini iptal et</button>
      </div>
      {pairing && <div className="mt-4 rounded-xl bg-amber-50 p-4">
        <p>Yerel servis kurulumuna bu kodu girin:</p><code className="mt-2 block break-all text-xl font-bold">{pairing.code}</code>
        <p className="mt-2 text-sm">Tek kullanımlık. Son geçerlilik: {new Date(pairing.expiresAtUtc).toLocaleString('tr-TR')}. Kodu yalnızca restoranın kasa bilgisayarında kullanın.</p>
      </div>}
    </section>
    {settings && <section className="rounded-3xl border border-stone-200 bg-white p-6">
      <h2 className="text-xl font-semibold">Mutfak / bar yönlendirmesi</h2>
      <label className="my-4 flex items-center gap-2"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />Kasa onayında otomatik fiş oluştur</label>
      <div className="space-y-3">{settings.categories.map(c => <label key={c.categoryId} className="flex items-center justify-between gap-4">
        <span>{c.name}</span><select value={routes[c.categoryId] ?? ''} onChange={e => setRoutes({ ...routes, [c.categoryId]: e.target.value })} className="rounded-xl border p-2">
          <option value="">Bölüm seçin</option><option value="Kitchen">Mutfak</option><option value="Bar">Bar</option>
        </select></label>)}</div>
      <button disabled={busy || (enabled && settings.categories.some(c => !routes[c.categoryId]))} className="mt-5 rounded-xl bg-stone-900 px-4 py-3 text-white disabled:opacity-50" onClick={() => void action(async () => {
        await api.put('/printing/settings', { enabled, routes: settings.categories.filter(c => routes[c.categoryId]).map(c => ({ categoryId: c.categoryId, station: routes[c.categoryId] })) });
        setMessage('Yazdırma ayarları kaydedildi.');
      })}>Ayarları kaydet</button>
      <p className="mt-3 text-xs text-stone-500">Ayarlar yeni onayları etkiler. Kuyruktaki fişlerin içeriği sonradan değiştirilmez.</p>
    </section>}
    {message && <p role="status" className="rounded-xl bg-amber-50 p-4">{message}</p>}
    <PrintingStatus />
  </div>;
}
