import { FormEvent, useState } from 'react';
import InlineAlert from '../components/InlineAlert';
import { useRestaurantContext } from '../hooks/useRestaurantContext';
import { testAiGrounding } from '../services/adminService';
import type { AdminAiTestResponse } from '../types/admin';
import { extractApiErrorMessage } from '../utils/apiError';

export default function AiTestPage() {
  const { restaurantId } = useRestaurantContext();
  const [message, setMessage] = useState('hafif ekşi bir içecek istiyorum');
  const [result, setResult] = useState<AdminAiTestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError('Test mesajı boş olamaz.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(await testAiGrounding(restaurantId, trimmedMessage));
    } catch (requestError: any) {
      setResult(null);
      setError(extractApiErrorMessage(requestError, 'AI testi çalıştırılamadı.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">AI Test</p>
          <h2 className="text-xl font-semibold text-stone-950">Grounding Kontrolü</h2>
          <p className="text-sm leading-6 text-stone-500">
            Bu ekran müşteriye görünmez. Menüye göre hangi ürünlerin seçildiğini test etmek için kullanılır.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Müşteri mesajı</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              maxLength={300}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </label>

          {error ? <InlineAlert message={error} /> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? 'Test ediliyor...' : 'Test Et'}
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Sonuç</p>
          <h2 className="text-xl font-semibold text-stone-950">
            {result ? `${result.groundedProducts.length} ürün eşleşti` : 'Henüz test yok'}
          </h2>
        </div>

        {result ? (
          <div className="mt-5 space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoPill label="Intent" value={result.intent} />
              <InfoPill label="Query Type" value={result.queryType} />
              <InfoPill label="Specific" value={result.hasSpecificGrounding ? 'Evet' : 'Hayır'} />
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">AI Cevabı</p>
              <p className="mt-2 text-sm leading-6 text-stone-700">{result.reply}</p>
            </div>

            <div className="space-y-3">
              {result.groundedProducts.map((product) => (
                <article key={product.productId} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        {product.categoryName}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-stone-950">{product.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{product.description}</p>
                      {product.tags.length > 0 ? (
                        <p className="mt-2 text-xs font-medium text-amber-700">Tags: {product.tags.join(', ')}</p>
                      ) : null}
                    </div>
                    <p className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-950">
                      {product.price} TL
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">
            Bir müşteri mesajı yazıp test edin.
          </div>
        )}
      </section>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-stone-950">{value}</p>
    </div>
  );
}
