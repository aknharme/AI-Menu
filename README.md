# AI Menu

AI Menu, multi-restaurant destekli QR menu, siparis, admin ve cashier yonetimi sunan full-stack bir demo projedir. Sistem; customer tarafinda QR ile menu acma, siparis olusturma, cashier tarafinda siparis durum yonetimi ve admin tarafinda urun, kategori, masa, log, dashboard ve AI destekli onerileri bir araya getirir.

## Proje Kapsami

- Customer: QR ile menuye giris, kategori bazli gezinme, urun detayi, sepete ekleme, siparis olusturma, AI destekli urun onerisi
- Admin: dashboard, kategori yonetimi, urun yonetimi, masa ve QR yonetimi, audit ve recommendation loglari
- Cashier: aktif siparisleri gorme, durum guncelleme
- Backend: JWT auth, role bazli yetkilendirme, validation, global error handling, recommendation ve log servisleri

## Teknolojiler

- Backend: ASP.NET Core 8, Entity Framework Core, PostgreSQL
- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router
- Auth: JWT
- AI: Ollama
- Infra: Docker Compose, Nginx

## Demo Verisi

Uygulama ilk acilista ornek veri ile baslar:

- 1 restoran: `Demo Cafe`
- 4 kategori
- 10 urun
- 3 masa ve QR baglantisi
- ornek siparis gecmisi
- recommendation ve audit log kayitlari

Demo kullanicilari:

- Admin: `admin@demo.com` / `Admin123!`
- Cashier: `cashier@demo.com` / `Cashier123!`

Ornek restoran kimligi:

- `11111111-1111-1111-1111-111111111111`

## Lokal Calistirma

### Backend

```bash
cd api
dotnet restore
dotnet run
```

### Customer Web

```bash
cd frontend/customer-web
npm install
npm run dev
```

### Admin Web

```bash
cd frontend/admin-web
npm install
npm run dev
```

### Cashier Web

```bash
cd frontend/cashier-web
npm install
npm run dev
```

Varsayilan gelistirme akisi:

- API: `http://localhost:5255` veya `https://localhost:7143`
- Customer: `http://localhost:5173`
- Admin: `http://localhost:5174`
- Cashier: `http://localhost:5175`

Not: Lokal portlar Vite ve launch ayarlarina gore degisebilir.

## Docker ile Calistirma

`.env.example` dosyasini kopyalayip proje kokunden tum sistemi tek komutla acabilirsiniz:

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
- Ollama: `http://localhost:11434`

## Ortam Degiskenleri

Ornek ortam degiskenleri [.env.example](.env.example) icindedir. Temel alanlar:

- PostgreSQL baglantisi
- JWT secret ve token ayarlari
- Ollama model ve port bilgisi
- frontend `/api` base path ayarlari

## Kisa Kullanim Rehberi

### Musteri

1. QR kod ile `menu?restaurantId=...&tableId=...` baglantisini acar.
2. Kategoriler arasinda gezer ve urun detayina bakar.
3. Urunleri sepete ekler.
4. Siparisi gonderir.
5. Isterse serbest metin yazarak AI destekli urun onerisi alir.

### Admin

1. Giris yapar.
2. Dashboard'da siparis, populer urun ve recommendation verilerini gorur.
3. Kategori, urun ve masa yonetimini yapar.
4. Audit, siparis ve recommendation loglarini inceler.

### Cashier

1. Giris yapar.
2. Restorana ait siparisleri listeler.
3. Siparis durumlarini `Pending`, `Preparing`, `Ready`, `Paid` gibi adimlarda gunceller.

## Demo Akisi

Sunum icin onerilen temel akisi:

1. Admin panelde masalari ve QR baglantisini goster
2. Customer tarafinda QR ile menuye gir
3. Birkac urun secip siparis olustur
4. Cashier panelde siparisin dustugunu ve durum guncellemesini goster
5. Admin dashboard ve log ekranlariyla hareket kaydini goster
6. AI onerisi ile tag bazli urun filtreleme akisini goster

## Temel Ozellikler

- Multi-restaurant veri modeli
- JWT tabanli auth ve role bazli yetkilendirme
- Aktif urun filtreleme ve kategori bazli menu
- Ollama ile JSON tabanli tag extraction
- Backend tarafinda tag bazli recommendation
- Audit, recommendation ve order status loglari
- Dashboard istatistikleri
- Validation ve standart hata response yapisi
- Docker Compose ve Nginx reverse proxy kurulumu

## Diger Dokumanlar

- [frontend/frontend-readme.md](frontend/frontend-readme.md)
- [api/backend-readme.md](api/backend-readme.md)
- [database-readme.md](database-readme.md)
- [ai-readme.md](ai-readme.md)
- [infra/infra-readme.md](infra/infra-readme.md)
- [project-overview-readme.md](project-overview-readme.md)
