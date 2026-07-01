# Veritabani Rehberi

Bu proje PostgreSQL kullanir. Connection string verilmezse backend gelistirme icin InMemory database ile acilabilir.

## Ana Tablolar

- `Restaurants`
- `Categories`
- `Products`
- `Tags`
- `ProductTags`
- `Tables`
- `Orders`
- `OrderItems`
- `Users`
- `AuditLogs`
- `OrderStatusLogs`
- `ProductVariants`
- `ProductAllergens`

## Veri Iliskileri

- Her ana kayit `RestaurantId` ile restorana baglanir.
- Kategoriler ana/alt kategori seklinde tutulabilir.
- Urunler kategoriye baglidir.
- Etiketler urunleri arama ve gruplama icin kullanilir.
- Siparisler masa ve restoran baglaminda olusur.
- Durum gecmisi `OrderStatusLogs` tablosunda tutulur.

## Demo Seed

`AppDbSeeder` demo restoran, kategori, urun, masa, kullanici ve ornek siparis verilerini yukler.

## Migration

Migration dosyalari `api/Data/Migrations` altindadir. Uygulama PostgreSQL ile calisirken migration'lari otomatik uygulayacak sekilde ayarlanmistir.
