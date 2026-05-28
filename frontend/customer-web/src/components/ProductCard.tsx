import type { ProductListItem } from '../types/menu';
import { formatPrice } from '../utils/formatPrice';

type ProductCardProps = {
  product: ProductListItem;
  quantity: number;
  onSelect: (product: ProductListItem) => void;
  onIncrement: (product: ProductListItem) => void;
  onDecrement: (product: ProductListItem) => void;
};

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

function getProductImage(product: ProductListItem) {
  return product.imageUrl ?? product.photoUrl ?? product.thumbnailUrl ?? PRODUCT_IMAGES[product.name];
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

export default function ProductCard({
  product,
  quantity,
  onSelect,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const productImage = getProductImage(product);
  const productInitials = getInitials(product.name);

  return (
    <article className="flex items-center gap-3 bg-white py-3 sm:gap-4">
      <div className="shrink-0">
          {quantity > 0 ? (
            <div className="inline-flex items-center rounded-full border border-stone-950 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => onDecrement(product)}
                className="grid h-7 w-7 place-items-center rounded-full text-sm font-black text-stone-950"
              >
                -
              </button>
              <span className="min-w-6 text-center text-sm font-black text-stone-950">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrement(product)}
                className="grid h-7 w-7 place-items-center rounded-full bg-stone-950 text-sm font-black text-white"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onIncrement(product)}
              className="grid h-8 w-8 place-items-center rounded-[10px] border border-stone-300 bg-white text-lg font-black text-stone-950 shadow-sm"
              aria-label={`${product.name} sepete ekle`}
            >
              +
            </button>
          )}
        </div>

      <button
        type="button"
        onClick={() => onSelect(product)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[22px] bg-[#ead8bf] sm:h-28 sm:w-28">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-3 text-center">
              <span className="text-2xl font-black text-stone-950/75">{productInitials}</span>
              <span className="mt-2 line-clamp-1 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-700">
                {product.categoryName}
              </span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-0.5">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 text-base font-semibold leading-6 text-stone-950">
                {product.name}
              </h3>
              <span className="shrink-0 rounded-full bg-stone-950 px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-stone-950/15">
                {formatPrice(product.price)}
              </span>
            </div>

            <p className="line-clamp-2 text-sm leading-5 text-stone-600">{product.description}</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <span className="shrink-0 text-sm font-semibold text-stone-500">Detay</span>
          </div>
        </div>
      </button>
    </article>
  );
}
