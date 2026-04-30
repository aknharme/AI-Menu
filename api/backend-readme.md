# AI Menu Backend

Bu dokuman, `api` klasorunde calisacak birinin projedeki backend yapisini tek basina anlayabilmesi icin hazirlandi. Amaç; hangi katman ne yapar, hangi endpoint nerede durur, veriler nasil akar ve backend tarafinda su anda neler var neler yok sorularina tek yerden cevap vermektir.

## Backend'in Rolü

Backend bu projede tum is kurallarinin merkezidir. Yapay zeka yalnizca tag uretir; urun secimi, filtreleme, siparis dogrulama, yetkilendirme ve loglama backend tarafinda yapilir.

Backend'in ana sorumluluklari:

- multi-restaurant veri modelini korumak
- customer menu endpointlerini saglamak
- siparis olusturma ve siparis durum yonetimi yapmak
- admin CRUD islemlerini saglamak
- JWT tabanli giris ve rol bazli yetkilendirme yapmak
- recommendation akisini AI tag uretimi ile birlestirmek
- audit, recommendation ve order status loglarini tutmak
- admin dashboard istatistiklerini hesaplamak

## Teknoloji Yigini

- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- InMemory database fallback
- JWT Authentication
- Swagger
- Ollama entegrasyonu

## Klasor Yapisi

```text
api/
|-- Constants/
|-- Controllers/
|-- Data/
|   |-- Migrations/
|-- DTOs/
|-- Entities/
|-- Middleware/
|-- Options/
|-- Repositories/
|   |-- Interfaces/
|-- Services/
|   |-- Interfaces/
|-- Swagger/
|-- Validation/
|-- AiMenu.Api.csproj
|-- AiMenu.Api.http
|-- appsettings.json
|-- Program.cs
`-- README.md
```

## Mimarinin Ozeti

Backend katmanli bir yapiyla kuruldu:

1. `Controllers`
2. `Services`
3. `Repositories`
4. `Data`
5. `Entities` ve `DTOs`

Akis genel olarak soyledir:

`HTTP Request -> Controller -> Service -> Repository -> DbContext -> Database`

Controller ince tutulur. Is kurallari service katmaninda, veri erisimi repository katmaninda, tablo ve iliski tanimlari `AppDbContext` tarafinda durur.

## Entity Katmani

Bu katman veritabanindaki ana tablolarin .NET karsiligidir.

### Cekirdek is tabloları

- `Restaurant`: tum verinin baglandigi restoran kaydi
- `Category`: restoranin urun kategorileri
- `Product`: menu urunu
- `Table`: masa ve QR baglami
- `Order`: siparisin ana kaydi
- `OrderItem`: siparis satirlari

### Auth tabloları

- `User`: admin ve cashier girisi icin kullanilir

### AI ve recommendation tabloları

- `Tag`: restorana ozel tag sozlugu
- `ProductTag`: urun ile tag arasindaki join tablosu
- `RecommendationLog`: prompt, tag ve onerilen urun kaydi

### Audit ve operasyon tabloları

- `AuditLog`: admin islemleri icin kritik degisiklik kaydi
- `OrderStatusLog`: siparisin durum gecmisi
- `ProductVariant`: urun varyantlari
- `ProductAllergen`: urun alerjen bilgisi

## DTO Katmani

DTO'lar, API'ye gelen ve API'den donen modellerdir. Entity'ler ile ayni sey degildir.

Bu ayrimin sebepleri:

- veritabanindaki her alan dis dunyaya acilmaz
- request ve response yapisi daha temiz olur
- frontend ile sozlesme daha stabil kalir

Onemli DTO gruplari:

- auth: `LoginRequestDto`, `RegisterRequestDto`, `AuthResponseDto`
- menu: `MenuResponseDto`, `CategoryDto`, `ProductListDto`, `ProductDetailDto`
- orders: `CreateOrderRequestDto`, `CreateOrderItemRequestDto`, `OrderResponseDto`
- admin: `SaveAdminCategoryRequestDto`, `SaveAdminProductRequestDto`, `SaveAdminTableRequestDto`
- recommendation: `RecommendationPromptRequestDto`, `RecommendationProductsRequestDto`, `AiTagResponseDto`, `RecommendationResponseDto`
- logs ve dashboard: `AuditLogDto`, `RecommendationLogDto`, `OrderStatusLogDto`, `DashboardSummaryDto`, `TopProductDto`, `RecentOrderDto`, `RecommendationStatDto`
- standart hata: `ApiErrorResponseDto`

## Repository Katmani

Repository katmani EF Core sorgularini toplar. Controller veya service icine SQL/LINQ dagitilmamis olur.

Ana repository'ler:

- `RestaurantRepository`: menu ve restoran okumalari
- `OrderRepository`: siparis oncesi kontroller ve siparis kaydi
- `AdminRepository`: kategori, urun, masa, dashboard ve admin veri sorgulari
- `AuthRepository`: kullanici sorgulari
- `RecommendationRepository`: tag bazli urun filtreleme ve fallback sorgulari
- `LogRepository`: audit, recommendation ve order log okumalari

## Service Katmani

Service katmani backend'in asil is kurallarini tasir.

### Ana servisler

- `MenuService`: customer tarafi menu ve urun detayi
- `OrderService`: siparis olusturma akisi
- `AdminService`: kategori, urun ve masa CRUD islemleri
- `AdminStatsService`: dashboard istatistikleri
- `CashierService`: siparis listeleme ve status update
- `AuthService`: login, register, me akisi
- `JwtTokenService`: JWT token uretimi
- `RecommendationService`: AI tag -> urun onerisi akisi
- `OllamaTagService`: Ollama'ya prompt gonderip JSON tag cikarimi
- `LogService`: audit ve operasyon loglarini yazma
- `TagNormalizer`: AI'den gelen tag'leri normalize etme

### Buradaki kritik kural

Yapay zeka urun secmez. AI sadece tag uretir. Tag'lere gore filtreleme ve fallback mantigi backend tarafinda `RecommendationService` ile yapilir.

## Controller Katmani

### Public controller'lar

- `MenuController`
  - menu, kategori, urun listesi, urun detayi
- `OrdersController`
  - customer siparis olusturma
- `RecommendationController`
  - AI tag extraction
  - tag'lere gore urun onerisi
  - prompt'tan dogrudan oneriler

### Auth controller

- `AuthController`
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET /api/auth/me`

