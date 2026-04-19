# 1. Hafta Detayli Proje Dokumani

Bu dosyanin amaci, projenin ilk hafta sonunda geldigi noktayi butun repo ozelinde anlatmaktir.
Yani bu dokumani okuyan biri sadece `api` klasorunu degil, repo kokunu, frontendleri, `docs`, `infra`, CI yapisini, mevcut eksikleri ve klasorler arasi iliskiyi de anlayabilmelidir.

Bu belge "hangi klasorde ne var" seviyesinde degil, "neden var, ne yapiyor, ne durumda" seviyesinde yazildi.

## 1. Hafta Sonunda Ortaya Cikan Sonuc

Ilk hafta sonunda ekip olarak su temel omurga kurulmus durumda:

- Mono-repo klasor yapisi oturtuldu
- Backend icin calisan ASP.NET Core Web API omurgasi yazildi
- Multi-restaurant mantigina uygun veri modeli cikarildi
- Menu ve siparis icin temel endpointler yazildi
- Customer, Admin ve Cashier icin ayri React uygulamalari kuruldu
- Bu uygulamalar icin routing, layout ve temel ekranlar olusturuldu
- CI icin build-check workflow'u yazildi
- Branch stratejisi ve repo agaci dokumante edildi
- Infra klasorunde docker ve nginx tarafina giris seviyesinde dosyalar eklendi

Bu asamada proje "feature-complete" degil.
Ama ekip gelistirmeye duzenli devam edebilsin diye temel mimari olusmus durumda.

## Repo Koku Ne Anlama Geliyor

Repo kokunde su dosya ve klasorler var:

```text
AI-MENU/
|-- .github/
|-- admin-web/
|-- api/
|-- cashier-web/
|-- customer-web/
|-- docs/
|-- infra/
|-- .gitignore
|-- AI-Menu.sln
|-- database.sql
|-- README.md
`-- README-1.hafta.md
```

Bu yapi bize sunu soyluyor:

- backend ve tum frontendler ayni repoda
- ekip tek merkezden branch ve CI yonetebiliyor
- deployment ve dokumantasyon da ayni repoda tutuluyor

## Klasorler Arasi Buyuk Resim

Projenin ana akis mantigi su:

1. `customer-web`
QR okutan kullanici burada menuye ulasir.

2. `api`
Menu ve siparis isteklerini burada karsilar.

3. `cashier-web`
Olusan siparislerin operasyonel takibi icin kullanilir.

4. `admin-web`
Restoran yonetimi, menu ve masa yonetimi icin dusunulmustur.

5. `database.sql` ve EF Core modeli
Veri tabaninin hangi kavramlar uzerinden kuruldugunu burada goruruz.

6. `.github/workflows`
Yapilan isin bozulmadan branch'lere gidebilmesi icin build kontrolunu burada goruruz.

7. `infra`
Lokal docker calistirma ve reverse proxy gibi altyapi notlari buradadir.

8. `docs`
Ekip ici surec bilgisini burada tutuyoruz.

## Klasor Bazli Detayli Aciklama

## `.github`

Bu klasor repo operasyonlari icindir.
Uygulamanin runtime kodu burada degil, gelistirme surecinin otomasyonu burada bulunur.

Alt klasor:

```text
.github/
`-- workflows/
    `-- build-check.yml
