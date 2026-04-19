# AI Menu Backend

Bu klasor, AI destekli QR menu ve siparis sisteminin ASP.NET Core Web API backend tarafidir.
Buradaki amac, projeye yeni katilan birinin backend yapisini hizlica anlamasi ve hangi dosyanin ne is yaptigini tek bakista gorebilmesidir.

## Backend'in gorevi

Bu servis su an MVP seviyesinde asagidaki cekirdek sorumluluklari yerine getirir:

- Restoran bazli menu verisini sunmak
- Musteriden gelen siparis istegini almak
- Siparisi veritabanina yazmak
- Tum verileri `restaurantId` mantigi ile izole etmek
- Swagger ile test edilebilir bir API sunmak

Yapay zeka burada henuz entegre edilmis degil. Ileride AI tarafinin gorevi urun secmek degil, kullanici isteginden `tag` uretmek olacak. O tag'ler backend tarafinda urun filtreleme icin kullanilacak.

## Klasor yapisi

```text
api/
|-- Controllers/
|-- Data/
|-- DTOs/
|-- Entities/
|-- Repositories/
|   |-- Interfaces/
|-- Services/
|   |-- Interfaces/
|-- Properties/
|-- AiMenu.Api.csproj
|-- AiMenu.Api.http
|-- appsettings.json
|-- appsettings.Development.json
|-- Program.cs
|-- README.md
```

## Katmanlar ne ise yarar

### `Entities`

Domain modelleri burada tutulur. Bunlar veritabanindaki tablolari temsil eder.

- `Restaurant`: Sistemdeki restoran/kafe kaydi. Tum diger ana veriler buraya baglidir.
- `Category`: Restoran icindeki urun kategorileri. Ornek: Icecekler, Burgerler.
- `Product`: Menudeki satilabilir urun. Fiyat, aciklama, aktiflik ve `Tags` alanini tasir.
- `Table`: Restorana ait masa bilgisi ve QR ile eslenecek deger.
- `Order`: Musterinin verdigi siparisin ana kaydi.
- `OrderItem`: Bir siparisin icindeki satirlar. Hangi urunden kac adet siparis edildigini tutar.

Bu katmanda dikkat edilmesi gereken ana kural:

- Her is modeli `RestaurantId` ile iliskilidir.
- Navigation property'ler EF Core iliskilerini dogru kurmak icin kullanilir.
- Multi-restaurant mimarinin temeli bu katmandadir.

### `DTOs`

API'ye gelen ve API'den donen veri modelleri burada bulunur. Entity ile ayni sey degildir.

Bu ayrim neden var:

- Dis dunyaya veritabanindaki tum alanlari acmayiz
- Request ve response modelleri daha sade olur
- API degisirse veritabanini birebir etkilemek zorunda kalmayiz

Dosyalar:

- `CreateOrderRequestDto`: Yeni siparis acmak icin gelen ana request modeli
- `CreateOrderItemRequestDto`: Siparis satiri request modeli
- `MenuResponseDto`: Menu endpoint'inin dondugu ana cevap
- `MenuCategoryDto`: Bir kategoriyi ve icindeki urunleri tasir
- `MenuProductDto`: Menu icinde gosterilecek urun verisi
- `OrderResponseDto`: Siparis olustuktan sonra donulen ana cevap
- `OrderItemResponseDto`: Siparis satiri response modeli

### `Repositories`

Veritabanina dogrudan erisen katmandir. EF Core sorgulari burada tutulur.

Bu katmanin amaci:

- Controller icine sorgu yazmamak
- Service katmanini veri erisimi detayindan ayirmak
- Test ve bakim kolayligi saglamak

Dosyalar:

- `Interfaces/IRestaurantRepository.cs`: Restoran ve menu verisi okumaya yonelik contract
- `Interfaces/IOrderRepository.cs`: Siparis ve urun/masa sorgulari icin contract
- `RestaurantRepository.cs`: Menu icin restoran, kategori ve urunleri ceker
- `OrderRepository.cs`: Siparis oncesi masa ve urun kontrolu yapar, siparisi kaydeder

