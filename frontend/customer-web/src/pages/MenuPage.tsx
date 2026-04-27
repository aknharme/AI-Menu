import { FormEvent, useEffect, useMemo, useState } from 'react';
import CategoryTabs from '../components/CategoryTabs';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import ProductCard from '../components/ProductCard';
import ProductDetailDrawer from '../components/ProductDetailDrawer';
import { useMenu } from '../hooks/useMenu';
import { useQueryParams } from '../hooks/useQueryParams';
import { getRecommendationsByPrompt } from '../services/menuService';
import type { RecommendationResponse } from '../types/menu';
import { formatPrice } from '../utils/formatPrice';

// MenuPage, menu listeleme ile AI destekli urun onerisi deneyimini ayni ekranda toplar.
export default function MenuPage() {
  const { restaurantId, tableId } = useQueryParams();
  const {
    loading,
    error,
    menu,
    categories,
    products,
    selectedProduct,
    setSelectedProduct,
    productDetail,
    productDetailLoading,
    productDetailError,
    featuredCategory,
  } = useMenu({ restaurantId });
  const [activeCategoryId, setActiveCategoryId] = useState<string>();
  const [prompt, setPrompt] = useState('');
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].categoryId);
    }
  }, [activeCategoryId, categories]);

  async function handleRecommendationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!restaurantId) {
      setRecommendationError('Restoran bilgisi olmadan öneri alınamıyor.');
      return;
    }

    if (!prompt.trim()) {
      setRecommendationError('Öneri almak için ne yemek istediğinizi yazın.');
      return;
    }

    try {
      setRecommendationLoading(true);
      setRecommendationError(null);
      const response = await getRecommendationsByPrompt(restaurantId, prompt.trim());
      setRecommendation(response);
    } catch {
      setRecommendation(null);
      setRecommendationError('Öneriler şu anda getirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setRecommendationLoading(false);
    }
  }

  function handleSelectRecommendation(productId: string) {
    const matchedProduct = products.find((product) => product.productId === productId);
    if (matchedProduct) {
      setSelectedProduct(matchedProduct);
      return;
    }

    const recommendedProduct = recommendation?.products.find((product) => product.productId === productId);
    if (!recommendedProduct) {
      return;
    }

    // Oneri cevabinda kategori bilgisi olmadigi icin detay cekebilmek adina minimum urun modeli olusturulur.
    setSelectedProduct({
      productId: recommendedProduct.productId,
      categoryId: '',
      categoryName: 'Önerilen ürün',
      name: recommendedProduct.name,
      description: recommendedProduct.description,
      price: recommendedProduct.price,
      tags: recommendation?.tags ?? [],
    });
  }

  const visibleProducts = useMemo(() => {
    if (!activeCategoryId) {
      return products;
    }

    return products.filter((product) => product.categoryId === activeCategoryId);
  }, [activeCategoryId, products]);

  const activeCategoryName = useMemo(() => {
    if (!activeCategoryId) {
      return 'Menü';
    }

    return categories.find((category) => category.categoryId === activeCategoryId)?.name ?? 'Menü';
  }, [activeCategoryId, categories]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[linear-gradient(135deg,_#111827_0%,_#292524_55%,_#f59e0b_180%)] p-6 text-white shadow-lg shadow-stone-950/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/90">
                Customer Web
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                {menu?.restaurantName ?? 'Restoran Menüsü'}
              </h2>
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm">
              {tableId ? `Masa ${tableId}` : 'QR ile giriş'}
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-stone-200">
            Kategoriler arasında gez, ürün detaylarını incele ve siparişe eklemek
            istediğin ürünleri kolayca seç.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Kategori</p>
              <p className="mt-2 text-2xl font-semibold">{categories.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Aktif Ürün</p>
              <p className="mt-2 text-2xl font-semibold">{products.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Öne Çıkan</p>
              <p className="mt-2 text-lg font-semibold">{featuredCategory?.name ?? 'Hazırlanıyor'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            Akıllı Öneri
          </p>
          <h3 className="text-xl font-semibold text-stone-950">Bir isteğinizi yazın</h3>
          <p className="text-sm leading-6 text-stone-600">
            Örnek: hafif bir şey istiyorum, tavuk olsun ama çok ağır olmasın.
          </p>
        </div>

        <form onSubmit={handleRecommendationSubmit} className="mt-4 space-y-3">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={4}
            placeholder="Canım hafif ama doyurucu bir şey istiyor..."
            className="w-full rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={recommendationLoading}
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {recommendationLoading ? 'Öneriler hazırlanıyor...' : 'Öneri getir'}
            </button>
            {recommendation && (
              <span className="text-sm text-stone-500">
                {recommendation.isFallback ? 'Fallback öneriler gösteriliyor.' : 'Tag eşleşmeleri bulundu.'}
              </span>
            )}
          </div>
        </form>

        {recommendationError && (
          <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {recommendationError}
          </div>
        )}

        {recommendation && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {recommendation.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-sm leading-6 text-stone-600">{recommendation.message}</p>

            {recommendation.products.length > 0 ? (
              <div className="grid gap-3">
                {recommendation.products.map((product) => (
                  <button
                    key={product.productId}
                    type="button"
                    onClick={() => handleSelectRecommendation(product.productId)}
                    className="rounded-[28px] border border-stone-200 bg-stone-50 px-4 py-4 text-left transition hover:border-amber-300 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h4 className="text-base font-semibold text-stone-950">{product.name}</h4>
                        <p className="text-sm leading-6 text-stone-600">{product.description}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-700">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Öneri bulunamadı"
                description="Bu istek için uygun aktif ürün bulunamadı."
              />
            )}
          </div>
        )}
      </section>

      {loading ? (
        <LoadingState count={5} />
      ) : error ? (
        <EmptyState title="Menü şu anda yüklenemedi" description={error} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="Aktif ürün bulunamadı"
          description="Bu restoran için şu anda yayında olan bir ürün görünmüyor."
        />
      ) : (
        <>
          <CategoryTabs
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelect={(categoryId) =>
              setActiveCategoryId((current) => (current === categoryId ? undefined : categoryId))
            }
          />

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                  Menü Listesi
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-950">{activeCategoryName}</h3>
              </div>
              <p className="text-sm text-stone-500">{visibleProducts.length} ürün</p>
            </div>

            <div className="grid gap-4">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>
          </section>
        </>
      )}

      <ProductDetailDrawer
        isOpen={selectedProduct !== null}
        product={selectedProduct}
        detail={productDetail}
        isLoading={productDetailLoading}
        error={productDetailError}
        tableId={tableId}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