```

### `build-check.yml`

Bu dosya GitHub Actions workflow'udur.

Tetiklendigi branch'ler:

- `main`
- `develop`
- `feature/**`
- `bugfix/**`

Iki ana job vardir:

### `build-api`

Ne yapar:

- repo'yu checkout eder
- `.NET 9` kurar
- `api/AiMenu.Api.csproj` icin restore yapar
- release modunda build alir

Amaci:

- backend tarafinda syntax veya compile hatasi varsa merge oncesi yakalamak

### `build-frontends`

Matrix ile uc uygulamayi tek tek build eder:

- `customer-web`
- `admin-web`
- `cashier-web`

Ne yapar:

- `Node 20` kurar
- ilgili klasorde `npm ci` calistirir
- `npm run build` ile production build alir

Amaci:

- bir frontend digerinden bagimsiz build alabiliyor mu kontrol etmek
- pull request acildiginda temel bozulmalarin erkenden yakalanmasi

Bu klasor uygulama kodu icermese de ekip gelistirmesi icin cok kritik.

## `api`

`api` klasoru su an projenin en olgun ve en kritik klasorudur.
Multi-restaurant QR menu ve siparis sisteminin backend omurgasi burada yazildi.

Klasor agaci:

```text
api/
|-- Controllers/
|-- Data/
|-- DTOs/
|-- Entities/
|-- Properties/
|-- Repositories/
|   `-- Interfaces/
|-- Services/
|   `-- Interfaces/
|-- AiMenu.Api.csproj
|-- AiMenu.Api.http
|-- appsettings.json
|-- Program.cs
`-- README.md
```

### `Controllers`

HTTP endpoint girisleri burada.

Dosyalar:

- `MenuController.cs`
- `OrdersController.cs`

`MenuController`

- `GET /api/menu/{restaurantId}` route'unu acar
- `IMenuService` ile calisir
- restoran menusu yoksa `404` doner
- varsa `200` ile menu sonucunu doner

`OrdersController`

- `POST /api/orders` route'unu acar
- `CreateOrderRequestDto` alir
- `IOrderService` ile siparis olusturur
- basariliysa `201 Created` doner
- business rule hatalarinda `400 BadRequest` doner

Controller katmaninin mantigi:

- ince kalmak
- business logic tasimamak
- yalnizca HTTP ile servis katmani arasinda kopru olmak

### `Data`

Bu klasor veritabaninin EF Core tarafini temsil eder.

Dosyalar:

- `AppDbContext.cs`
- `AppDbSeeder.cs`

`AppDbContext`

- EF Core'un merkezi sinifi
- tablolari `DbSet` olarak tanimliyor
- iliskileri `OnModelCreating` icinde configure ediyor
- `Tags` listesini JSON string olarak saklamak icin conversion kullaniyor
- `Price`, `TotalAmount`, `UnitPrice`, `LineTotal` gibi alanlarda precision ayari yapiyor

`AppDbSeeder`

- uygulama ilk calistiginda demo veri ekliyor
- `EnsureCreatedAsync()` ile veritabaniyi ayaga kaldiriyor
- veritabani bos degilse tekrar veri eklemiyor
- sabit GUID kullanarak ekip icin test kolayligi sagliyor

Seed ile gelen temel veri:

- restoran: `Demo Cafe`
- kategoriler: `Icecekler`, `Burgerler`
- urunler: `Kola`, `Klasik Burger`
- masa: `Masa 1`

### `DTOs`

API kontratlarinin oldugu klasor.
Entity'leri direkt disari acmamak icin kullaniliyor.

Request DTO'lari:

- `CreateOrderRequestDto`
- `CreateOrderItemRequestDto`

Response DTO'lari:

- `MenuResponseDto`
- `MenuCategoryDto`
- `MenuProductDto`
- `OrderResponseDto`
- `OrderItemResponseDto`

Buradaki mantik:

- disariya kontrollu veri acmak
- validasyonu daha net yapmak
- entity modelini frontendden ayri tutmak

### `Entities`

Domain model burada.
Bu proje multi-restaurant mantigina gore tasarlandigi icin merkezde her zaman `RestaurantId` bulunuyor.

Dosyalar:

- `Restaurant.cs`
- `Category.cs`
- `Product.cs`
- `Table.cs`
- `Order.cs`
- `OrderItem.cs`

Her biri neyi temsil eder:

- `Restaurant`: sistemdeki ana tenant
- `Category`: menudeki kategori
- `Product`: satilan urun
- `Table`: restorana ait masa ve QR baglami
- `Order`: ana siparis kaydi
- `OrderItem`: siparis satirlari

### `Repositories`

Veri erisim katmani.

Dosyalar:

- `Interfaces/IRestaurantRepository.cs`
- `RestaurantRepository.cs`
- `Interfaces/IOrderRepository.cs`
- `OrderRepository.cs`

`RestaurantRepository`

- aktif restoran menusunu getirir
- aktif kategori ve aktif urunleri include eder

`OrderRepository`

- restorana ait aktif masa bulur
- restorana ait aktif urunleri bulur
- order kaydini veritabanina yazar

### `Services`

Business logic burada.

Dosyalar:

- `Interfaces/IMenuService.cs`
- `MenuService.cs`
- `Interfaces/IOrderService.cs`
- `OrderService.cs`

`MenuService`

- repository'den restoran menusunu alir
- `MenuResponseDto` haline cevirir
- kategorileri `DisplayOrder` ile siralar
- urunleri ada gore siralar

`OrderService`

- masa dogrulama yapar
- urunlerin ilgili restorana ait olup olmadigini kontrol eder
- satir toplamini backend'de hesaplar
- siparis toplam tutarini backend'de hesaplar
- `Pending` statuslu order olusturur

### `Properties`

`launchSettings.json`

- lokal geliştirme profilleri icin kullanilir

### Kok Dosyalar

`AiMenu.Api.csproj`

- proje dosyasi
- su an `.NET 9` hedefliyor
- EF Core, PostgreSQL provider ve Swagger paketlerini referansliyor

`AiMenu.Api.http`

- manuel HTTP testleri icin kullanilabilir

`appsettings.json`

- connection string gibi konfigurasyonlar icin

`Program.cs`

- tum backend'in startup dosyasi
- logging, swagger, cors, db provider secimi ve DI burada

`README.md`

- backend klasoru icin ayri aciklama dosyasi

### `api` Klasorunun Su Anki Seviyesi

Hazir olanlar:

- katmanli yapi
- menu endpoint'i
- order create endpoint'i
- EF Core model konfigurasyonu
- seed data
- swagger
- InMemory fallback

Eksik olanlar:

- migration yapisi
- auth
- admin CRUD endpoint'leri
- cashier endpoint'leri
- global exception middleware
- test projesi
- daha ileri validation ve logging

## `customer-web`

Bu klasor musteri tarafini temsil eder.
Mantik olarak QR kod okutunca acilmasi beklenen uygulama budur.

Klasor agaci:

```text
customer-web/
|-- src/
|   |-- components/
|   |-- hooks/
|   |-- layouts/
|   |-- pages/
|   |-- router/
|   |-- services/
|   |-- types/
|   `-- utils/
|-- .env.example
|-- index.html
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
|-- tsconfig*.json
`-- vite.config.ts
```

### `src/main.tsx`

- React giris noktasi
- `RouterProvider` ile uygulama ayaga kalkiyor

### `src/router/index.tsx`

- root route tanimli
- `CustomerLayout` uzerinden `MenuPage` render ediliyor

### `src/layouts/CustomerLayout.tsx`

- ortak header
- sayfa genisligi
- `Outlet` ile alt route'lar

### `src/pages/MenuPage.tsx`

- customer uygulamasinin ana sayfasi
- query string'ten `restaurantId` ve `tableId` aliyor
- `MenuList` component'ine iletiyor

### `src/components/MenuList.tsx`

Bu klasordeki en kritik dosya.

Ne yapiyor:

- menu verisini cekiyor
- loading state yonetiyor
- hata state yonetiyor
- veri geldiyse kart halinde listeleme yapiyor

UI tarafinda:

- mobil oncelikli grid yapi
- urun karti
- gorsel alani
- fiyat ve `Ekle` butonu

### `src/hooks/useQueryParams.ts`

- URL'den `restaurantId` ve `tableId` okuyor
- QR link mantigi icin temel hazirlik

### `src/services/api.ts`

- merkezi axios instance
- `VITE_API_BASE_URL` yoksa `http://localhost:5000/api`

### `src/services/menuService.ts`

- menu datasi cekmek icin servis fonksiyonu

### `src/types/menu.ts`

- frontend tarafinin menu tipi burada

### `src/utils/formatPrice.ts`

- fiyat formatlama yardimci fonksiyonu

### `customer-web` Su An Ne Seviyede

Hazir olanlar:

- Vite + React + Tailwind kurulumu
- layout
- menu sayfasi
- query param mantigi
- servis katmani baslangici
- responsive listeleme arayuzu

Eksik olanlar:

- backend kontrati ile tam uyum
- siparis olusturma entegrasyonu
- sepet mantigi
- masa bilgisini UI'da gercek gostermek
- loading skeleton / daha iyi hata deneyimi

### Onemli Teknik Not

Su an customer frontend ile backend arasinda uyumsuzluk var:

- backend route'u `GET /api/menu/{restaurantId}`
- frontend servis mantigi `/menu` query param bekliyor

Ayrica backend `MenuResponseDto` donuyor, frontend ise farkli bir liste yapisi bekliyor.

Yani bu klasor calisabilir iskelet seviyesinde ama API entegrasyonu tamam degil.

## `admin-web`

Bu klasor restoran yonetim panelinin baslangic surumudur.

Klasor yapi mantigi `customer-web` ile benzer:

- `components`
- `pages`
- `layouts`
- `router`
- `services`
- `hooks`
- `types`
- `utils`

### `src/main.tsx`

- admin uygulamasinin giris noktasi

### `src/router/index.tsx`

- root route tanimli
- `AdminLayout` ile `DashboardPage` render edilir

### `src/layouts/AdminLayout.tsx`

- admin panel header'i
- genel sayfa konteyner'i
- cikis butonu taslagi

### `src/pages/DashboardPage.tsx`

Ilk dashboard ekranidir.

Icerik:

- dashboard basligi
- kisa aciklama
- uc adet ozet kart
- hizli islem butonlari

### `src/components/StatCard.tsx`

- tekrar kullanilabilir metrik kart component'i

### `src/services/api.ts`

- admin tarafinda API cagri merkezi olmasi icin eklendi

### `admin-web` Su An Ne Seviyede

Hazir olanlar:

- panel iskeleti
- temel dashboard UI
- reusable stat card component
- router ve layout yapisi

Eksik olanlar:

- auth
- gercek dashboard verisi
- kategori/urun CRUD
- masa yonetimi
- restoran ayarlari
- order raporlama

Bu klasor su an "yonetim paneli iskeleti" seviyesinde.

## `cashier-web`

Bu klasor kasiyer veya siparis operasyon panelidir.

Amaci:

- acik siparisleri gormek
- durumlari takip etmek
- ileride odeme veya operasyon surecini yonetmek

### `src/main.tsx`

- uygulama girisi

### `src/router/index.tsx`

- root route uzerinden `CashierLayout` ve `OrdersPage` render edilir

### `src/layouts/CashierLayout.tsx`

- ortak header
- `Canli` badge'i
- panel genisligi

### `src/pages/OrdersPage.tsx`

- mock siparis verileri tanimli
- bu siparisleri `OrderCard` ile listeliyor

Bu mock veriler backend baglantisi gelene kadar UI'nin bos gorunmemesi icin var.

### `src/components/OrderCard.tsx`

- siparis no
- masa ismi
- status
- saat
- toplam tutar

gosterir.

Status mapping de burada:

- `pending`
- `preparing`
- `ready`
- `paid`

### `src/types/order.ts`

- cashier ekraninda kullanilan `Order` tipi
- `OrderStatus` union type'i

### `cashier-web` Su An Ne Seviyede

Hazir olanlar:

- siparis ekran iskeleti
- order kart component'i
- mock veriler
- routing ve layout

Eksik olanlar:

- gercek backend entegrasyonu
- polling veya realtime altyapi
- order status update aksiyonlari
- odeme akisi
- filtreleme

Bu klasor de "operasyon paneli taslagi" seviyesinde.

## `docs`

Bu klasor kod degil, ekip bilgisidir.

Dosyalar:

- `branching-strategy.md`
- `frontend-ports.md`
- `repository-tree.md`

### `branching-strategy.md`

Ne anlatir:

- `main`
- `develop`
- `feature/*`
- `bugfix/*`

branch rollerini

Ayrica:

- feature branch nasil acilir
- bugfix branch nasil acilir
- PR mantigi
- merge akisi

Bu dosya ekipte herkesin ayni git disipliniyle calismasi icin var.

### `frontend-ports.md`

Ne anlatir:

- customer hangi portta
- admin hangi portta
- cashier hangi portta
- nasil calistirilir
- `.env` icinde API adresi nasil verilir

Onemli not:

Bu dosya hala eski klasor yolunu `frontend/customer-web` gibi yaziyor.
Repo yapisi degistigi icin bunun ileride guncellenmesi iyi olur.

### `repository-tree.md`

- repo agacinin dokumani
- yeni gelen birinin yapiyi tek bakista gormesi icin var

### `docs` Klasorunun Rolu

Bu klasorun rolunu kucuk gormemek lazim.
Kod buyudukce ekipteki hiz kaybi genelde dokumansizliktan olur.
Bu klasor o kaybi azaltmak icin eklendi.

## `infra`

Bu klasor lokal ortam ve deployment'a hazirlik icin giris seviyesinde dosyalar barindiriyor.

Dosyalar:

- `README.md`
- `docker-compose.dev.yml`
- `nginx/default.conf`

### `infra/README.md`

- klasorun ne ise yaradigini aciklar

### `docker-compose.dev.yml`

Bu dosya lokal gelistirme icin dusunuldu.

Servisler:

- `api`
- `customer-web`
- `admin-web`
- `cashier-web`

Ne yapiyor:

- repo'yu volume olarak bagliyor
- backend icin `dotnet restore && dotnet run`
- frontendler icin `npm install && npm run dev`
- farkli portlardan expose ediyor

Bu su an tam production docker setup'i degil.
Daha cok lokal hizli baslangic amacli.

### `nginx/default.conf`

Ne yapiyor:

- `/api/` isteklerini backend'e proxy'liyor
- diger route'larda SPA fallback sagliyor

Bu dosya ileride deploy asamasinda daha da genisletilebilir.

### `infra` Klasorunun Su Anki Seviyesi

Hazir olanlar:

- temel docker compose
- temel nginx reverse proxy

Eksik olanlar:

- production compose
- environment ayrimi
- database container
- secret yonetimi
- healthcheck ve deploy scriptleri

## Klasor Disindaki Onemli Kok Dosyalari

## `.gitignore`

Bu dosya repo temizligini korur.

Ignore edilen ana gruplar:

- isletim sistemi dosyalari
- IDE dosyalari
- `.NET bin/obj`
- `node_modules`
- `dist/build`
- `.env` varyantlari
- lokal loglar

Bu mono-repo oldugu icin hem .NET hem React tarafini birlikte kapsayacak sekilde yazildi.

## `AI-Menu.sln`

Bu dosya solution dosyasi.

Amaci:

- .NET tarafini solution seviyesinde yonetmek
- IDE icinde backend projelerini rahat acabilmek

Su an repo tek backend projesi icerse de ileride test projesi veya ek servis eklenirse burada toplanabilir.

## `database.sql`

Bu dosya PostgreSQL sema taslagidir.

Tablolar:

- `restaurants`
- `tables`
- `categories`
- `products`
- `orders`
- `order_items`

Ayrica:

- foreign key'ler
- index'ler
- test insert'leri

Onemli not:

Bu dosya ile EF Core modeli birebir ayni durumda degil.

Fark:

- backend entity tarafinda GUID kullaniliyor
- `database.sql` tarafinda `SERIAL` int id kullaniliyor

Bu da bize sunu gosteriyor:

- SQL dosyasi ilk veritabani taslagini temsil ediyor
- backend ise daha guncel modele gecmis olabilir
- ileride migration veya yeni SQL ile bu fark kapatilacak

## `README.md`

Bu dosya daha genel repo README'si.

Icerigi:

- proje ozeti
- klasor agaci
- branch akisi
- calistirma komutlari
- temel kurulum bilgisi

## `README-1.hafta.md`

Bu dosya ise senin istedigin daha detayli proje hafizasi.
Amaci:

- yeni gelen biri projeyi teknik olarak anlayabilsin
- klasorler arasinda kaybolmasin
- ekipte bilgi tek kisiye bagli kalmasin

## Projede Klasorler Birbiriyle Nasil Iliskili

Bu kisim repo hakimiyeti icin kritik.

### Musteri akisi

1. kullanici QR okutur
2. `customer-web` acilir
3. URL'den `restaurantId` ve `tableId` okunur
4. menu istegi `api`'ye gider
5. backend restoran bazli menu verisi doner
6. kullanici urun secer
7. siparis `POST /api/orders` ile backend'e gider

### Operasyon akisi

1. siparis backend'de olusur
2. bu siparisler ileride `cashier-web` tarafinda gosterilecektir
3. kasiyer siparis statuslerini yonetecektir

### Yonetim akisi

1. restoran yoneticisi `admin-web` tarafina girer
2. urun, kategori, masa ve dashboard verilerini yonetir
3. bunun icin ilerde backend'de admin endpoint'leri yazilacaktir

## Su Anki Teknik Gercekler

Projeyi gercekci okumak icin su noktalar net bilinmeli:

- backend omurgasi frontendlerden daha ileride
- customer frontend ile backend kontrati henuz tam eslesmiyor
- admin ve cashier daha cok UI iskeleti seviyesinde
- SQL semasi ile EF Core modeli tamamen hizali degil
- CI tarafinda build dogrulamasi var ama test pipeline'i yok
- infra tarafi temel giris seviyesinde

Bu kotu bir durum degil.
Bu, ilk haftada dogru olarak once mimari ve iskelet kurulmus demek.

## Yeni Gelen Birinin Okuma Sirasi

Projeye yeni giren biri icin onerilen sira:

1. `README.md`
2. `README-1.hafta.md`
3. `.github/workflows/build-check.yml`
4. `docs/branching-strategy.md`
5. `api/Program.cs`
6. `api/Data/AppDbContext.cs`
7. `api/Entities/*`
8. `api/Services/*`
9. `customer-web/src/*`
10. `admin-web/src/*`
11. `cashier-web/src/*`
12. `infra/docker-compose.dev.yml`

Bu sirayla okursa tum repo mantigini hizli toplar.

## 1. Hafta Sonunda Neler Hazir, Neler Degil

Hazir olanlar:

- mono-repo klasor yapisi
- branch stratejisi
- build-check pipeline
- backend temel mimarisi
- menu ve siparis API'leri
- customer/admin/cashier uygulama iskeletleri
- docker/nginx giris dosyalari
- repo dokumani

Hazir olmayanlar:

- tam frontend-backend entegrasyonu
- auth
- admin CRUD
- cashier operasyon endpoint'leri
- test projeleri
- production-grade db migration akisi
- production deploy otomasyonu

## Son Ozet

Bu repo ilk hafta sonunda su hale geldi:

- `api` klasoru sistemin cekirdek mantigini tasiyor
- `customer-web` kullanicinin QR menu deneyiminin ilk versiyonunu olusturuyor
- `admin-web` yonetim panelinin iskeletini veriyor
- `cashier-web` operasyon panelinin iskeletini veriyor
- `docs` ekip surec bilgisini topluyor
- `infra` lokal ve deploy oncesi altyapi orneklerini tutuyor
- `.github` kalite kapisi olarak build kontrolu sagliyor

Yani bu repo sadece backend degil, butun urunun ilk haftalik temel omurgasidir.
