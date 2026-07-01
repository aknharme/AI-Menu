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
  restaurantName: 'Van Irish Pub',
  categories: [
    {
      categoryId: 'demo-draft-beer',
      name: 'Fıçı Biralar',
      displayOrder: 1,
      products: [
        {
          productId: 'demo-draft-guinness',
          categoryId: 'demo-draft-beer',
          categoryName: 'Fıçı Biralar',
          name: 'Guinness Draught',
          description: 'Kremamsı köpük, kavruk malt ve yumuşak bitter bitiş.',
          price: 240,
          imageUrl: 'https://loremflickr.com/900/700/beer,pint,stout?lock=101',
          tags: ['fıçı', 'bira', 'guinness', 'popüler', 'stout'],
        },
        {
          productId: 'demo-draft-kilkenny',
          categoryId: 'demo-draft-beer',
          categoryName: 'Fıçı Biralar',
          name: 'Kilkenny Irish Ale',
          description: 'Karamel malt, düşük gaz ve kadifemsi Irish red ale gövdesi.',
          price: 230,
          imageUrl: 'https://loremflickr.com/900/700/beer,ale,pint?lock=102',
          tags: ['fıçı', 'bira', 'ale', 'irish'],
        },
        {
          productId: 'demo-draft-lager',
          categoryId: 'demo-draft-beer',
          categoryName: 'Fıçı Biralar',
          name: 'Van House Lager',
          description: 'Soğuk servis edilen, temiz içimli ve ferah pub lager.',
          price: 185,
          imageUrl: 'https://loremflickr.com/900/700/lager,beer,pint?lock=103',
          tags: ['fıçı', 'bira', 'lager', 'ferah'],
        },
        {
          productId: 'demo-draft-ipa',
          categoryId: 'demo-draft-beer',
          categoryName: 'Fıçı Biralar',
          name: 'Emerald IPA',
          description: 'Narenciye aroması, belirgin şerbetçiotu ve kuru bitiş.',
          price: 220,
          imageUrl: 'https://loremflickr.com/900/700/ipa,craft-beer?lock=104',
          tags: ['fıçı', 'bira', 'ipa', 'aromatik'],
        },
      ],
    },
    {
      categoryId: 'demo-bottle-beer',
      name: 'Şişe Biralar & Cider',
      displayOrder: 2,
      products: [
        {
          productId: 'demo-bottle-corona',
          categoryId: 'demo-bottle-beer',
          categoryName: 'Şişe Biralar & Cider',
          name: 'Corona Extra',
          description: 'Lime dilimiyle servis edilen hafif ve ferah şişe lager.',
          price: 190,
          imageUrl: 'https://loremflickr.com/900/700/bottled-beer,lime?lock=105',
          tags: ['şişe', 'bira', 'lager', 'ferah'],
        },
        {
          productId: 'demo-bottle-budweiser',
          categoryId: 'demo-bottle-beer',
          categoryName: 'Şişe Biralar & Cider',
          name: 'Budweiser',
          description: 'Dengeli malt karakteri ve kolay içimli Amerikan lager.',
          price: 175,
          imageUrl: 'https://loremflickr.com/900/700/beer,bottle,bar?lock=106',
          tags: ['şişe', 'bira', 'lager'],
        },
        {
          productId: 'demo-cider-apple',
          categoryId: 'demo-bottle-beer',
          categoryName: 'Şişe Biralar & Cider',
          name: 'Magners Apple Cider',
          description: 'Elma aromalı, hafif tatlı ve buzla servis edilen cider.',
          price: 210,
          imageUrl: 'https://loremflickr.com/900/700/cider,apple,drink?lock=107',
          tags: ['cider', 'elma', 'ferah'],
        },
      ],
    },
    {
      categoryId: 'demo-cocktails',
      name: 'Kokteyller',
      displayOrder: 3,
      products: [
        {
          productId: 'demo-cocktail-irish-mule',
          categoryId: 'demo-cocktails',
          categoryName: 'Kokteyller',
          name: 'Irish Mule',
          description: 'Irish whiskey, ginger beer, lime ve nane ile canlı bir pub klasiği.',
          price: 320,
          imageUrl: 'https://loremflickr.com/900/700/moscow-mule,cocktail?lock=108',
          tags: ['kokteyl', 'viski', 'ginger', 'popüler'],
        },
        {
          productId: 'demo-cocktail-black-velvet',
          categoryId: 'demo-cocktails',
          categoryName: 'Kokteyller',
          name: 'Black Velvet',
          description: 'Guinness ve köpüklü şarabın koyu, zarif ve kutlamalık birleşimi.',
          price: 340,
          imageUrl: 'https://loremflickr.com/900/700/dark-cocktail,bar?lock=109',
          tags: ['kokteyl', 'guinness', 'özel'],
        },
        {
          productId: 'demo-cocktail-whiskey-sour',
          categoryId: 'demo-cocktails',
          categoryName: 'Kokteyller',
          name: 'Irish Whiskey Sour',
          description: 'Irish whiskey, limon, şeker şurubu ve kadifemsi köpük.',
          price: 330,
          imageUrl: 'https://loremflickr.com/900/700/whiskey-sour,cocktail?lock=110',
          tags: ['kokteyl', 'viski', 'ekşi'],
        },
        {
          productId: 'demo-cocktail-gin-tonic',
          categoryId: 'demo-cocktails',
          categoryName: 'Kokteyller',
          name: 'Botanical Gin Tonic',
          description: 'Premium gin, tonic, ardıç, turunç ve taze aromatikler.',
          price: 310,
          imageUrl: 'https://loremflickr.com/900/700/gin-tonic,cocktail?lock=111',
          tags: ['kokteyl', 'gin', 'ferah'],
        },
        {
          productId: 'demo-cocktail-espresso',
          categoryId: 'demo-cocktails',
          categoryName: 'Kokteyller',
          name: 'Espresso Martini',
          description: 'Vodka, kahve likörü ve taze espresso ile geceye enerjik başlangıç.',
          price: 335,
          imageUrl: 'https://loremflickr.com/900/700/espresso-martini,cocktail?lock=112',
          tags: ['kokteyl', 'kahve', 'martini'],
        },
      ],
    },
    {
      categoryId: 'demo-whiskey',
      name: 'Irish Whiskey',
      displayOrder: 4,
      products: [
        {
          productId: 'demo-whiskey-jameson',
          categoryId: 'demo-whiskey',
          categoryName: 'Irish Whiskey',
          name: 'Jameson Original',
          description: 'Üç kez damıtılmış, yumuşak ve baharatlı klasik Irish whiskey.',
          price: 260,
          imageUrl: 'https://loremflickr.com/900/700/whiskey,glass,bar?lock=113',
          tags: ['viski', 'irish', 'klasik'],
        },
        {
          productId: 'demo-whiskey-bushmills',
          categoryId: 'demo-whiskey',
          categoryName: 'Irish Whiskey',
          name: 'Bushmills Black Bush',
          description: 'Sherry fıçı etkisi, kuru meyve ve zengin malt notaları.',
          price: 310,
          imageUrl: 'https://loremflickr.com/900/700/whiskey,tumbler?lock=114',
          tags: ['viski', 'irish', 'malt'],
        },
        {
          productId: 'demo-whiskey-redbreast',
          categoryId: 'demo-whiskey',
          categoryName: 'Irish Whiskey',
          name: 'Redbreast 12',
          description: 'Pot still karakteri, baharat, meşe ve uzun sıcak bitiş.',
          price: 430,
          imageUrl: 'https://loremflickr.com/900/700/whiskey,premium,glass?lock=115',
          tags: ['viski', 'premium', 'irish'],
        },
      ],
    },
    {
      categoryId: 'demo-pub-snacks',
      name: 'Pub Atıştırmalıkları',
      displayOrder: 5,
      products: [
        {
          productId: 'demo-snack-wings',
          categoryId: 'demo-pub-snacks',
          categoryName: 'Pub Atıştırmalıkları',
          name: 'Buffalo Chicken Wings',
          description: 'Acılı soslu kanat, blue cheese dip ve kereviz çubukları.',
          price: 295,
          imageUrl: 'https://loremflickr.com/900/700/chicken-wings,buffalo?lock=116',
          tags: ['atıştırmalık', 'tavuk', 'acılı', 'popüler'],
        },
        {
          productId: 'demo-snack-nachos',
          categoryId: 'demo-pub-snacks',
          categoryName: 'Pub Atıştırmalıkları',
          name: 'Loaded Pub Nachos',
          description: 'Cheddar, jalapeno, salsa, ekşi krema ve kıtır tortilla.',
          price: 285,
          imageUrl: 'https://loremflickr.com/900/700/nachos,bar-food?lock=117',
          tags: ['atıştırmalık', 'paylaşmalık', 'acılı'],
        },
        {
          productId: 'demo-snack-onion-rings',
          categoryId: 'demo-pub-snacks',
          categoryName: 'Pub Atıştırmalıkları',
          name: 'Beer Battered Onion Rings',
          description: 'Bira hamurlu soğan halkası ve sarımsaklı dip sos.',
          price: 190,
          imageUrl: 'https://loremflickr.com/900/700/onion-rings,bar-food?lock=118',
          tags: ['atıştırmalık', 'bira', 'vejetaryen'],
        },
        {
          productId: 'demo-snack-fries',
          categoryId: 'demo-pub-snacks',
          categoryName: 'Pub Atıştırmalıkları',
          name: 'Truffle Parmesan Fries',
          description: 'Trüf aroması, parmesan ve ev yapımı aioli ile çıtır patates.',
          price: 215,
          imageUrl: 'https://loremflickr.com/900/700/fries,pub-food?lock=119',
          tags: ['atıştırmalık', 'patates', 'paylaşmalık'],
        },
      ],
    },
    {
      categoryId: 'demo-pub-mains',
      name: 'Pub Klasikleri',
      displayOrder: 6,
      products: [
        {
          productId: 'demo-main-fish-chips',
          categoryId: 'demo-pub-mains',
          categoryName: 'Pub Klasikleri',
          name: 'Fish & Chips',
          description: 'Bira hamurlu mezgit, kalın kesim patates ve tartar sos.',
          price: 390,
          imageUrl: 'https://loremflickr.com/900/700/fish-and-chips,pub-food?lock=120',
          tags: ['yemek', 'balık', 'pub klasiği'],
        },
        {
          productId: 'demo-main-shepherds-pie',
          categoryId: 'demo-pub-mains',
          categoryName: 'Pub Klasikleri',
          name: "Shepherd's Pie",
          description: 'Kıymalı sebzeli iç, patates püresi ve fırınlanmış üst katman.',
          price: 375,
          imageUrl: 'https://loremflickr.com/900/700/shepherds-pie,irish-food?lock=121',
          tags: ['yemek', 'irish', 'doyurucu'],
        },
        {
          productId: 'demo-main-irish-burger',
          categoryId: 'demo-pub-mains',
          categoryName: 'Pub Klasikleri',
          name: 'Irish Pub Burger',
          description: 'Dana köfte, cheddar, karamelize soğan ve stout BBQ sos.',
          price: 410,
          imageUrl: 'https://loremflickr.com/900/700/burger,pub-food?lock=122',
          tags: ['burger', 'yemek', 'doyurucu'],
        },
        {
          productId: 'demo-main-bangers',
          categoryId: 'demo-pub-mains',
          categoryName: 'Pub Klasikleri',
          name: 'Bangers & Mash',
          description: 'Izgara sosis, patates püresi ve soğan gravy sos.',
          price: 360,
          imageUrl: 'https://loremflickr.com/900/700/sausage,mash,pub-food?lock=123',
          tags: ['yemek', 'irish', 'doyurucu'],
        },
      ],
    },
  ],
};

