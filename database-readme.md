# AI Menu Veritabani Rehberi

Bu dokuman, projedeki veritabani yapisini anlamak isteyen biri icin hazirlandi. Amaç; hangi tablolar var, bunlar birbirine nasil bagli, migration akisi nasil calisiyor, multi-restaurant mantigi veritabaninda nasil korunuyor gibi sorularin cevabini tek yerde vermektir.

## Veritabani Yaklasimi

Projede ana veritabani hedefi PostgreSQL'dir. ORM olarak Entity Framework Core kullanilir.

Gelistirme kolayligi icin sistem su sekilde calisir:

- connection string varsa PostgreSQL
- connection string yoksa InMemory database

Bu sayede backend hizli ayağa kalkabilir, ama gercek tablo iliskileri ve migration mantigi PostgreSQL uzerine kuruludur.

## Veritabani Katmaninin Bulundugu Yerler

- `api/Data/AppDbContext.cs`
- `api/Data/Migrations/`
- `api/Data/AppDbSeeder.cs`
- `api/Entities/`

## Multi-Restaurant Mantigi

Bu projenin en kritik veri modeli kurali sudur:

Neredeyse tum is verileri `RestaurantId` ile baglidir.

Bu sayede:

- her restoran kendi kategori ve urunlerini gorur
- siparisler restoran bazli ayrilir
- tag ve recommendation kayitlari restoran bazli tutulur
- admin ve cashier kendi restoran verisinde calisir

## Ana Tablolar

### 1. Restaurants

Sistemdeki ana restoran kaydidir. Diger tum tablolara ust baglam verir.

Temel alanlar:

- `RestaurantId`
- `Name`
- `Slug`
- `IsActive`

## 2. Categories

Restorana bagli kategori tablosudur.

Temel alanlar:

- `CategoryId`
- `RestaurantId`
- `Name`
- `DisplayOrder`
- `IsActive`

Bir restoranin birden fazla kategorisi olabilir.

## 3. Products

Menudeki satilabilir urunleri tutar.

Temel alanlar:

- `ProductId`
- `RestaurantId`
- `CategoryId`
- `Name`
- `Description`
- `Ingredients`
- `Price`
- `IsActive`

Kurallar:

- her urun bir restorana baglidir
- her urun bir kategoriye baglidir
- aktif olmayan urun customer menu ve recommendation tarafinda kullanilmaz

## 4. ProductVariants

Urunun fiyat farki olan secenekleridir.

Ornek:

- ekstra cheddar
- cift kofte
- ekstra shot

Temel alanlar:

- `ProductVariantId`
- `RestaurantId`
- `ProductId`
- `Name`
- `PriceDelta`
- `IsActive`

## 5. ProductAllergens

Urun detayinda gosterilecek alerjen bilgisidir.

Temel alanlar:

- `ProductAllergenId`
- `RestaurantId`
- `ProductId`
- `Name`

## 6. Tags

Recommendation sistemi icin restoran bazli tag sozlugudur.

Temel alanlar:

- `TagId`
- `RestaurantId`
- `Name`
- `NormalizedName`

Buradaki mantik:

- AI serbest metinden tag cikarir
- backend bu tag'leri normalize eder
- sonra `Tags` tablosu ve `ProductTags` iliskisi uzerinden urunleri bulur

## 7. ProductTags

Urun ile tag arasindaki coktan coga iliski tablosudur.

Temel alanlar:

- `ProductTagId`
- `RestaurantId`
- `ProductId`
- `TagId`

Bu tablo recommendation'in merkezindedir.

## 8. Tables

Masa ve QR baglamini tutar.

Temel alanlar:

- `TableId`
- `RestaurantId`
- `Name`
- `QrCodeValue`
- `IsActive`

`QrCodeValue` genelde customer uygulamasina giden menu URL bilgisidir.

## 9. Orders

Siparisin ana kaydidir.

Temel alanlar:

- `OrderId`
- `RestaurantId`
- `TableId`
- `CustomerName`
- `Note`
- `Status`
- `TotalAmount`
- `CreatedAtUtc`

## 10. OrderItems

Siparis satirlarini tutar.

Temel alanlar:

- `OrderItemId`
- `RestaurantId`
- `OrderId`
- `ProductId`
- `ProductVariantId`
- `Note`
- `Quantity`
- `UnitPrice`
- `LineTotal`

## 11. Users

Admin ve cashier girisi icin kullanilir.

Temel alanlar:

- `UserId`
- `RestaurantId`
- `FullName`
- `Email`
- `PasswordHash`
- `Role`
- `IsActive`
- `CreatedAtUtc`

## 12. AuditLogs

Admin veya yetkili kullanicilarin yaptigi kritik veri degisikliklerini kaydeder.

Temel alanlar:

