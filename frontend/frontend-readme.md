# AI Menu Frontend

Bu dokuman, projedeki frontend tarafini anlamak isteyen biri icin hazirlandi. Amaç; customer, admin ve cashier uygulamalarinin ne yaptigini, nasil ayrildigini, hangi servislerle konustugunu ve su anda frontend tarafinda hangi ekranlarin oldugunu tek yerde anlatmaktir.

## Frontend'in Genel Yapisi

Bu projede tek bir frontend yok. Uc ayri React uygulamasi var:

- `customer-web`
- `admin-web`
- `cashier-web`

Bu ayrim bilincli yapildi. Cunku her rolun ihtiyaci, route yapisi ve yetki seviyesi farkli.

## Kullanilan Teknolojiler

- React
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS

## Klasor Yapisi

```text
frontend/
|-- admin-web/
|-- cashier-web/
|-- customer-web/
|-- package.json
`-- README.md
```

Her uygulama kendi icinde ayri bir Vite projesidir. Bu sayede:

- deploy ayri yapilabilir
- route yapilari karismaz
- auth kurallari ayrilabilir
- her panel kendi sorumluluguna odaklanir

## 1. Customer Web

Customer uygulamasi login gerektirmez. QR ile acilan menu deneyimini tasir.

### Customer tarafinda neler var

- menu listeleme
- kategori tablari
- urun kartlari
- urun detay drawer
- varyant secimi
- sepete ekleme
- siparis olusturma
- AI destekli oneri alani

### Onemli dosyalar

- `src/router/index.tsx`
- `src/layouts/CustomerLayout.tsx`
- `src/pages/MenuPage.tsx`
- `src/hooks/useMenu.ts`
- `src/hooks/useQueryParams.ts`
- `src/services/menuService.ts`
- `src/services/orderService.ts`
- `src/contexts/CartContext.tsx`

### Route mantigi

Customer router su sekilleri destekler:

- `/`
- `/menu?restaurantId=...&tableId=...`
- `/menu/:restaurantId`
- `/menu/:restaurantId/table/:tableId`

Bu sayede QR linki query string ile de path param ile de calisabilir.

### Customer veri akisi

1. Sayfa `restaurantId` ve gerekiyorsa `tableId` bilgisini alir
2. `useMenu` ile backend'den menu verisi cekilir
3. Kullanici urun detayina bakar
4. Sepete urun ekler
5. `POST /api/orders` ile siparis gonderilir
6. AI prompt girerse `POST /api/recommendation/prompt` cagrilir

### Customer tarafindaki dikkat noktaları

- bos prompt engellenir
- prompt icin karakter limiti vardir
- loading, error ve empty state bulunur
- aktif olmayan urunler menuye dusmez

## 2. Admin Web

Admin uygulamasi restoran yonetimi icindir. JWT ile korunur ve sadece `Admin` rolune aciktir.

### Admin tarafinda neler var

- login
- dashboard
- kategori yonetimi
- urun yonetimi
- masa yonetimi
- QR gosterimi
- log ekranlarini besleyen akislara uygun servisler

### Onemli dosyalar

- `src/router/index.tsx`
- `src/layouts/AdminLayout.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/CategoriesPage.tsx`
- `src/pages/ProductsPage.tsx`
- `src/pages/TablesPage.tsx`
- `src/services/adminService.ts`
- `src/services/authService.ts`
- `src/services/authStorage.ts`
- `src/services/api.ts`
- `src/hooks/useRestaurantContext.ts`

### Admin route mantigi

- `/login`
- `/`
- `/categories`
- `/products`
- `/tables`

Nginx altinda bu uygulama `/admin/` base path'i ile de servis edilebilir. Router `basename` ayari buna gore kuruludur.

### Admin veri akisi

1. Kullanici login olur
2. Token local storage'a yazilir
3. Axios interceptor her istekte `Authorization: Bearer ...` ekler
4. Dashboard ve CRUD sayfalari ilgili endpointlerden veri ceker
5. Form submitlerinde validation ve hata mesaji gosterilir

### Admin ekranlari neyi yonetir

- kategoriler
- urunler
- urun aktif pasif durumu
- masalar
- QR linkleri
- dashboard istatistikleri

## 3. Cashier Web

Cashier uygulamasi siparis operasyonu icindir. `Cashier` ve `Admin` rolleri bu panele girebilir.

### Cashier tarafinda neler var

- login
- siparis listesi
- siparis detay
- siparis durumu guncelleme

### Onemli dosyalar

- `src/router/index.tsx`
- `src/layouts/CashierLayout.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/OrdersPage.tsx`
- `src/services/orderService.ts`
- `src/services/authService.ts`
- `src/services/authStorage.ts`
- `src/services/api.ts`
- `src/hooks/useCashierOrders.ts`
- `src/hooks/useRestaurantId.ts`

### Cashier akis mantigi

1. Cashier login olur
2. Token saklanir
3. Restorana ait siparisler cekilir
4. Siparis secilir
5. Durum `Pending -> Preparing -> Ready -> Paid` gibi adimlarla guncellenir

## Ortak Frontend Deseni

Uc uygulamada ortak mantiklar vardir:

- `services/api.ts`: axios instance ve interceptor ayarlari
- `authStorage.ts`: token saklama
- route protection
- loading state
- error state
- empty state

Bu ortak desen sayesinde her panel farkli olsa da kullanici deneyimi tutarli kalir.

## Frontend ve Backend Arasindaki Sozlesme

Frontend dogrudan entity ile degil, backend DTO'lari ile konusur.

Onemli endpoint aileleri:

- `/api/menu/*`
- `/api/orders`
- `/api/auth/*`
- `/api/admin/*`
- `/api/admin/logs/*`
- `/api/admin/stats/*`
- `/api/cashier/orders/*`
- `/api/recommendation`
- `/api/recommendation/products`
- `/api/recommendation/prompt`

## Frontend Tarafinda AI Nerede Gorunur

AI dogrudan chatbot olarak kullanilmiyor. Customer ekranda sadece serbest metin alanina yazilir.

Frontend'in AI tarafindaki rolu:

1. kullanicidan prompt almak
2. prompt'u backend'e gondermek
3. backend'den donen onerileri gostermek
4. hata varsa anlamli mesaj gostermek

AI karar vermez. Frontend de karar vermez. Son urun secimi backend sonucuyla ekranda gosterilir.

## Frontend'de Neler Var

- customer, admin, cashier olarak ayri paneller
- auth guard
- dashboard
- kategori urun masa ekranlari
- siparis operasyoni
- recommendation UI
- validation ve hata gosterimi
- Nginx alt path destegi

## Frontend'de Neler Yok

- SSR veya Next.js yapisi
- global state icin Redux veya Zustand
- component library
- offline destek
- push notification
- E2E test suit'i

## Lokal Calistirma

### Customer

```bash
cd frontend/customer-web
npm install
npm run dev
```

### Admin

```bash
cd frontend/admin-web
npm install
npm run dev
```

### Cashier

```bash
cd frontend/cashier-web
npm install
npm run dev
```

## Frontend'i Anlamak Icin Onerilen Okuma Sirasi

### Customer icin

1. `customer-web/src/router/index.tsx`
2. `customer-web/src/pages/MenuPage.tsx`
3. `customer-web/src/hooks/useMenu.ts`
4. `customer-web/src/services/menuService.ts`
5. `customer-web/src/services/orderService.ts`

### Admin icin

1. `admin-web/src/router/index.tsx`
2. `admin-web/src/pages/LoginPage.tsx`
3. `admin-web/src/pages/DashboardPage.tsx`
4. `admin-web/src/pages/ProductsPage.tsx`
5. `admin-web/src/services/adminService.ts`

### Cashier icin

1. `cashier-web/src/router/index.tsx`
2. `cashier-web/src/pages/OrdersPage.tsx`
3. `cashier-web/src/hooks/useCashierOrders.ts`
4. `cashier-web/src/services/orderService.ts`

## Bu Dokumani Kim Kullanmalı

- frontend developer
- UI duzeltmesi yapacak kisi
- yeni route ekleyecek kisi
- auth guard ve panel akisini anlamak isteyen kisi
- customer/admin/cashier ayrimini anlamak isteyen kisi
