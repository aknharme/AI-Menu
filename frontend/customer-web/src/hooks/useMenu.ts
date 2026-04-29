import { useEffect, useMemo, useState } from 'react';
import { getMenu, getProductDetail } from '../services/menuService';
import type {
  MenuCategory,
  MenuResponse,
  ProductDetail,
  ProductListItem,
} from '../types/menu';

type UseMenuOptions = {
  restaurantId?: string;
};

const DEMO_MENU: MenuResponse = {
  restaurantId: 'demo-restaurant',
  restaurantName: 'LOGO',
  categories: [
    {
      categoryId: 'demo-waffle',
      name: 'Tatlı Waffle',
      displayOrder: 1,
      products: [
        {
          productId: 'demo-waffle-berry',
          categoryId: 'demo-waffle',
          categoryName: 'Tatlı Waffle',
          name: 'Çilekli Belçika Waffle',
          description: 'Taze çilek, muz, fındık kırığı ve yoğun çikolata sosu.',
          price: 245,
          tags: ['çilek', 'çikolata', 'popüler'],
        },
        {
          productId: 'demo-waffle-lotus',
          categoryId: 'demo-waffle',
          categoryName: 'Tatlı Waffle',
          name: 'Lotus Karamel Waffle',
          description: 'Lotus kreması, karamel sos, bisküvi parçaları ve vanilyalı dondurma.',
          price: 265,
          tags: ['karamel', 'lotus'],
        },
        // 29 Nisan 2026: Yeni waffle ürünü eklendi
        {
          productId: 'demo-waffle-choco',
          categoryId: 'demo-waffle',
          categoryName: 'Tatlı Waffle',
          name: 'Çikolatalı Krispili Waffle',
          description: 'Yumuşak waffle içine çikolatali krispiler, çikolata sosu ve dondurma.',
          price: 280,
          tags: ['çikolata', 'krispili'],
        },
      ],
    },
    {
      categoryId: 'demo-cake',
      name: 'Pasta Tatlı',
      displayOrder: 2,
      products: [
        {
          productId: 'demo-cake-sebastian',
          categoryId: 'demo-cake',
          categoryName: 'Pasta Tatlı',
          name: 'San Sebastian',
          description: 'Kremamsı cheesecake dokusu, yanında özel çikolata sosu.',
          price: 220,
          tags: ['cheesecake', 'çikolata'],
        },
        {
          productId: 'demo-cake-magnolia',
          categoryId: 'demo-cake',
          categoryName: 'Pasta Tatlı',
          name: 'Muzlu Magnolia',
          description: 'Vanilyalı krema, muz dilimleri ve çıtır bisküvi katmanları.',
          price: 185,
          tags: ['hafif', 'muz'],
        },
        // 29 Nisan 2026: Pasta kategorisine 4 yeni tatlı ürünü eklendi (Tiramisu, Brownie, Panna Cotta, Crêpes)
        {
          productId: 'demo-cake-tiramisu',
          categoryId: 'demo-cake',
          categoryName: 'Pasta Tatlı',
          name: 'Tiramisu',
          description: 'Maskarpone, kahve ve kakao ile yapılan klasik İtalyan tatlısı.',
          price: 200,
          tags: ['kahve', 'lezzetli'],
        },
        {
          productId: 'demo-cake-brownie',
          categoryId: 'demo-cake',
          categoryName: 'Pasta Tatlı',
          name: 'Çikolatalı Brownie',
          description: 'Sıcak, nemli ve çikolata-yüklü brownie, vanilyalı dondurmayla servis.',
          price: 195,
          tags: ['çikolata', 'sıcak'],
        },
        {
          productId: 'demo-cake-pannacotta',
          categoryId: 'demo-cake',
          categoryName: 'Pasta Tatlı',
          name: 'Panna Cotta',
          description: 'Krema ve vanilya ile yapılan hafif, pürüzsüz İtalyan tatlısı.',
          price: 175,
          tags: ['hafif', 'vanilya'],
        },
        {
          productId: 'demo-cake-crepes',
          categoryId: 'demo-cake',
          categoryName: 'Pasta Tatlı',
          name: 'Crêpes',
          description: 'İnce, hafif crêpes, Nutella, muz ve krem şantiye ile.',
          price: 155,
          tags: ['hafif', 'nutella'],
        },
      ],
    },
    {
      categoryId: 'demo-coffee',
      name: 'Kahve İçecek',
      displayOrder: 3,
      products: [
        {
          productId: 'demo-coffee-latte',
          categoryId: 'demo-coffee',
          categoryName: 'Kahve İçecek',
          name: 'Iced Latte',
          description: 'Soğuk süt, çift shot espresso ve dengeli kahve aroması.',
          price: 145,
          tags: ['soğuk', 'kahve'],
        },
        {
          productId: 'demo-coffee-mocha',
          categoryId: 'demo-coffee',
          categoryName: 'Kahve İçecek',
          name: 'White Mocha',
          description: 'Espresso, süt ve beyaz çikolata ile yumuşak içimli sıcak kahve.',
          price: 160,
          tags: ['sıcak', 'çikolata'],
        },
        // 29 Nisan 2026: Kahve kategorisine 3 yeni kahve ürünü eklendi (Espresso, Cappuccino, Macchiato)
        {
          productId: 'demo-coffee-espresso',
          categoryId: 'demo-coffee',
          categoryName: 'Kahve İçecek',
          name: 'Espresso',
          description: 'Koyun, yoğun kahve. Saf ve güçlü tadı ile kahve severler için ideal.',
          price: 95,
          tags: ['kahve', 'sade'],
        },
        {
          productId: 'demo-coffee-cappuccino',
          categoryId: 'demo-coffee',
          categoryName: 'Kahve İçecek',
          name: 'Cappuccino',
          description: 'Espresso ve sıcak süt köpüğü ile yapılan İtalyan kahvesi.',
          price: 135,
          tags: ['kahve', 'sıcak'],
        },
        {
          productId: 'demo-coffee-macchiato',
          categoryId: 'demo-coffee',
          categoryName: 'Kahve İçecek',
          name: 'Macchiato',
          description: 'Espresso üzerine az miktarda süt köpüğü eklenen rafine kahve.',
          price: 125,
          tags: ['kahve', 'hafif'],
        },
      ],
    },
    {
      categoryId: 'demo-cold-drink',
      name: 'Soğuk İçecek',
      displayOrder: 4,
      products: [
        {
          productId: 'demo-drink-lemonade',
          categoryId: 'demo-cold-drink',
          categoryName: 'Soğuk İçecek',
          name: 'Naneli Limonata',
          description: 'Taze limon, nane ve buz ile ferahlatıcı ev yapımı limonata.',
          price: 125,
          tags: ['ferah', 'nane'],
        },
        {
          productId: 'demo-drink-milkshake',
          categoryId: 'demo-cold-drink',
          categoryName: 'Soğuk İçecek',
          name: 'Çilekli Milkshake',
          description: 'Çilek püresi, süt ve vanilyalı dondurma ile yoğun kıvam.',
          price: 175,
          tags: ['çilek', 'soğuk'],
        },
        // 29 Nisan 2026: Soğuk içecek kategorisine Mango Shake ürünü eklendi
        {
          productId: 'demo-drink-mango',
          categoryId: 'demo-cold-drink',
          categoryName: 'Soğuk İçecek',
          name: 'Mango Shake',
          description: 'Taze mango, yoğurt ve süt ile yapılan tropik shake.',
          price: 155,
          tags: ['mango', 'soğuk'],
        },
      ],
    },
    // 29 Nisan 2026: Burger kategorisi tamamen yeni eklendi (6 burger ürünü)
    {
      categoryId: 'demo-burger',
      name: 'Burger',
      displayOrder: 5,
      products: [
        {
          productId: 'demo-burger-classic',
          categoryId: 'demo-burger',
          categoryName: 'Burger',
          name: 'Klasik Burger',
          description: 'Dana köfte, cheddar ve ev yapımı sos ile servis edilir.',
          price: 280,
          tags: ['burger', 'doyurucu'],
        },
        {
          productId: 'demo-burger-chicken',
          categoryId: 'demo-burger',
          categoryName: 'Burger',
          name: 'Tavuk Burger',
          description: 'Çıtır tavuk, coleslaw ve hardal sos ile sunulur.',
          price: 265,
          tags: ['tavuk', 'çıtır'],
        },
        {
          productId: 'demo-burger-bacon',
          categoryId: 'demo-burger',
          categoryName: 'Burger',
          name: 'Bacon Burger',
          description: 'Crispy bacon, cheese ve special sauce ile hazırlanan leziz burger.',
          price: 295,
          tags: ['bacon', 'lezzetli'],
        },
        {
          productId: 'demo-burger-deluxe',
          categoryId: 'demo-burger',
          categoryName: 'Burger',
          name: 'Deluxe Burger',
          description: 'Çift köfte, cheddar, bacon, egg ve tüm ekstralarla zengin burger.',
          price: 340,
          tags: ['doyurucu', 'special'],
        },
        {
          productId: 'demo-burger-veggie',
          categoryId: 'demo-burger',
          categoryName: 'Burger',
          name: 'Veggie Burger',
          description: 'Sebze ve tahıl proteininden yapılan sağlıklı vegan burger alternatifi.',
          price: 260,
          tags: ['vegan', 'sağlıklı'],
        },
        {
          productId: 'demo-burger-spicy',
          categoryId: 'demo-burger',
          categoryName: 'Burger',
          name: 'Spicy Chicken Burger',
          description: 'Acı baharatlarla marinated tavuk, jalapeño ve hot sauce ile ateşli burger.',
          price: 275,
          tags: ['tavuk', 'acılı'],
        },
      ],
    },
    // 29 Nisan 2026: Salata & Kaseler kategorisi tamamen yeni eklendi (4 salata/bowl ürünü)
    {
      categoryId: 'demo-salad',
      name: 'Salata & Kaseler',
      displayOrder: 6,
      products: [
        {
          productId: 'demo-salad-caesar',
          categoryId: 'demo-salad',
          categoryName: 'Salata & Kaseler',
          name: 'Caesar Salata',
          description: 'Tavuklu ve parmesanli hafif öğün seçeneği.',
          price: 230,
          tags: ['hafif', 'tavuk'],
        },
        {
          productId: 'demo-salad-mediterranean',
          categoryId: 'demo-salad',
          categoryName: 'Salata & Kaseler',
          name: 'Akdeniz Kasesi',
          description: 'Nohut, kinoali ve renkli sebzeli hafif bowl.',
          price: 215,
          tags: ['hafif', 'vegan'],
        },
        {
          productId: 'demo-salad-greek',
          categoryId: 'demo-salad',
          categoryName: 'Salata & Kaseler',
          name: 'Greek Salad',
          description: 'Feta peyniri, zeytin ve domates ile Akdeniz lezzetleri.',
          price: 205,
          tags: ['hafif', 'sağlıklı'],
        },
        {
          productId: 'demo-salad-tofu',
          categoryId: 'demo-salad',
          categoryName: 'Salata & Kaseler',
          name: 'Tofu Buddha Bowl',
          description: 'Grilli tofu, kinoa, avokado ve tahini soslu protein-yüklü bowl.',
          price: 250,
          tags: ['vegan', 'protein'],
        },
      ],
    },
  ],
};

