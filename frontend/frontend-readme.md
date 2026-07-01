# Frontend Rehberi

Projede uc ayri React uygulamasi vardir:

- `customer-web`
- `admin-web`
- `cashier-web`

## Customer Web

Customer uygulamasi login gerektirmez. QR ile acilan menu deneyimini tasir.

- menu listeleme
- kategori tablari
- urun kartlari
- urun detay drawer
- varyant secimi
- sepete ekleme
- siparis olusturma

Onemli dosyalar:

- `src/pages/MenuPage.tsx`
- `src/hooks/useMenu.ts`
- `src/services/menuService.ts`
- `src/services/orderService.ts`
- `src/contexts/CartContext.tsx`

## Admin Web

Admin uygulamasi restoran yonetimi icindir. JWT ile korunur ve sadece `Admin` rolune aciktir.

- login
- dashboard
- kategori yonetimi
- urun yonetimi
- masa yonetimi
- QR gosterimi
- siparis ve audit log ekranlari

## Cashier Web

Cashier uygulamasi siparis operasyonu icindir. `Cashier` ve `Admin` rolleri bu panele girebilir.

- login
- siparis listesi
- siparis detay
- siparis durumu guncelleme

## Endpoint Aileleri

- `/api/menu/*`
- `/api/orders`
- `/api/auth/*`
- `/api/admin/*`
- `/api/admin/logs/*`
- `/api/admin/stats/*`
- `/api/cashier/orders/*`

## Lokal Calistirma

```bash
cd frontend/customer-web
npm install
npm run dev
```

```bash
cd frontend/admin-web
npm install
npm run dev
```

```bash
cd frontend/cashier-web
npm install
npm run dev
```