### `Services`

Is kurallarinin yazildigi katmandir. Repository'den veri alir, kontrol eder, hesap yapar ve sonucu controller'a verir.

Bu katmanda neler olur:

- Is akisi kurallari
- Validasyonun business kismi
- Hesaplama ve donusum
- DTO uretimi

Dosyalar:

- `Interfaces/IMenuService.cs`: Menu servis contract'i
- `Interfaces/IOrderService.cs`: Siparis servis contract'i
- `MenuService.cs`: Restoran menusunu response DTO'ya donusturur
- `OrderService.cs`: Siparis acma surecini yonetir

`OrderService` ozellikle su kurallari uygular:

- Gonderilen masa ilgili restorana ait mi
- Sipariste istenen urunler gercekten ilgili restoran menusunde var mi
- Her siparis satiri icin tutar hesaplanir
- Siparis toplam tutari olusturulur

### `Controllers`

HTTP isteklerinin girdigi katmandir. Controller'lar ince tutulmustur; is kuralini service katmanina birakir.

Dosyalar:

- `MenuController.cs`: `GET /api/menu/{restaurantId}` endpoint'ini saglar
- `OrdersController.cs`: `POST /api/orders` endpoint'ini saglar

Controller'larin gorevi:

- Request almak
- Service cagirmak
- HTTP status code donmek
- Basit hata cevaplari vermek

### `Data`

Veritabaninin teknik kurulum katmanidir.

Dosyalar:

- `AppDbContext.cs`: EF Core'un merkezi sinifi. Tablolar, iliskiler, kolon ayarlari burada tanimlanir.
- `AppDbSeeder.cs`: Uygulama ilk ayaga kalktiginda test icin ornek restoran, kategori, urun ve masa verisi ekler.

Kisa fark:

- `AppDbContext` veritabaninin yapisini anlatir
- `AppDbSeeder` veritabaninin ilk verisini doldurur

### `Properties`

- `launchSettings.json`: Lokal gelistirme sirasinda Visual Studio veya `dotnet run` icin profil ayarlari tutar.

## Kok dosyalar ne ise yarar

### `Program.cs`

Uygulamanin giris noktasi burasidir.

Burada yapilanlar:

- Logging provider ayarlanir
- Controller sistemi aktif edilir
- Swagger aktif edilir
- CORS policy tanimlanir
- `AppDbContext` baglanir
- PostgreSQL veya InMemory secimi yapilir
- Repository ve service katmanlari DI container'a eklenir
- Seed islemi uygulama baslangicinda calistirilir
- Middleware pipeline kurulur

Kisaca: uygulama nasil ayaga kalkacaksa onun merkezi burasidir.

### `AiMenu.Api.csproj`

Bu proje dosyasidir. Hangi .NET surumunun ve hangi NuGet paketlerinin kullanildigi burada yazilir.

Su an projede kullanilan ana paketler:

- `Microsoft.EntityFrameworkCore.Design`
- `Microsoft.EntityFrameworkCore.InMemory`
- `Npgsql.EntityFrameworkCore.PostgreSQL`
- `Swashbuckle.AspNetCore`

### `appsettings.json`

Ortak uygulama ayarlarinin tutuldugu dosyadir.

Su an icerdigi kritik ayar:

- `ConnectionStrings:DefaultConnection`

Bu alan bos birakilirsa proje InMemory database ile calisir. Bu sayede ilk gelistirme ve test sureci hizli baslar.

### `appsettings.Development.json`

Development ortamina ozel ayarlari tutar. Lokal ortamda farkli log seviyesi veya farkli connection string vermek icin kullanilir.

### `AiMenu.Api.http`

IDE icinden HTTP istekleri atmak icin kullanilabilen yardimci dosyadir. Ekip isterse buraya ornek menu ve siparis request'leri eklenebilir.

