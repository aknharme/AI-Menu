# Proje Ozeti

Bu proje QR menu, siparis, admin ve cashier akislarini tek sistemde toplar.

## Ana Akis

1. Admin kategori, urun ve masa ayarlarini yapar.
2. Musteri QR linkinden menuyu acar.
3. Musteri urunleri sepete ekler ve siparis verir.
4. Cashier panel siparisi gorur.
5. Cashier siparis durumunu gunceller.
6. Admin dashboard ve log ekranlarindan hareketleri takip eder.

## Backend

Backend ASP.NET Core Web API ile yazilmistir. Controller, service, repository ve EF Core DbContext katmanlari bulunur.

## Frontend

Frontend tarafinda uc Vite uygulamasi vardir:

- customer-web
- admin-web
- cashier-web

## Infra

Docker Compose PostgreSQL, API, frontend container'lari ve Nginx reverse proxy'yi kaldirir.

## Gelecek Yerel Model

Model entegrasyonu su anda yoktur. Ileride yeniden baslamak icin yalnizca [docs/future-local-model-door.md](docs/future-local-model-door.md) dosyasinda pasif bir not birakilmistir.
