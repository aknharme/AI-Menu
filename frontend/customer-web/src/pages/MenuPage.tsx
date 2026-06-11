import { FormEvent, useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import InlineAlert from '../components/InlineAlert';
import LoadingState from '../components/LoadingState';
import ProductCard from '../components/ProductCard';
import ProductDetailDrawer from '../components/ProductDetailDrawer';
import { useCart } from '../contexts/CartContext';
import { useMenu } from '../hooks/useMenu';
import { useQueryParams } from '../hooks/useQueryParams';
import { getRecommendationsByPrompt } from '../services/menuService';
import type { MenuCategory, ProductListItem, RecommendationResponse } from '../types/menu';
import { extractApiErrorMessage } from '../utils/apiError';
import { formatTableLabel } from '../utils/formatTableLabel';

const PROMPT_MAX_LENGTH = 300;

type MenuGroupView = {
  id: string;
  label: string;
  categories: MenuCategory[];
  productCount: number;
};

function normalizeMenuText(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getProductImage(product?: ProductListItem) {
  return product?.imageUrl ?? product?.photoUrl ?? product?.thumbnailUrl;
}

function buildLocalRecommendation(promptValue: string, availableProducts: ProductListItem[]): RecommendationResponse {
  const normalizedPrompt = normalizeMenuText(promptValue);
  const promptWords = normalizedPrompt
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);

  const matchedProducts = availableProducts.filter((product) => {
    const searchableText = normalizeMenuText(
      `${product.name} ${product.description} ${product.categoryName} ${product.tags.join(' ')}`,
    );

    return promptWords.some((word) => searchableText.includes(word));
  });

  const productsToShow = (matchedProducts.length > 0 ? matchedProducts : availableProducts).slice(0, 4);

  return {
    restaurantId: 'local-menu',
    tags: promptWords.slice(0, 4),
    isFallback: matchedProducts.length === 0,
    message:
      matchedProducts.length > 0
        ? 'Menüden isteğine yakın seçenekleri buldum.'
        : 'Tam eşleşme bulamadım, öne çıkan seçenekleri getirdim.',
    products: productsToShow.map((product) => ({
      productId: product.productId,
      name: product.name,
      description: product.description,
      price: product.price,
    })),
  };
}

function BotIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="h-8 w-8" fill="none">
      <text
        x="10"
        y="45"
        fill="currentColor"
        className="pub-display"
        fontSize="29"
        fontWeight="800"
      >
        AI
      </text>
      <path
        d="M44 7l3.2 8.1 8.2 3.2-8.2 3.1L44 29.5l-3.1-8.1-8.2-3.1 8.2-3.2L44 7Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path
        d="M54.5 31l1.8 4.5 4.5 1.8-4.5 1.7-1.8 4.6-1.7-4.6-4.6-1.7 4.6-1.8 1.7-4.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M5 10.5a10 10 0 0 1 14 0M8.5 14a5 5 0 0 1 7 0M12 18h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <rect width="15" height="15" x="4.5" y="4.5" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="2" />
      <path d="M16.8 7.4h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="m12 2 1.7 5.4L19 9l-5.3 1.6L12 16l-1.7-5.4L5 9l5.3-1.6L12 2ZM19 15l.8 2.4L22 18l-2.2.6L19 21l-.8-2.4L16 18l2.2-.6L19 15Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function ShamrockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 160" className="h-16 w-16" fill="none">
      <path
        d="M80 5c24 0 44 15 51 38 18 1 32 15 32 33 0 13-7 24-18 30 5 16-7 35-25 35-9 0-19-5-40 8-21-13-31-8-40-8-18 0-30-19-25-35-11-6-18-17-18-30 0-18 14-32 32-33C36 20 56 5 80 5Z"
        fill="#005b37"
        stroke="#c38b2d"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <circle cx="80" cy="55" r="35" fill="#6b3b09" stroke="#fff7df" strokeWidth="5" />
      <path d="M51 55c7-15 18-23 36-24M104 35v38M57 79c14-12 31-12 48-2" stroke="#c38b2d" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M32 50c25-8 43-1 58-8-5 13-19 19-36 18v18c-9 1-16-1-22-4V50ZM128 50c-25-8-43-1-58-8 5 13 19 19 36 18v18c9 1 16-1 22-4V50Z"
        fill="#df083b"
        stroke="#6b3b09"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M77 23h10c3 0 5 2 5 5v54c0 5-4 9-10 9s-10-4-10-9V28c0-3 2-5 5-5Z"
        fill="#f4c06a"
        stroke="#fff7df"
        strokeWidth="5"
      />
      <path d="M73 27c0-7 7-10 14-8 8 2 12 8 9 15-6-4-15-5-23-7Z" fill="#fff7df" />
      <path d="M74 79h16l5 13H69l5-13Z" fill="#5a3007" stroke="#fff7df" strokeWidth="4" />
      <path
        d="M64 62c-7-8-17-1-12 8 4 6 11 2 14-3-1 7 5 12 11 7 7-7-2-15-9-11 5-5 2-13-4-13-7 0-8 7 0 12ZM104 62c-7-8-17-1-12 8 4 6 11 2 14-3-1 7 5 12 11 7 7-7-2-15-9-11 5-5 2-13-4-13-7 0-8 7 0 12Z"
        fill="#c38b2d"
        stroke="#6b3b09"
        strokeWidth="2"
      />
      <text x="80" y="112" textAnchor="middle" className="pub-display" fontSize="25" fontWeight="900" fill="#fff7df" stroke="#c38b2d" strokeWidth="1.2">
        IRISH
      </text>
      <text x="80" y="138" textAnchor="middle" className="pub-display" fontSize="23" fontWeight="900" fill="#fff7df" stroke="#c38b2d" strokeWidth="1">
        PUB
      </text>
    </svg>
  );
}

