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
const QUICK_FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'light', label: 'Hafif' },
  { id: 'chicken', label: 'Tavuk' },
  { id: 'drink', label: 'İçecek' },
  { id: 'dessert', label: 'Tatlı' },
] as const;

type QuickFilterId = (typeof QUICK_FILTERS)[number]['id'];

type MenuGroupView = {
  id: string;
  label: string;
  description: string;
  mainCategory: MenuCategory;
  categories: MenuCategory[];
  productCount: number;
};

function normalizeMenuText(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    // Turkce buyuk I harfi locale ile "ı" oldugu icin anahtar kelime eslesmesinde ASCII tabanli normalize edilir.
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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

const PRODUCT_IMAGES: Record<string, string> = {
  // Çorbalar
  "Mercimek Çorbası": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",

  // Yemekler
  "Izgara Köfte": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80",
  "Tavuk Külbastı": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
  "Adana Kebap": "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80",
  "Fettuccine Alfredo": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80",
  "Margarita Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
  "Sezar Salata": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80",
  "Hamburger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
  "Lahmacun": "https://images.unsplash.com/photo-1541014741259-df5290db5785?auto=format&fit=crop&w=600&q=80",
  "Karışık Kebap": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",

  // İçecekler
  "Kola": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
  "Fanta": "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=600&q=80",
  "Ayran": "https://images.unsplash.com/photo-1569529465841-dfedd87500f8?auto=format&fit=crop&w=600&q=80",
  "Ev Yapımı Limonata": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
  "Iced Latte": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
  "Türk Kahvesi": "https://images.unsplash.com/photo-1579888944880-d983411488c1?auto=format&fit=crop&w=600&q=80",
  "Bergamotlu Türk Çayı": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
  "Taze Sıkılmış Portakal Suyu": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
  "Soda": "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=600&q=80",
  "Su": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80",

  // Tatlılar
  "Fıstıklı Künefe": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80",
  "San Sebastian": "https://images.unsplash.com/photo-1524351199679-46cddf530c04?auto=format&fit=crop&w=600&q=80",
  "Fırın Sütlaç": "https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80",
  "Valrhona Çikolatalı Sufle": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
  "Çilekli Magnolia": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
  "Tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",

  // Alkollü İçecekler
  "Efes Pilsen": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80",
  "Kırmızı Şarap (Kadeh)": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
  "Mojito": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
  "Rakı (Duble)": "https://images.unsplash.com/photo-1569529465841-dfedd87500f8?auto=format&fit=crop&w=600&q=80"
};

function getProductImage(product?: ProductListItem) {
  return product?.imageUrl ?? product?.photoUrl ?? product?.thumbnailUrl ?? (product ? PRODUCT_IMAGES[product.name] : undefined);
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

const AI_SUGGESTIONS = [
  { id: 'chef', label: '👨‍🍳 Şefin Seçimi', prompt: 'Bugün şefin spesiyali veya öne çıkan yemeği ne var?' },
  { id: 'healthy', label: '🍃 Hafif & Sağlıklı', prompt: 'Hafif, sağlıklı veya diyet dostu ne önerebilirsin?' },
  { id: 'sweet', label: '🍫 Tatlı Kaçamağı', prompt: 'En çok tercih edilen tatlılar ve yanına yakışacak kahveler neler?' },
  { id: 'drink', label: '🍹 Buz Gibi İçecekler', prompt: 'Ferahlatıcı soğuk içecek önerisi alabilir miyim?' },
] as const;

// MenuPage, menu listeleme ile AI destekli urun onerisi deneyimini ayni ekranda toplar.
export default function MenuPage() {
  const { restaurantId, tableId } = useQueryParams();
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isAiSpaceOpen, setIsAiSpaceOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    const dismissed = sessionStorage.getItem('ai_menu_splash_dismissed');
    return dismissed !== 'true';
  });

  // Mouse drag-to-scroll event handlers for categories row
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setIsMouseDown(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const container = e.currentTarget;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    container.scrollLeft = scrollLeft - walk;
  };

  function handleDismissSplash() {
    sessionStorage.setItem('ai_menu_splash_dismissed', 'true');
    setShowSplash(false);
  }

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
  const [menuSearch, setMenuSearch] = useState('');
  const [quickFilter] = useState<QuickFilterId>('all');
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState('');
  const [showUndoSearch, setShowUndoSearch] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [lastRecommendation, setLastRecommendation] = useState<RecommendationResponse | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
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
          description: subCategories.length > 0 ? `${subCategories.length} alt menü` : 'Alt menü yok',
          mainCategory: category,
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
      setActiveCategoryId(undefined);
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

  async function handleSuggestionClick(query: string) {
    setPrompt(query);
    setLastSubmittedQuery(query);
    setShowUndoSearch(false);
    
    try {
      setRecommendationLoading(true);
      setRecommendationError(null);
      
      if (!restaurantId) {
        showRecommendationResult(buildLocalRecommendation(query, products));
        return;
      }
      
      const response = await getRecommendationsByPrompt(restaurantId, query, tableId);
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
    setShowRecommendations(Boolean(result.message || result.products.length > 0));
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

      const response = await getRecommendationsByPrompt(restaurantId, query, tableId);
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
      const matchesQuickFilter =
        quickFilter === 'all' ||
        (quickFilter === 'light' && searchableText.includes('hafif')) ||
        (quickFilter === 'chicken' && searchableText.includes('tavuk')) ||
        (quickFilter === 'drink' &&
          ['icecek', 'kahve', 'limonata', 'soda', 'kola', 'mesrubat'].some((keyword) =>
            searchableText.includes(keyword),
          )) ||
        (quickFilter === 'dessert' &&
          ['tatli', 'pasta', 'waffle', 'cheesecake', 'dessert'].some((keyword) =>
            searchableText.includes(keyword),
          ));

      return matchesSearch && matchesQuickFilter;
    });
  }, [activeCategoryId, activeGroupCategories, menuSearch, products, quickFilter]);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white px-6 py-12 select-none animate-fade-in-up">
        {/* Ambient Blur Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />

        {/* Top Header decoration */}
        <div className="text-center pt-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-stone-800 bg-stone-900/40 backdrop-blur-md">
            <svg className="h-6 w-6 text-amber-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="block text-[10px] font-black uppercase tracking-[0.26em] text-stone-500 mt-3">GURME EXPERIENCE</span>
        </div>

        {/* Middle Welcome Content */}
        <div className="text-center space-y-6 max-w-sm mx-auto relative z-10">
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/25 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
              MASA {tableId || '4'}
            </span>
            <h1 className="text-3xl font-black tracking-wide leading-tight text-white uppercase">
              Hoş Geldiniz
            </h1>
          </div>
          <div className="h-0.5 w-10 bg-amber-400/50 mx-auto rounded-full" />
          <p className="text-xs leading-6 text-stone-400 font-semibold tracking-wide px-4">
            Sizin için taze malzemeler ve şefimizin imza dokunuşlarıyla hazırladığımız özel gastronomi serüvenine davetlisiniz.
          </p>
        </div>

        {/* Bottom CTA Button */}
        <div className="text-center space-y-4 px-4 relative z-10">
          <button
            type="button"
            onClick={handleDismissSplash}
            className="w-full max-w-xs rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase py-4.5 tracking-[0.2em] shadow-xl shadow-amber-500/10 transition active:scale-[0.97]"
          >
            Menüyü Keşfet
          </button>
          <p className="text-[9px] uppercase tracking-[0.14em] text-stone-600 font-medium">Temassız & Akıllı Sipariş Sistemi</p>
        </div>
      </div>
    );
  }

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

        {/* Yatay Kaydırılabilir Ana Kategoriler */}
        <div
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex gap-6 overflow-x-auto scrollbar-none pb-1 pt-2 w-full justify-start md:justify-center px-4 cursor-grab active:cursor-grabbing select-none"
        >
          {categoryGroups.map((group) => {
            const isActive = group.id === activeGroup?.id;

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  setActiveMainGroupId(group.id);
                  setActiveCategoryId(group.categories[0]?.categoryId);
                }}
                className={[
                  'shrink-0 px-2 py-1 text-center transition active:scale-[0.98]',
                  isActive ? 'text-white border-b-2 border-white' : 'text-white/45 hover:text-white',
                ].join(' ')}
              >
                <h2 className="text-base font-black uppercase tracking-[0.08em]">{group.label}</h2>
              </button>
            );
          })}
        </div>
      </section>

      {loading ? (
        <div className="mt-5">
          <LoadingState count={5} />
        </div>
      ) : error ? (
        <div className="mt-5">
          <EmptyState title="Menü şu anda yüklenemedi" description={error} />
        </div>
      ) : categories.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Aktif ürün bulunamadı"
            description="Bu restoran için şu anda yayında olan bir ürün görünmüyor."
          />
        </div>
      ) : (
        <div className="space-y-4">



          <CategoryTabs
            categories={activeGroupCategories}
            activeCategoryId={activeCategoryId}
            onSelect={(categoryId) =>
              setActiveCategoryId(categoryId)
            }
          />

          <section className="space-y-2">
            <div className="rounded-[22px] bg-white p-2.5 shadow-sm shadow-stone-950/5 border border-stone-100">
              <input
                value={menuSearch}
                onChange={(event) => setMenuSearch(event.target.value)}
                placeholder="Menüde ara"
                className="w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Menü Listesi
              </p>
              <p className="-translate-y-0.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-600 shadow-sm shadow-stone-950/5">
                {visibleProducts.length} ürün
              </p>
            </div>

            {activeGroupCategories.length === 0 ? (
              <EmptyState
                title="Alt menü yok"
                description="Bu ana kategoride henüz aktif alt menü bulunmuyor."
              />
            ) : visibleProducts.length === 0 ? (
              menuSearch.trim() ? (
                <EmptyState
                  title="Ürün bulunamadı"
                  description="Arama terimini değiştirerek tekrar deneyebilirsiniz."
                />
              ) : (
                <EmptyState
                  title="Bu alt menüde ürün bulunmuyor"
                  description="Admin panelden ürün eklendiğinde burada görünecek."
                />
              )
            ) : (
              <div className="grid gap-2 pb-[72px]">
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

      {/* Floating Sparkle AI Cube/Sphere Button */}
      <div
        className="fixed z-20 select-none"
        style={{
          left: 'max(1rem, calc((100vw - 28rem) / 2 + 1rem))',
          bottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
        }}
      >
        <button
          type="button"
          onClick={() => setIsAiSpaceOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/35 border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95 animate-breathe-glow"
          aria-label="AI Asistanı Aç"
        >
          <svg className="h-6.5 w-6.5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M9.813 15.904L9 21l-1.904-.813L4 18.283l5.096-.813L9.813 12.37l.813 5.096L15.72 18.28l-5.096.813-.813 5.096zM19 8.5L17.5 10l-1.5-1.5L14.5 7l1.5-1.5L17.5 4 19 5.5l1.5-1.5L22 7l-1.5 1.5L19 8.5z" />
          </svg>
        </button>
      </div>

      {/* Immersive AI Concierge Overlay Sheet */}
      {isAiSpaceOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/70 backdrop-blur-md p-0 sm:p-6 animate-fade-in-up">
          <div className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 text-white shadow-2xl border-t border-stone-800 sm:rounded-[32px] sm:border animate-slide-up">
            
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-stone-800 px-5 py-4 bg-stone-900/60 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 h-10 w-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black tracking-wider uppercase text-emerald-400">
                    Firma AI Garson
                  </h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">Sipariş & Öneri Konsiyerji</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiSpaceOpen(false)}
                className="shrink-0 rounded-full border border-stone-800 bg-stone-900 px-4 py-2 text-xs font-black text-stone-300 hover:text-white transition active:scale-95"
              >
                Kapat
              </button>
            </div>

            {/* Immersive Body */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 scrollbar-none">
              
              {/* Cozy Welcoming message from AI */}
              <div className="flex items-start gap-2.5 animate-fade-in-up">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 border border-white/20">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="relative rounded-[22px] rounded-tl-none bg-stone-800/80 border border-stone-700/60 px-4 py-3.5 text-xs leading-6 font-semibold text-stone-200 shadow-sm max-w-[85%]">
                  <p>Hoş geldiniz! 🌟 Ben dijital yapay zeka asistanınızım. Menüyü sizin için tarayabilir, damak tadınıza veya modunuza en uygun eşleştirmeleri yapabilirim.</p>
                  <p className="mt-2 text-stone-400 text-[10px] font-normal">Aşağıdaki popüler önerileri deneyebilir veya istediğiniz lezzetleri doğrudan yazabilirsiniz.</p>
                </div>
              </div>

              {/* Chat recommendations and details */}
              {recommendationError ? (
                <div className="mt-2"><InlineAlert message={recommendationError} /></div>
              ) : null}

              {showRecommendations && recommendation && (
                <div className="mt-4 space-y-4">
                  {/* AI Response Chat Balloon */}
                  <div className="flex items-start gap-2.5 animate-fade-in-up">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 border border-white/20">
                      <svg className="h-4.5 w-4.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="relative rounded-[22px] rounded-tl-none bg-emerald-950/40 border border-emerald-900/65 px-4 py-3 text-xs leading-6 font-semibold text-emerald-200 shadow-sm max-w-[85%]">
                      <p>{recommendation.message}</p>
                    </div>
                  </div>

                  {/* Horizontal Product Carousel inside Overlay Sheet */}
                  {recommendation.products.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory animate-fade-in-up -mx-5 px-5">
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
                            className="flex-none w-[270px] snap-start rounded-[24px] bg-stone-900 border border-stone-800 p-3 shadow-xl flex flex-col justify-between"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setIsAiSpaceOpen(false);
                                handleSelectRecommendation(product.productId);
                              }}
                              className="flex gap-3 text-left w-full align-top"
                            >
                              <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-[16px] bg-stone-800 shadow-inner border border-stone-700/50">
                                {productImage ? (
                                  <img
                                    src={productImage}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center px-1.5 text-center">
                                    <span className="text-lg font-black text-stone-200">
                                      {productInitials}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="line-clamp-1 text-sm font-bold text-white leading-tight">
                                  {product.name}
                                </h4>
                                <p className="mt-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block px-2 py-0.5 text-[10px] font-black text-emerald-400">
                                  {formatPrice(product.price)}
                                </p>
                                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-stone-400">
                                  {product.description}
                                </p>
                              </div>
                            </button>

                            {/* Action Row */}
                            <div className="mt-3.5 pt-2.5 border-t border-stone-800/80 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAiSpaceOpen(false);
                                  handleSelectRecommendation(product.productId);
                                }}
                                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition"
                              >
                                Detayları Gör
                              </button>

                              <div className="shrink-0">
                                {quantity > 0 && cartProduct ? (
                                  <div className="inline-flex items-center rounded-full border border-stone-700 bg-stone-950 p-0.5 shadow-sm scale-90">
                                    <button
                                      type="button"
                                      onClick={() => handleQuickDecrement(cartProduct)}
                                      className="grid h-6 w-6 place-items-center rounded-full text-xs font-black text-stone-300"
                                    >
                                      -
                                    </button>
                                    <span className="min-w-5 text-center text-xs font-black text-white">
                                      {quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickIncrement(cartProduct)}
                                      className="grid h-6 w-6 place-items-center rounded-full bg-stone-300 text-xs font-black text-stone-900"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => cartProduct && handleQuickIncrement(cartProduct)}
                                    className="flex items-center gap-1 px-3 py-1 rounded-[10px] border border-stone-700 bg-stone-850 text-xs font-black text-white shadow-sm active:scale-95 hover:bg-stone-800 transition"
                                    aria-label={`${product.name} sepete ekle`}
                                  >
                                    <span>Ekle</span>
                                    <span className="font-light">+</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Footer Input Area */}
            <div className="shrink-0 border-t border-stone-800 bg-stone-950/80 px-4 py-4 backdrop-blur-md">
              
              {/* Smart Suggestion Chips */}
              <div className="flex gap-2 overflow-x-auto pb-3.5 scrollbar-none">
                {AI_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.id}
                    type="button"
                    onClick={() => handleSuggestionClick(sug.prompt)}
                    disabled={recommendationLoading}
                    className="shrink-0 rounded-full border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs font-bold text-stone-300 shadow-sm transition active:scale-[0.97] hover:bg-stone-800 hover:text-white disabled:opacity-60"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleRecommendationSubmit}
                className={`flex items-center gap-2 rounded-full border bg-stone-900 px-3 py-1.5 transition-all duration-300 ${
                  isInputFocused 
                    ? 'border-emerald-500/50 shadow-md shadow-emerald-500/[0.05]' 
                    : 'border-stone-800'
                }`}
              >
                <span className={`pointer-events-none flex h-9 w-7 shrink-0 items-center justify-center transition-colors duration-300 ${
                  isInputFocused || prompt ? 'text-emerald-400' : 'text-stone-500'
                }`}>
                  <AssistantMarkIcon />
                </span>
                <input
                  value={prompt}
                  onChange={(event) => handlePromptChange(event.target.value)}
                  onKeyDown={handlePromptKeyDown}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  maxLength={PROMPT_MAX_LENGTH}
                  placeholder="Canınız ne çekiyor? Buraya yazın..."
                  className="min-w-0 flex-1 bg-transparent py-2 pr-1 text-sm text-white outline-none placeholder:text-stone-500"
                />
                {showUndoSearch && lastSubmittedQuery ? (
                  <button
                    type="button"
                    onClick={handleUndoSearch}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-800 text-stone-300 transition active:scale-95 hover:bg-stone-700"
                    aria-label="Son aramayı geri getir"
                  >
                    <UndoIcon />
                  </button>
                ) : null}
                <button
                  type="submit"
                  disabled={recommendationLoading || !prompt.trim()}
                  className={`flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all duration-300 active:scale-95 disabled:cursor-not-allowed ${
                    prompt.trim() 
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' 
                      : 'bg-stone-800 opacity-60'
                  }`}
                  aria-label="Menü önerisi gönder"
                >
                  {recommendationLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
