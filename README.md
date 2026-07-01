# QR Menu

Multi-restaurant destekli QR menu, siparis, admin ve cashier yonetimi sunan full-stack demo projedir. Sistem; customer tarafinda QR ile menu acma, siparis olusturma, cashier tarafinda siparis durum yonetimi ve admin tarafinda urun, kategori, masa, log ve dashboard ekranlarini bir araya getirir.

## Proje Kapsami

- Customer: QR ile menuye giris, kategori bazli gezinme, urun detayi, sepete ekleme, siparis olusturma
- Admin: dashboard, kategori yonetimi, urun yonetimi, masa ve QR yonetimi, audit ve siparis loglari
- Cashier: aktif siparisleri gorme, durum guncelleme
- Backend: JWT auth, role bazli yetkilendirme, validation, global error handling ve operasyon servisleri

## Teknolojiler

- Backend: ASP.NET Core 8, Entity Framework Core, PostgreSQL
- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router
- Auth: JWT
- Infra: Docker Compose, Nginx

## Demo Verisi

Uygulama ilk acilista ornek veri ile baslar:

- 1 restoran: `Demo Cafe`
- kategori ve urunler
- masa ve QR baglantilari
- ornek siparis gecmisi
- audit ve siparis durum loglari

Demo kullanicilari:

- Admin: `admin@demo.com` / `Admin123!`
- Cashier: `cashier@demo.com` / `Cashier123!`

## Lokal Calistirma

```bash
cd api
dotnet restore
dotnet run
```

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

## Docker ile Calistirma

```bash
cp .env.example .env
docker compose up --build
```

Docker uzerinden servisler:

- Nginx: `http://localhost`
- API: `http://localhost/api`
- Customer: `http://localhost/`
- Admin: `http://localhost/admin`
- Cashier: `http://localhost/cashier`

## Kisa Kullanim

1. Musteri QR linkinden menuyu acar.
2. Urunleri sepete ekler ve siparis gonderir.
3. Cashier panel siparisi gorur ve durumunu gunceller.
4. Admin panel urun, kategori, masa ve dashboard ekranlarini yonetir.

## Diger Dokumanlar

- [frontend/frontend-readme.md](frontend/frontend-readme.md)
- [api/backend-readme.md](api/backend-readme.md)
- [database-readme.md](database-readme.md)
- [infra/infra-readme.md](infra/infra-readme.md)
- [project-overview-readme.md](project-overview-readme.md)
- [docs/future-local-model-door.md](docs/future-local-model-door.md)