export default function MenuPage() {
  const { restaurantId, tableId } = useQueryParams();
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const {
    loading,
    error,
    categories,
    products,
    selectedProduct,
    setSelectedProduct,
    productDetail,
    productDetailLoading,
    productDetailError,
  } = useMenu({ restaurantId });
  const [activeGroupId, setActiveGroupId] = useState<string>();
  const [activeCategoryId, setActiveCategoryId] = useState<string>();
  const [menuSearch, setMenuSearch] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const categoryGroups = useMemo<MenuGroupView[]>(() => {
    return [...categories]
      .sort((first, second) => {
        if (first.displayOrder !== second.displayOrder) {
          return first.displayOrder - second.displayOrder;
        }

        return first.name.localeCompare(second.name, 'tr-TR');
      })
      .map((category) => {
        const subCategories = [...(category.subCategories ?? [])].sort((first, second) => {
          if (first.displayOrder !== second.displayOrder) {
            return first.displayOrder - second.displayOrder;
          }

          return first.name.localeCompare(second.name, 'tr-TR');
        });
        const categoriesToShow = subCategories.length > 0
          ? subCategories
          : category.products.length > 0
            ? [category]
            : [];

        return {
          id: category.categoryId,
          label: category.name,
          categories: categoriesToShow,
          productCount:
            category.products.length +
            subCategories.reduce((total, subCategory) => total + subCategory.products.length, 0),
        };
      });
  }, [categories]);

  const activeGroup = useMemo(() => {
    if (!categoryGroups.length) {
      return undefined;
    }

    return categoryGroups.find((group) => group.id === activeGroupId) ?? categoryGroups[0];
  }, [activeGroupId, categoryGroups]);

  const activeGroupCategories = activeGroup?.categories ?? [];

  useEffect(() => {
    if (!activeGroupId && categoryGroups.length > 0) {
      setActiveGroupId(categoryGroups[0].id);
    }
  }, [activeGroupId, categoryGroups]);

  useEffect(() => {
    if (!activeGroupCategories.length) {
      setActiveCategoryId(undefined);
      return;
    }

    if (!activeGroupCategories.some((category) => category.categoryId === activeCategoryId)) {
      setActiveCategoryId(activeGroupCategories[0].categoryId);
    }
  }, [activeCategoryId, activeGroupCategories]);

  function getBaseCartItem(productId: string) {
    return cartItems.find((item) => item.productId === productId && !item.variantId);
  }

  function handleQuickIncrement(product: ProductListItem) {
    addToCart({
      productId: product.productId,
      productName: product.name,
      categoryName: product.categoryName,
      basePrice: product.price,
      quantity: 1,
      note: '',
      unitPrice: product.price,
    });
  }

  function handleQuickDecrement(product: ProductListItem) {
    const cartItem = getBaseCartItem(product.productId);

    if (!cartItem) {
      return;
    }

    if (cartItem.quantity <= 1) {
      removeFromCart(cartItem.cartItemId);
      return;
    }

    updateQuantity(cartItem.cartItemId, cartItem.quantity - 1);
  }

  function buildRecommendationCartProduct(productId: string): ProductListItem | null {
    const matchedProduct = products.find((product) => product.productId === productId);
    if (matchedProduct) {
      return matchedProduct;
    }

    const recommendedProduct = recommendation?.products.find((product) => product.productId === productId);
    if (!recommendedProduct) {
      return null;
    }

    return {
      productId: recommendedProduct.productId,
      categoryId: '',
      categoryName: 'Önerilen',
      name: recommendedProduct.name,
      description: recommendedProduct.description,
      price: recommendedProduct.price,
      tags: recommendation?.tags ?? [],
    };
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

  async function handleRecommendationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = prompt.trim();
    if (!query) {
      return;
    }

    if (query.length > PROMPT_MAX_LENGTH) {
      setRecommendationError(`Mesaj en fazla ${PROMPT_MAX_LENGTH} karakter olabilir.`);
      return;
    }

    try {
      setRecommendationLoading(true);
      setRecommendationError(null);

      if (!restaurantId) {
        setRecommendation(buildLocalRecommendation(query, products));
        return;
      }

      setRecommendation(await getRecommendationsByPrompt(restaurantId, query, tableId));
    } catch (requestError: any) {
      if (products.length > 0) {
        setRecommendation(buildLocalRecommendation(query, products));
        return;
      }

      setRecommendation(null);
      setRecommendationError(
        extractApiErrorMessage(requestError, 'Öneriler şu anda getirilemedi. Lütfen tekrar deneyin.'),
      );
    } finally {
      setRecommendationLoading(false);
    }
  }

  const visibleProducts = useMemo(() => {
    const categoryScopedProducts = !activeCategoryId
      ? activeGroupCategories.flatMap((category) => category.products)
      : products.filter(
          (product) =>
            product.categoryId === activeCategoryId &&
            activeGroupCategories.some((category) => category.categoryId === product.categoryId),
        );

    const normalizedSearch = normalizeMenuText(menuSearch.trim());

    return categoryScopedProducts.filter((product) => {
      const searchableText = normalizeMenuText(
        `${product.name} ${product.description} ${product.categoryName} ${product.tags.join(' ')}`,
      );
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesSearch;
    });
  }, [activeCategoryId, activeGroupCategories, menuSearch, products]);

  const restaurantName = 'Van Irish Pub';

  return (
    <div className="min-h-screen bg-[#f4ead4] pb-28">
      <header className="relative overflow-hidden border-b-4 border-[#c8a34a] bg-[#14351f] px-4 pb-5 pt-4 text-[#f8efd9] shadow-xl shadow-[#0b2012]/25">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:34px_100%]" />
        <div className="relative mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-full border border-[#d8b95f]/50 bg-[#0f2818]/80 px-3 py-2 text-xs font-semibold text-[#f8efd9] shadow-sm active:scale-[0.98]"
          >
            <WifiIcon />
            Wi‑Fi bağlan
          </button>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-[#d8b95f]/50 bg-[#0f2818]/80 px-3 py-2 text-xs font-semibold text-[#f8efd9] shadow-sm active:scale-[0.98]"
          >
            <InstagramIcon />
            Instagram takip et
          </a>
        </div>
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-20 w-20 shrink-0 place-items-center text-[#14351f]">
              <ShamrockIcon />
            </div>
            <div className="flex min-w-0 items-center">
              <h1 className="pub-display truncate text-2xl font-bold leading-tight text-[#f8efd9]">
                {restaurantName}
              </h1>
            </div>
          </div>
          {tableId ? (
            <span className="shrink-0 rounded-full border border-[#d8b95f]/70 bg-[#0f2818] px-3 py-2 text-xs font-semibold text-[#f8efd9] shadow-sm">
              {formatTableLabel(tableId)}
            </span>
          ) : null}
        </div>

      </header>

      {loading ? (
        <div className="px-4 py-6">
          <LoadingState count={5} />
        </div>
      ) : error ? (
        <div className="px-4 py-6">
          <EmptyState title="Menü şu anda yüklenemedi" description={error} />
        </div>
      ) : categories.length === 0 ? (
        <div className="px-4 py-6">
          <EmptyState title="Aktif ürün bulunamadı" description="Bu restoran için şu anda yayında olan ürün görünmüyor." />
        </div>
      ) : (
        <>
          <section className="sticky top-0 z-10 border-b border-[#d9c78d] bg-[#f4ead4]/95 px-4 py-3 backdrop-blur-xl">
            <label className="mb-3 flex items-center gap-3 rounded-[22px] border border-[#d6c187] bg-[#fff8e9] px-4 py-3 text-[#52624a] shadow-sm">
              <SearchIcon />
              <input
                value={menuSearch}
                onChange={(event) => setMenuSearch(event.target.value)}
                placeholder="Ürün, içerik veya kategori ara"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#14351f] outline-none placeholder:text-[#8a8068]"
              />
            </label>
            <div className="flex gap-1.5 overflow-x-auto rounded-full bg-[#e8ddbf] p-1">
              {categoryGroups.map((group) => {
                const isActive = group.id === activeGroup?.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      setActiveGroupId(group.id);
                      setActiveCategoryId(group.categories[0]?.categoryId);
                    }}
                    className={[
                      'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98]',
                      isActive
                        ? 'bg-[#14351f] text-[#f8efd9] shadow-sm'
                        : 'text-[#38543f]',
                    ].join(' ')}
                  >
                    {group.label}
                    <span className={isActive ? 'ml-2 text-[#d8b95f]' : 'ml-2 text-[#6d775e]'}>
                      {group.productCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3.5 px-4 py-4">
            {activeGroupCategories.length > 1 ? (
              <div className="-mx-4 overflow-x-auto px-4 pb-1">
                <div className="flex w-max gap-2">
                {activeGroupCategories.map((category) => {
                  const isActive = category.categoryId === activeCategoryId;

                  return (
                    <button
                      key={category.categoryId}
                      type="button"
                      onClick={() => setActiveCategoryId(category.categoryId)}
                      className={[
                        'w-[178px] shrink-0 rounded-[22px] border px-4 py-3 text-left transition active:scale-[0.98]',
                        isActive
                          ? 'border-[#d8b95f] bg-[#14351f] text-[#f8efd9] shadow-sm'
                          : 'border-[#d8c998] bg-[#fff8e9] text-[#2d4a35]',
                      ].join(' ')}
                    >
                      <span className="block truncate text-sm font-semibold">{category.name}</span>
                      <span className="mt-1 block text-xs opacity-65">
                        {category.products.length} ürün
                      </span>
                    </button>
                  );
                })}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <h2 className="pub-display text-lg font-bold text-[#14351f]">{activeGroup?.label ?? 'Menü'}</h2>
              <span className="rounded-full border border-[#d8b95f] bg-[#fff8e9] px-3 py-1.5 text-xs font-semibold text-[#14351f]">
                {visibleProducts.length} ürün
              </span>
            </div>

            {visibleProducts.length === 0 ? (
              <EmptyState title="Ürün bulunamadı" description="Arama ya da filtreyi değiştirerek tekrar deneyebilirsin." />
            ) : (
              <div className="grid gap-3">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    quantity={getBaseCartItem(product.productId)?.quantity ?? 0}
                    onSelect={setSelectedProduct}
                    onIncrement={handleQuickIncrement}
                    onDecrement={handleQuickDecrement}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {isChatOpen ? (
        <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-[max(1rem,calc((100vw-28rem)/2+1rem))] z-40 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-[26px] bg-[#fff8e9] shadow-2xl shadow-black/25 ring-1 ring-[#d8b95f]/60">
          <div className="bg-[#14351f] px-4 py-4 text-[#f8efd9]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d8b95f] text-[#14351f]">
                  <BotIcon />
                </span>
                <div>
                  <p className="text-sm font-semibold">AI Menü Asistanı</p>
                  <p className="text-xs text-[#d8b95f]">Bira, kokteyl veya pub tabağı?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="rounded-full bg-[#f8efd9] px-3 py-2 text-xs font-semibold text-[#14351f] shadow-sm"
              >
                Kapat
              </button>
            </div>
          </div>

          <div className="max-h-[22rem] space-y-3 overflow-y-auto p-4">
            <div className="rounded-2xl bg-[#f4ead4] px-4 py-3 text-sm leading-6 text-[#38543f]">
              Bana “fıçı bira öner”, “whiskey bazlı kokteyl”, “paylaşmalık atıştırmalık” veya “Guinness yanına ne gider?” yazabilirsin.
            </div>
            {recommendationError ? <InlineAlert message={recommendationError} /> : null}
            {recommendation ? (
              <div className="space-y-3">
                <p className="rounded-2xl bg-[#e7f0df] px-4 py-3 text-sm font-medium leading-6 text-[#14351f]">
                  {recommendation.message}
                </p>
                {recommendation.products.map((product) => {
                  const cartProduct = buildRecommendationCartProduct(product.productId);
                  const matchedProduct = products.find((menuProduct) => menuProduct.productId === product.productId);

                  return (
                    <article
                      key={product.productId}
                      className="flex w-full items-center gap-3 rounded-2xl border border-[#d8c998] bg-[#fff8e9] p-2 text-left shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectRecommendation(product.productId)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f4ead4]">
                          {getProductImage(matchedProduct) ? (
                            <img src={getProductImage(matchedProduct)} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-lg font-semibold text-[#b3903f]">
                              {product.name.slice(0, 1).toLocaleUpperCase('tr-TR')}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-[#14351f]">{product.name}</p>
                          <p className="line-clamp-1 text-xs text-[#52624a]">{product.description}</p>
                        </div>
                      </button>
                      {cartProduct ? (
                        <button
                          type="button"
                          onClick={() => handleQuickIncrement(cartProduct)}
                          className="shrink-0 rounded-full bg-[#14351f] px-3 py-2 text-xs font-semibold text-[#f8efd9]"
                        >
                          Ekle
                        </button>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleRecommendationSubmit} className="flex gap-2 border-t border-[#d8c998] p-3">
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              maxLength={PROMPT_MAX_LENGTH}
              placeholder="Örn. fıçı bira öner"
              className="min-w-0 flex-1 rounded-2xl bg-[#f4ead4] px-4 py-3 text-sm font-medium text-[#14351f] outline-none placeholder:text-[#8a8068]"
            />
            <button
              type="submit"
              disabled={recommendationLoading}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#d8b95f] text-[#14351f] disabled:opacity-60"
              aria-label="Gönder"
            >
              <SparkIcon />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsChatOpen((current) => !current)}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[max(1rem,calc((100vw-28rem)/2+1rem))] z-30 grid h-14 w-14 place-items-center rounded-full border border-[#d8b95f] bg-[#14351f] text-[#d8b95f] shadow-xl shadow-black/30 active:scale-[0.98]"
        aria-label="AI menü asistanını aç"
      >
        <BotIcon />
      </button>

      <ProductDetailDrawer
        isOpen={Boolean(selectedProduct)}
        product={selectedProduct}
        detail={productDetail}
        isLoading={productDetailLoading}
        error={productDetailError}
        tableId={tableId}
        onAddToCart={addToCart}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