- `AuditLogId`
- `RestaurantId`
- `UserId`
- `ActionType`
- `EntityType`
- `EntityId`
- `Description`
- `CreatedAtUtc`

## 13. RecommendationLogs

AI recommendation akisinin kaydidir.

Temel alanlar:

- `RecommendationLogId`
- `RestaurantId`
- `Prompt`
- `ExtractedTags`
- `RecommendedProducts`
- `CreatedAtUtc`

Burada `ExtractedTags` ve `RecommendedProducts` JSON string olarak tutulur.

## 14. OrderStatusLogs

Siparis durum degisimlerinin kronolojik gecmisini tutar.

Temel alanlar:

- `OrderStatusLogId`
- `RestaurantId`
- `OrderId`
- `OldStatus`
- `NewStatus`
- `ChangedByUserId`
- `ChangedAtUtc`

## Iliski Mantigi

Basit ozet:

- `Restaurant -> Categories`
- `Restaurant -> Products`
- `Restaurant -> Tables`
- `Restaurant -> Orders`
- `Restaurant -> Users`
- `Restaurant -> Tags`
- `Product -> ProductVariants`
- `Product -> ProductAllergens`
- `Product -> ProductTags`
- `Order -> OrderItems`
- `Order -> OrderStatusLogs`
- `Tag -> ProductTags`

## Index ve Kisit Mantigi

`AppDbContext` icinde performans ve veri butunlugu icin onemli indexler vardir.

Ornekler:

- `Restaurant.Slug` unique
- `User.Email` unique
- `Tag (RestaurantId, NormalizedName)` unique
- `ProductTag (ProductId, TagId)` unique
- `Product (RestaurantId, IsActive)` index
- log tablolarinda tarih bazli indexler

Bu indexler ozellikle su sorgular icin onemlidir:

- aktif urunleri listeleme
- restorana ait veriyi cekme
- recommendation eslesmesi
- dashboard ve log ekranlari

## Silme Davranislari

Tum iliskiler `cascade` degildir. Bazi noktalarda veri kaybi olmamasi icin `restrict` veya `set null` kullanilir.

Ornekler:

- masa silinince siparis gecmisi kontrolsuz silinmez
- urun silinince order item gecmisi zarar gormez
- log kaydindaki kullanici silinirse `UserId` nullable kalabilir

## Migration Akisi

Migration dosyalari burada durur:

- `api/Data/Migrations/`

Su anda projede temel olarak su asamalar migration ile gelmistir:

- ilk menu ve siparis semasi
- order item varyant ve note genislemesi
- recommendation tags yapisi
- auth ve user tablolari
- audit ve recommendation loglari

Migration komutlari:

```bash
cd api
dotnet ef migrations add MigrationAdi
dotnet ef database update
```

## Seeder Mantigi

`AppDbSeeder` demo icin baslangic verisi olusturur.

Su an ornek olarak:

- 1 restoran
- 4 kategori
- 10 urun
- 3 masa
- admin ve cashier kullanicisi
- ornek siparisler
- loglar
- tag iliskileri

Bu seed iki sey icin cok faydalidir:

- proje acilir acilmaz bos ekran cikmaz
- dashboard, cashier, admin ve recommendation ekranlari canli veriyle test edilir

## Recommendation Veritabaninda Nasil Calisir

1. AI prompt'tan tag uretir
2. Tag'ler normalize edilir
3. `Tags` ve `ProductTags` uzerinden urun eslesmesi yapilir
4. sadece ilgili restoranin aktif urunleri dikkate alinir
5. sonuc `RecommendationLogs` tablosuna yazilir

Yani veritabaninda AI'nin saklanan parcasi urun secimi degil:

- prompt
- cikan tag listesi
- donen urun listesi

## Dashboard Veritabaninda Nasil Beslenir

Dashboard sorgulari su tablolardan veri toplar:

- `Orders`
- `OrderItems`
- `Products`
- `RecommendationLogs`
- `Tables`

Buradan uretilen veriler:

- toplam siparis
- bekleyen siparis
- son siparisler
- populer urunler
- cok onerilen urunler

## Su Anda Veritabaninda Neler Var

- menu, siparis, masa, auth, tag, log ve dashboard icin yeterli sema
- EF Core migration yapisi
- PostgreSQL uyumlulugu
- InMemory fallback
- demo seed

## Su Anda Veritabaninda Neler Yok

- soft delete yapisi
- row version / optimistic concurrency
- tenant bazli ayri schema
- materialized view
- stored procedure agir mimarisi
- event sourcing

## Bu Dokumani Kim Kullanmalı

- backend developer
- veritabani semasini anlayacak kisi
- migration yonetecek kisi
- recommendation sorgularini optimize edecek kisi
- dashboard verisinin nereden geldigini anlamak isteyen kisi