function buildDemoMainCategory(
  categoryId: string,
  name: string,
  displayOrder: number,
  subCategoryIds: string[],
) {
  const subCategories = DEMO_MENU.categories
    .filter((category) => subCategoryIds.includes(category.categoryId))
    .map((category) => ({
      ...category,
      parentCategoryId: categoryId,
    }));

  return {
    categoryId,
    name,
    displayOrder,
    products: [],
    subCategories,
  };
}

function getActiveDemoCategories() {
  return [
    buildDemoMainCategory('demo-main-drinks', 'Bar', 1, [
      'demo-draft-beer',
      'demo-bottle-beer',
      'demo-cocktails',
      'demo-whiskey',
    ]),
    buildDemoMainCategory('demo-main-food', 'Pub Mutfağı', 2, [
      'demo-pub-snacks',
      'demo-pub-mains',
    ]),
  ];
}

function flattenCategoryProducts(categories: MenuCategory[]): ProductListItem[] {
  return categories.flatMap((category) => [
    ...category.products,
    ...(category.subCategories ? flattenCategoryProducts(category.subCategories) : []),
  ]);
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
        setProducts(flattenCategoryProducts(demoCategories));
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getMenu(restaurantId);

        if (!isMounted) {
          return;
        }

        setMenu(data);
        setCategories(data.categories);
        setProducts(flattenCategoryProducts(data.categories));
      } catch {
        if (!isMounted) {
          return;
        }

        const demoCategories = getActiveDemoCategories();
        setError(null);
        setMenu(DEMO_MENU);
        setCategories(demoCategories);
        setProducts(flattenCategoryProducts(demoCategories));
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
