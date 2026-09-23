import { useEffect, useState } from 'react';
import api from '../services/api';

type Job = { id: string; orderId: string; station: string; state: string; attempt: number; error?: string };
type Status = { device: { name: string; isActive: boolean; lastSeenAtUtc?: string } | null; jobs: Job[] };
const states: Record<string, string> = {
  Pending: 'Sırada', Claimed: 'Cihaz işliyor', Submitted: 'Windows yazıcı kuyruğuna iletildi',
  Simulated: 'Test fişi — kâğıt basılmadı', Failed: 'Gönderilemedi', Uncertain: 'Sonuç belirsiz — kontrol edin', Cancelled: 'İptal',
};
export default function PrintingStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let loading = false;
    async function refresh() {
      if (loading) return;
      loading = true;
      try { const { data } = await api.get<Status>('/printing/status'); if (active) { setStatus(data); setError(''); } }
      catch { if (active) setError('Yazıcı durumuna ulaşılamıyor.'); }
      finally { loading = false; }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  async function retry(job: Job) {
    if (busy || !window.confirm('Önce yazıcıyı ve mevcut fişi kontrol edin. Bu işlem ikinci bir fiziksel fiş çıkarabilir. Kontrollü tekrar baskıyı onaylıyor musunuz?')) return;
    setBusy(job.id);
    try {
      await api.post(`/printing/jobs/${job.id}/retry`, { expectedAttempt: job.attempt, acknowledgeDuplicateRisk: true });
      setStatus((await api.get<Status>('/printing/status')).data);
      setError('');
    } catch { setError('Tekrar baskı başlatılamadı; iş durumu değişmiş olabilir.'); }
    finally { setBusy(null); }
  }
  const online = status?.device?.isActive && status.device.lastSeenAtUtc && Date.now() - Date.parse(status.device.lastSeenAtUtc) < 20000;
  return <section className="rounded-2xl border border-stone-200 bg-white p-4">
    <h2 className="font-semibold">Hazırlık fişleri</h2>
    <p className="mt-1 text-sm text-stone-600">{status?.device
      ? `${status.device.name}: ${online ? 'bağlı' : status.device.isActive ? 'bağlantı bekleniyor' : 'erişim iptal edilmiş'}`
      : 'Yerel yazıcı servisi henüz eşleştirilmedi.'}</p>
    <p className="mt-1 text-xs text-stone-500">“İletildi” Windows kuyruğunun işi kabul ettiğini gösterir; kâğıt çıktısını garanti etmez.</p>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    <div className="mt-3 space-y-2">{status?.jobs.slice(0, 12).map(job => <div key={job.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-stone-50 p-3 text-sm">
      <div><span className="font-semibold">#{job.orderId.slice(0, 8)} · {job.station === 'Kitchen' ? 'Mutfak' : 'Bar'}</span>
        <p className={['Failed', 'Uncertain'].includes(job.state) ? 'font-semibold text-red-700' : 'text-stone-600'}>{states[job.state] ?? job.state}</p>
        {job.error && <p className="max-w-xl text-xs text-red-700">{job.error}</p>}
      </div>
      {['Failed', 'Uncertain', 'Submitted', 'Simulated'].includes(job.state) && <button disabled={!!busy} onClick={() => void retry(job)} className="rounded-lg border border-stone-300 px-3 py-2 disabled:opacity-40">Tekrar yazdır</button>}
    </div>)}</div>
  </section>;
}
