import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import CategoryTabs from '../components/CategoryTabs';
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
import { formatPrice } from '../utils/formatPrice';
import { extractApiErrorMessage } from '../utils/apiError';

const PROMPT_MAX_LENGTH = 300;

// 29 Nisan 2026: Ana menü kategorileri (Tatlı, İçecek, Yemek)
// Not: Ara Sıcak kategorisi silinmiştir
const MENU_GROUPS = [
  {
    id: 'dessert',
    label: 'Tatlı',
    description: 'Pasta, waffle, pancake ve özel tatlılar',
    keywords: [
      'tatli',
      'tatlı',
      'dessert',
      'pasta',
      'waffle',
      'pancake',
      'crepe',
      'krep',
      'cup',
      'magnolia',
      'san sebastian',
    ],
  },
  {
    id: 'drink',
    label: 'İçecek',
    description: 'Sıcak, soğuk ve kahve seçenekleri',
    keywords: [
      'icecek',
      'içecek',
      'drink',
      'kahve',
      'coffee',
      'cay',
      'çay',
      'soguk',
      'soğuk',
      'sicak',
      'sıcak',
      'limonata',
      'milkshake',
    ],
  },
] as const;

type MenuGroupView = {
  id: string;
  label: string;
  description: string;
  categories: MenuCategory[];
  productCount: number;
};

function normalizeMenuText(value: string) {
  return value.toLocaleLowerCase('tr-TR');
}

function getCategoryGroupId(categoryName: string) {
  const normalizedName = normalizeMenuText(categoryName);
  const matchedGroup = MENU_GROUPS.find((group) =>
    group.keywords.some((keyword) => normalizedName.includes(keyword)),
  );

  return matchedGroup?.id ?? 'menu';
}

function WifiIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M5 10.5a10 10 0 0 1 14 0M8.5 14a5 5 0 0 1 7 0M12 18h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
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

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5 21 3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 6 6v3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function AssistantMarkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M9 7H4v5M4.5 11.5A8 8 0 1 0 7 5.7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function getProductImage(product?: ProductListItem) {
  return product?.imageUrl ?? product?.photoUrl ?? product?.thumbnailUrl;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toLocaleUpperCase('tr-TR');
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

  const productsToShow = (matchedProducts.length > 0 ? matchedProducts : availableProducts).slice(0, 3);

  return {
    restaurantId: 'local-menu',
    tags: promptWords.slice(0, 4),
    isFallback: matchedProducts.length === 0,
    message:
      matchedProducts.length > 0
        ? 'İsteğine yakın ürünleri menüden seçtim.'
        : 'Tam eşleşme bulamadım, menünün öne çıkanlarını öneriyorum.',
    products: productsToShow.map((product) => ({
      productId: product.productId,
      name: product.name,
      description: product.description,
      price: product.price,
    })),
  };
}

