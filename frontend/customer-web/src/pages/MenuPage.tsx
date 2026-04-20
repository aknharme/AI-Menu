import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartSheet from '../components/CartSheet';
import CategoryTabs from '../components/CategoryTabs';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import ProductCard from '../components/ProductCard';
import ProductDetailDrawer from '../components/ProductDetailDrawer';
import QrEntryPanel from '../components/QrEntryPanel';
import { useMenu } from '../hooks/useMenu';
import { useQueryParams } from '../hooks/useQueryParams';
import { createOrder } from '../services/orderService';
import type { ProductListItem } from '../types/menu';
import type { CartItem, OrderResponse } from '../types/order';

export default function MenuPage() {
  const navigate = useNavigate();
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);

  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].categoryId);
    }
  }, [activeCategoryId, categories]);

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

  function addToCart(product: ProductListItem, quantity: number) {
    setCartItems((current) => {
      const existingItem = current.find((item) => item.productId === product.productId);

      if (!existingItem) {
        return [
          ...current,
          {
            productId: product.productId,
            name: product.name,
            unitPrice: product.price,
            quantity,
          },
        ];
      }

      return current.map((item) =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    });

    setOrderResult(null);
    setOrderError(null);
  }

  function incrementCartItem(productId: string) {
    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function decrementCartItem(productId: string) {
    setCartItems((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeCartItem(productId: string) {
    setCartItems((current) => current.filter((item) => item.productId !== productId));
  }

  function navigateFromQr(rawValue: string) {
    const value = rawValue.trim();

    if (!value) {
      return;
    }

    try {
      const currentOrigin = window.location.origin;
      const url = value.startsWith('http') ? new URL(value) : new URL(value, currentOrigin);
      const segments = url.pathname.split('/').filter(Boolean);

      const menuIndex = segments.findIndex((segment) => segment === 'menu');
      const routeRestaurantId =
        menuIndex >= 0 && segments.length > menuIndex + 1 ? segments[menuIndex + 1] : undefined;
      const tableIndex = segments.findIndex((segment) => segment === 'table');
      const routeTableId =
        tableIndex >= 0 && segments.length > tableIndex + 1 ? segments[tableIndex + 1] : undefined;

      const nextRestaurantId = routeRestaurantId ?? url.searchParams.get('restaurantId') ?? undefined;
      const nextTableId = routeTableId ?? url.searchParams.get('tableId') ?? undefined;

      if (!nextRestaurantId) {
        setOrderError('QR linkinde restaurantId bulunamadi.');
        return;
      }

      const targetPath = nextTableId
        ? `/menu/${nextRestaurantId}/table/${nextTableId}`
        : `/menu/${nextRestaurantId}`;

      navigate(targetPath);
    } catch {
      setOrderError('QR icerigi okunamadi. Gecerli bir link veya path gir.');
    }
  }

  async function submitOrder() {
    if (!restaurantId || !tableId) {
      setOrderError('Siparis gonderebilmek icin restoran ve masa bilgisi gerekli.');
      return;
    }

    if (cartItems.length === 0) {
      setOrderError('Siparis olusturmak icin en az bir urun eklemelisin.');
      return;
    }

    try {
      setOrderSubmitting(true);
      setOrderError(null);
      const response = await createOrder({
        restaurantId,
        tableId,
        customerName: customerName.trim(),
        note: orderNote.trim(),
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      setOrderResult(response);
      setCartItems([]);
      setCustomerName('');
      setOrderNote('');
    } catch {
      setOrderError('Siparis gonderilemedi. Masa bilgisi ve urunlerin gecerli oldugundan emin ol.');
    } finally {
      setOrderSubmitting(false);
    }
  }

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <QrEntryPanel
            currentRestaurantId={restaurantId}
            currentTableId={tableId}
            onNavigateFromQr={navigateFromQr}
          />

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
                    <h3 className="mt-2 text-2xl font-semibold text-stone-950">
                      {activeCategoryName}
                    </h3>
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
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <CartSheet
            items={cartItems}
            customerName={customerName}
            note={orderNote}
            tableLabel={tableId ? `Masa ${tableId}` : undefined}
            isSubmitting={orderSubmitting}
            orderResult={orderResult}
            submitError={orderError}
            onCustomerNameChange={setCustomerName}
            onNoteChange={setOrderNote}
            onIncrement={incrementCartItem}
            onDecrement={decrementCartItem}
            onRemove={removeCartItem}
            onSubmit={() => void submitOrder()}
          />
        </div>
      </div>

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