function getActiveDemoCategories() {
  return DEMO_MENU.categories.filter((category) => category.products.length > 0);
}

function buildDemoDetail(product: ProductListItem): ProductDetail {
  return {
    productId: product.productId,
    restaurantId: DEMO_MENU.restaurantId,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    name: product.name,
    description: product.description,
    ingredients: product.description,
    price: product.price,
    allergens: [],
    tags: product.tags,
    variants: [],
  };
}

export function useMenu({ restaurantId }: UseMenuOptions) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [productDetailLoading, setProductDetailLoading] = useState(false);
  const [productDetailError, setProductDetailError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      if (!restaurantId) {
        const demoCategories = getActiveDemoCategories();
        setLoading(false);
        setError(null);
        setMenu(DEMO_MENU);
        setCategories(demoCategories);
        setProducts(demoCategories.flatMap((category) => category.products));
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getMenu(restaurantId);

        if (!isMounted) {
          return;
        }

        const activeCategories = data.categories.filter((category) => category.products.length > 0);

        setMenu(data);
        setCategories(activeCategories);
        setProducts(activeCategories.flatMap((category) => category.products));
      } catch {
        if (!isMounted) {
          return;
        }

        const demoCategories = getActiveDemoCategories();
        setError(null);
        setMenu(DEMO_MENU);
        setCategories(demoCategories);
        setProducts(demoCategories.flatMap((category) => category.products));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  useEffect(() => {
    let isMounted = true;

    async function loadProductDetail() {
      if (!selectedProduct) {
        setProductDetail(null);
        setProductDetailError(null);
        setProductDetailLoading(false);
        return;
      }

      if (!restaurantId || selectedProduct.productId.startsWith('demo-')) {
        setProductDetail(buildDemoDetail(selectedProduct));
        setProductDetailError(null);
        setProductDetailLoading(false);
        return;
      }

      try {
        setProductDetailLoading(true);
        setProductDetailError(null);
        const detail = await getProductDetail(restaurantId, selectedProduct.productId);

        if (isMounted) {
          setProductDetail(detail);
        }
      } catch {
        if (isMounted) {
          setProductDetail(null);
          setProductDetailError('Ürün detayı şu anda getirilemedi.');
        }
      } finally {
        if (isMounted) {
          setProductDetailLoading(false);
        }
      }
    }

    loadProductDetail();

    return () => {
      isMounted = false;
    };
  }, [restaurantId, selectedProduct]);

  const featuredCategory = useMemo(() => categories[0] ?? null, [categories]);

  return {
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
  };
}