### Admin controller'lari

- `AdminController`
  - kategori CRUD
  - urun CRUD
  - masa CRUD
- `AdminLogsController`
  - audit loglari
  - recommendation loglari
  - order status loglari
- `AdminStatsController`
  - dashboard ve istatistik endpointleri

### Cashier controller

- `CashierOrdersController`
  - siparis listeleme
  - siparis detay
  - siparis durumu guncelleme

## Auth ve Yetkilendirme

Sistemde 3 rol mantigi var:

- `Customer`
- `Admin`
- `Cashier`

Customer login olmadan menuye girebilir. Admin ve cashier JWT ile giris yapar.

Token icindeki ana claim'ler:

- `userId`
- `role`
- `restaurantId`

Kurallar:

- admin endpointleri sadece `Admin`
- cashier endpointleri `Cashier` ve `Admin`
- customer menu endpointleri public

JWT ve middleware ayarlari `Program.cs` icinde kurulur.

## Validation ve Error Handling

Backend tarafinda hem model validation hem de global error handling vardir.

Kullanilan yapi:

- DataAnnotations
- custom validation attribute: `NotEmptyGuidAttribute`
- `GlobalExceptionHandlingMiddleware`

Standart hata modeli:

```json
{
  "message": "Istek dogrulama hatasi.",
  "code": "validation_error",
  "details": ["Restaurant id zorunludur."]
}
```

Kapsanan temel durumlar:

- `400` validation
- `401` unauthorized
- `403` forbidden
- `404` not found
- `500` internal server error

## Veritabani ve Seed

`AppDbContext` tum tablo, iliski, index ve alan ayarlarini tanimlar.

`AppDbSeeder` demo icin ornek veri yukler:

- 1 restoran
- 4 kategori
- 10 urun
- 3 masa
- admin ve cashier kullanicisi
- ornek siparisler
- order status loglari
- recommendation loglari
- audit loglari

Connection string yoksa uygulama InMemory ile acilir. Connection string varsa PostgreSQL kullanilir ve migration'lar uygulanir.

## Recommendation ve AI Akisi

Buradaki akis cok onemlidir:

1. Customer prompt girer
2. Backend prompt'u `OllamaTagService` ile Ollama'ya yollar
3. Ollama sadece JSON tag listesi dondurur
4. Backend tag'leri normalize eder
5. `RecommendationRepository` ilgili restoranin aktif urunleri icinden eslesenleri bulur
6. Eslesen urun yoksa fallback olarak populer urunler doner
7. `RecommendationLog` tablosuna kayit atilir

Kritik nokta:

- AI urun secmez
- backend urun secer
- filtreler `restaurantId` ve `isActive` ile sinirlanir

## Dashboard ve Log Yapisi

Admin paneli icin backend su verileri uretir:

- toplam siparis sayisi
- bekleyen siparis sayisi
- son siparisler
- en cok siparis edilen urunler
- gunun populer urunleri
- en cok onerilen urunler

Log tipleri:

- `AuditLogs`
- `RecommendationLogs`
- `OrderStatusLogs`

Bu loglar admin tarafinda okunabilir endpointler ile sunulur.

## Su Anda Backend'de Neler Var

- menu ve urun detayi
- siparis olusturma
- cashier siparis yonetimi
- admin kategori urun masa CRUD
- auth ve JWT
- dashboard
- log ekranlarini besleyen endpointler
- Ollama entegrasyonu
- tag bazli recommendation
- validation ve standart hata modeli
- Docker'a uygun ayarlar

## Su Anda Backend'de Neler Yok

- refresh token sistemi
- rate limiting
- background job scheduler
- distributed cache
- message queue
- gercek odeme entegrasyonu
- production seviyesinde merkezi monitoring

## Onemli Dosyalar

- [Program.cs](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/api/Program.cs)
- [AppDbContext.cs](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/api/Data/AppDbContext.cs)
- [AppDbSeeder.cs](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/api/Data/AppDbSeeder.cs)
- [RecommendationController.cs](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/api/Controllers/RecommendationController.cs)
- [RecommendationService.cs](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/api/Services/RecommendationService.cs)
- [OllamaTagService.cs](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/api/Services/OllamaTagService.cs)
- [AdminController.cs](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/api/Controllers/AdminController.cs)
- [AuthController.cs](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/api/Controllers/AuthController.cs)

## Backend'i Lokal Calistirma

```bash
cd api
dotnet restore
dotnet run
```

PostgreSQL ile calismak istersen `ConnectionStrings__DefaultConnection` vermen yeterlidir. Vermezsen uygulama InMemory ile acilir.

## Backend'i Anlamak Icin Onerilen Okuma Sirasi

1. `Program.cs`
2. `Entities`
3. `AppDbContext`
4. `Controllers`
5. `Services`
6. `Repositories`
7. `AppDbSeeder`
8. `Migrations`

Bu sirayla okundugunda proje mantigi daha kolay oturur.
