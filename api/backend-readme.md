# Backend Rehberi

Bu dokuman `api` klasorundeki backend yapisini ozetler.

## Backend'in Rolu

Backend tum is kurallarinin merkezidir:

- multi-restaurant veri modelini korur
- customer menu endpointlerini saglar
- siparis olusturma ve siparis durum yonetimi yapar
- admin CRUD islemlerini saglar
- JWT tabanli giris ve rol bazli yetkilendirme yapar
- audit ve order status loglarini tutar
- admin dashboard istatistiklerini hesaplar

## Teknoloji Yigini

- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- InMemory database fallback
- JWT Authentication
- Swagger

## Katmanlar

Akis genel olarak soyledir:

`HTTP Request -> Controller -> Service -> Repository -> DbContext -> Database`

Controller ince tutulur. Is kurallari service katmaninda, veri erisimi repository katmaninda, tablo ve iliski tanimlari `AppDbContext` tarafinda durur.

## Ana Entity'ler

- `Restaurant`: restoran kaydi
- `Category`: urun kategorileri
- `Product`: menu urunu
- `Tag` ve `ProductTag`: urunleri arama ve gruplama icin etiketler
- `Table`: masa ve QR baglami
- `Order` ve `OrderItem`: siparis kayitlari
- `User`: admin ve cashier girisi
- `AuditLog`: admin islemleri
- `OrderStatusLog`: siparis durum gecmisi
- `ProductVariant` ve `ProductAllergen`: urun detaylari

## Ana Controller'lar

- `MenuController`: menu, kategori, urun listesi, urun detayi
- `OrdersController`: customer siparis olusturma
- `AuthController`: login, register, me
- `AdminCategoriesController`, `AdminProductsController`, `AdminTablesController`: kategori, urun, masa CRUD
- `AdminLogsController`: audit ve siparis loglari
- `AdminStatsController`: dashboard ve istatistik endpointleri
- `CashierOrdersController`: siparis listeleme, detay ve durum guncelleme

## Lokal Calistirma

```bash
cd api
dotnet restore
dotnet run
```

PostgreSQL connection string verilmezse uygulama InMemory ile acilir.

## Okuma Sirasi

1. `Program.cs`
2. `Entities`
3. `AppDbContext`
4. `Controllers`
5. `Services`
6. `Repositories`
7. `AppDbSeeder`
8. `Migrations`