// MenuPage, menu listeleme ile AI destekli urun onerisi deneyimini ayni ekranda toplar.
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
  const [activeCategoryId, setActiveCategoryId] = useState<string>();
  const [activeMainGroupId, setActiveMainGroupId] = useState<string>();
  const [prompt, setPrompt] = useState('');
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState('');
  const [showUndoSearch, setShowUndoSearch] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [lastRecommendation, setLastRecommendation] = useState<RecommendationResponse | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const categoryGroups = useMemo(() => {
    const groups: MenuGroupView[] = MENU_GROUPS.map((group) => {
      const groupCategories = categories.filter(
        (category) => getCategoryGroupId(category.name) === group.id,
      );

      return {
        id: group.id,
        label: group.label,
        description: group.description,
        categories: groupCategories,
        productCount: groupCategories.reduce((total, category) => total + category.products.length, 0),
      };
    }).filter((group) => group.categories.length > 0);

    const remainingCategories = categories.filter((category) => getCategoryGroupId(category.name) === 'menu');

    if (remainingCategories.length > 0) {
      groups.push({
        id: 'menu',
        label: 'Yemek',
        description: 'Diğer kategori seçenekleri',
        categories: remainingCategories,
        productCount: remainingCategories.reduce((total, category) => total + category.products.length, 0),
      });
    }

    // 29 Nisan 2026: Hero bölümündeki ana kategori sırasını düzelt: TATLI, İÇECEK, YEMEK
    // Eski sıra: TATLI, İÇECEK, ARA SICAK, YEMEK (Ara Sıcak kaldırıldı)
    const reorderedGroups: MenuGroupView[] = [];
    
    // 1. TATLI
    const dessertGroup = groups.find(g => g.id === 'dessert');
    if (dessertGroup) reorderedGroups.push(dessertGroup);
    
    // 2. İÇECEK
    const drinkGroup = groups.find(g => g.id === 'drink');
    if (drinkGroup) reorderedGroups.push(drinkGroup);
    
    // 3. YEMEK
    const menuGroup = groups.find(g => g.id === 'menu');
    if (menuGroup) reorderedGroups.push(menuGroup);

    return reorderedGroups;
  }, [categories]);

  const activeGroup = useMemo(() => {
    if (!categoryGroups.length) {
      return undefined;
    }

    return (
      categoryGroups.find((group) => group.id === activeMainGroupId) ??
      categoryGroups[0]
    );
  }, [activeMainGroupId, categoryGroups]);

  const activeGroupCategories = activeGroup?.categories ?? [];

  useEffect(() => {
    if (!activeMainGroupId && categoryGroups.length > 0) {
      setActiveMainGroupId(categoryGroups[0].id);
    }
  }, [activeMainGroupId, categoryGroups]);

  useEffect(() => {
    if (!activeGroupCategories.length) {
      return;
    }

    const hasActiveCategoryInGroup = activeGroupCategories.some(
      (category) => category.categoryId === activeCategoryId,
    );

    if (!hasActiveCategoryInGroup) {
      setActiveCategoryId(activeGroupCategories[0].categoryId);
    }
  }, [activeCategoryId, activeGroupCategories]);

  function handlePromptChange(value: string) {
    if (showUndoSearch) {
      setShowUndoSearch(false);
    }

    setPrompt(value);
  }

  function handlePromptKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (
      showRecommendations &&
      lastSubmittedQuery &&
      (event.key === 'Backspace' || event.key === 'Delete')
    ) {
      event.preventDefault();
      setPrompt('');
      setRecommendation(null);
      setShowRecommendations(false);
      setShowUndoSearch(true);
      setRecommendationError(null);
    }
  }

  function handleUndoSearch() {
    if (!lastSubmittedQuery) {
      return;
    }

    setPrompt(lastSubmittedQuery);
    setRecommendation(lastRecommendation);
    setShowRecommendations(Boolean(lastRecommendation?.products.length));
    setShowUndoSearch(false);
  }

  function showRecommendationResult(result: RecommendationResponse) {
    setRecommendation(result);
    setLastRecommendation(result);
    setShowRecommendations(result.products.length > 0);
  }

  async function handleRecommendationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = prompt.trim();

    if (!query) {
      return;
    }

    if (query.length > PROMPT_MAX_LENGTH) {
      setRecommendationError(`Prompt en fazla ${PROMPT_MAX_LENGTH} karakter olabilir.`);
      return;
    }

    setLastSubmittedQuery(query);
    setShowUndoSearch(false);

    try {
      setRecommendationLoading(true);
      setRecommendationError(null);

      if (!restaurantId) {
        showRecommendationResult(buildLocalRecommendation(query, products));
        return;
      }

      const response = await getRecommendationsByPrompt(restaurantId, query);
      showRecommendationResult(response);
    } catch (requestError: any) {
      if (products.length > 0) {
        showRecommendationResult(buildLocalRecommendation(query, products));
        setRecommendationError(null);
        return;
      }

      setRecommendation(null);
      setShowRecommendations(false);
      setRecommendationError(
        extractApiErrorMessage(
          requestError,
          'Öneriler şu anda getirilemedi. Lütfen tekrar deneyin.',
        ),
      );
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

  const visibleProducts = useMemo(() => {
    if (!activeCategoryId) {
      return activeGroupCategories.flatMap((category) => category.products);
    }

    return products.filter(
      (product) =>
        product.categoryId === activeCategoryId &&
        activeGroupCategories.some((category) => category.categoryId === product.categoryId),
    );
  }, [activeCategoryId, activeGroupCategories, products]);

  return (
    <div>
      <section className="-mx-4 -mt-4 space-y-2.5 bg-stone-950 px-4 pb-2.5 pt-3 text-center text-white">
        <div className="grid grid-cols-2 gap-2 text-left">
          <button
            type="button"
            className="group flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition active:scale-[0.98]"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-stone-950">
              <WifiIcon />
            </span>
            <span className="text-left">
              <span className="block text-[9px] uppercase tracking-[0.14em] text-white/50">Wi-Fi</span>
              Bağlan
            </span>
          </button>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition active:scale-[0.98]"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-stone-950">
              <InstagramIcon />
            </span>
            <span>
              <span className="block text-[9px] uppercase tracking-[0.14em] text-white/50">Instagram</span>
              Takip edin
            </span>
          </a>
        </div>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-center">
          <span className="text-base font-black tracking-[0.08em] text-stone-950">LOGO</span>
        </div>

        <div>
          <h1 className="mt-0 text-4xl font-black tracking-[0.12em] text-white">
            MENU
          </h1>
          <div className="mx-auto mt-1.5 h-0.5 w-14 rounded-full bg-white" />
        </div>
      </section>

      {loading ? (
        <div className="mt-5">
          <LoadingState count={5} />
        </div>
      ) : error ? (
        <div className="mt-5">
          <EmptyState title="Menu su anda yuklenemedi" description={error} />
        </div>
      ) : categories.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Aktif urun bulunamadi"
            description="Bu restoran icin su anda yayinda olan bir urun gorunmuyor."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* 29 Nisan 2026: Hero bölümü - Ana kategori başlıkları 2 sütunlu grid'de gösterilir */}
          <section className="-mx-4 bg-stone-950 px-4 pb-3 pt-0">
            <div className="grid grid-cols-2 gap-4">
              {categoryGroups.map((group) => {
                const isActive = group.id === activeGroup?.id;
                const groupLabel = group.label === 'İçecek' ? 'İçecekler' : group.label;

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      setActiveMainGroupId(group.id);
                      setActiveCategoryId(group.categories[0]?.categoryId);
                    }}
                    className={[
                      'px-1 py-0.5 text-center transition active:scale-[0.98]',
                      isActive ? 'text-white' : 'text-white/45 hover:text-white',
                    ].join(' ')}
                  >
                    <h2 className="text-lg font-black uppercase tracking-[0.06em]">{groupLabel}</h2>
                  </button>
                );
              })}
            </div>
          </section>

          <section data-cart-drag-top="true" className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-stone-600">
                FİRMA AI Öneri Asistanı
              </p>
              {showRecommendations && recommendation && (
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                  {recommendation.products.length} öneri
                </span>
              )}
            </div>

            <form
              onSubmit={handleRecommendationSubmit}
              className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 shadow-sm shadow-stone-950/5"
            >
              <span className="pointer-events-none flex h-10 w-8 shrink-0 items-center justify-center text-stone-400">
                <AssistantMarkIcon />
              </span>
              <input
                value={prompt}
                onChange={(event) => handlePromptChange(event.target.value)}
                onKeyDown={handlePromptKeyDown}
                maxLength={PROMPT_MAX_LENGTH}
                placeholder="Tatlı, kahve, ferah bir içecek..."
                className="min-w-0 flex-1 bg-transparent py-2 pr-1 text-sm text-stone-900 outline-none placeholder:text-stone-400"
              />
              {showUndoSearch && lastSubmittedQuery ? (
                <button
                  type="button"
                  onClick={handleUndoSearch}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700 transition active:scale-95"
                  aria-label="Son aramayı geri getir"
                >
                  <UndoIcon />
                </button>
              ) : null}
              <button
                type="submit"
                disabled={recommendationLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-950 text-white shadow-sm transition hover:bg-stone-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                aria-label="Menü önerisi gönder"
              >
                <SendIcon />
              </button>
            </form>

            {recommendationError ? <div className="mt-2"><InlineAlert message={recommendationError} /></div> : null}

            {showRecommendations && recommendation && (
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-6 text-stone-600">{recommendation.message}</p>

                {recommendation.products.length > 0 ? (
                  <div className="grid gap-2">
                    {recommendation.products.map((product) => {
                      const cartProduct = buildRecommendationCartProduct(product.productId);
                      const matchedMenuProduct = products.find(
                        (menuProduct) => menuProduct.productId === product.productId,
                      );
                      const productImage = getProductImage(matchedMenuProduct);
                      const productInitials = getInitials(product.name);
                      const quantity = getBaseCartItem(product.productId)?.quantity ?? 0;

                      return (
                        <article
                          key={product.productId}
                          className="flex items-start gap-3 rounded-[22px] bg-stone-50 px-3 py-3"
                        >
                          <div className="shrink-0 pt-5">
                            {quantity > 0 && cartProduct ? (
                              <div className="inline-flex items-center rounded-full border border-stone-950 bg-white p-1 shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => handleQuickDecrement(cartProduct)}
                                  className="grid h-7 w-7 place-items-center rounded-full text-sm font-black text-stone-950"
                                >
                                  -
                                </button>
                                <span className="min-w-6 text-center text-sm font-black text-stone-950">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickIncrement(cartProduct)}
                                  className="grid h-7 w-7 place-items-center rounded-full bg-stone-950 text-sm font-black text-white"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => cartProduct && handleQuickIncrement(cartProduct)}
                                className="grid h-8 w-8 place-items-center rounded-[10px] border border-stone-300 bg-white text-lg font-black text-stone-950 shadow-sm"
                                aria-label={`${product.name} sepete ekle`}
                              >
                                +
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectRecommendation(product.productId)}
                            className="flex min-w-0 flex-1 gap-3 text-left"
                          >
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[18px] bg-[#ead8bf]">
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center px-2 text-center">
                                  <span className="text-xl font-black text-stone-950/75">
                                    {productInitials}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="line-clamp-2 text-sm font-bold leading-5 text-stone-950">
                                  {product.name}
                                </h4>
                                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-stone-700">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-600">
                                {product.description}
                              </p>
                            </div>
                          </button>
                        </article>
                      );
                    })}
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

          <CategoryTabs
            categories={activeGroupCategories}
            activeCategoryId={activeCategoryId}
            onSelect={(categoryId) =>
              setActiveCategoryId(categoryId)
            }
          />

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Menu Listesi
              </p>
              <p className="-translate-y-0.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-600 shadow-sm shadow-stone-950/5">
                {visibleProducts.length} ürün
              </p>
            </div>

            <div className="grid gap-2">
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
          </section>
        </div>
      )}

      <ProductDetailDrawer
        isOpen={selectedProduct !== null}
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