## Mevcut endpointler

### `GET /api/menu/{restaurantId}`

Verilen restoranin aktif kategori ve aktif urunlerinden olusan menusunu doner.

Bu endpoint su an:

- Restoran aktif mi kontrol eder
- Sadece aktif kategorileri alir
- Sadece aktif urunleri alir
- Sonucu API icin uygun DTO'ya cevirir

### `POST /api/orders`

Yeni siparis olusturur.

Beklenen davranis:

- `restaurantId` ve `tableId` gelir
- Siparisteki urunler dogrulanir
- Satir toplamlar hesaplanir
- Genel toplam olusturulur
- Siparis `Pending` olarak kaydedilir

## Uygulama akisi nasil calisiyor

Bir istek sisteme geldiginde genel akis su sekildedir:

1. HTTP istegi controller'a gelir.
2. Controller ilgili service'i cagirir.
3. Service is kurallarini uygular.
4. Gerekirse repository ile veritabanindan veri ceker.
5. Repository `AppDbContext` uzerinden EF Core sorgusu calistirir.
6. Sonuc tekrar service'e doner.
7. Service response DTO'sunu olusturur.
8. Controller HTTP cevabini doner.

Ornek:

- Musteri menuyu ister
- `MenuController` cagrilir
- `MenuService` menu cevabini hazirlar
- `RestaurantRepository` restoran + kategori + urunleri getirir

Siparis akisinda ise:

- `OrdersController` request alir
- `OrderService` masa ve urunleri dogrular
- `OrderRepository` siparisi kaydeder

## Multi-restaurant mantigi backend'de nasil korunuyor

Bu proje icin en kritik mimari kural budur.

Su anda backend bunun temelini su sekilde atiyor:

- Entity'lerde `RestaurantId` bulunur
- Menu sorgusu restoran bazli cekilir
- Siparis olustururken masa ilgili restorandan mi kontrol edilir
- Urunler ilgili restoran menusunde mi kontrol edilir

Ileride eklenecek tum endpointlerde de ayni kural korunmalidir:

- Admin panel endpoint'leri
- Cashier ekran endpoint'leri
- AI etiketleme ve filtreleme endpoint'leri
- Analitik endpoint'leri

## Bu backend'de henuz olmayan ama sonradan eklenecek alanlar

Bu README yeni gelen ekip uyeleri icin en onemli beklenti listelerinden biridir. Su an sistem cekirdek iskelet seviyesindedir. Asagidaki basliklar sonraki adimlarda beklenir:

- Gercek PostgreSQL migration yapisi
- Authentication ve authorization
- Admin rol yonetimi
- Cashier siparis durum guncelleme endpoint'leri
- Product/category CRUD endpoint'leri
- Table ve QR yonetimi
- Global exception handling
- FluentValidation veya benzeri request validation
- Logging ve monitoring standardi
- AI tag uretim servisi entegrasyonu
- Restaurant bazli analytics endpoint'leri

## Hangi dosyalar kaynak kod degildir

Projeyi inceleyen birinin bunlari kaynak kodla karistirmamasi gerekir:

- `bin/`: Derleme ciktilari
- `obj/`: Gecici build dosyalari
- `run.out.log`, `run.err.log`, `smoke.out.log`, `smoke.err.log`: Lokal calistirma ve smoke test loglari

Bu dosyalar uygulama mantiginin parcasi degildir.

## Yeni ozellik eklerken ekip kurali

Bu backend'e yeni bir ozellik eklenirken genel yapi su sekilde korunmali:

1. Gerekirse yeni entity ekle veya mevcut entity'yi genislet
2. Gerekirse DTO ekle
3. Repository interface ve implementasyonunu yaz
4. Service katmaninda is kurallarini kur
5. Controller ile endpoint'i expose et
6. `restaurantId` izolasyonunu her adimda kontrol et

Bu disiplin korunursa proje buyurken karmasa yerine duzenli bir API omurgasi elde ederiz.
