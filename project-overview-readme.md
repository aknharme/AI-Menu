# Proje Ozet README

Bu dosyanin amaci, repo icindeki tum README'lerde anlatilan bilgiyi tek bir ozet dokumanda toplamak.
Yani bu belge:

- projenin ne oldugunu
- hangi klasorun ne is yaptigini
- backend ve frontendlerin mevcut durumunu
- AI, recommendation, admin ve QR akislarini
- calistirma mantigini
- bugunku proje seviyesini

tek yerde, kisa ve okunabilir sekilde anlatir.

Bu belge detayli teknik referans degil.
Detaylar icin yine alt README dosyalari okunabilir.
Ama biri projeye hizli girmek istiyorsa once bu dosya yeterli olur.

## Proje Nedir

Bu repo, multi-restaurant destekli bir QR menu ve siparis sistemidir.

Sistemde:

- her restoran kendi kategori ve urunlerine sahiptir
- her restoranin birden fazla masasi olabilir
- her masa icin QR kod uretilebilir
- musteri QR okutunca dogru restoran ve masa baglaminda menu acilir
- siparis backend tarafinda dogrulanarak kaydedilir
- admin panel restoran verisini yonetir
- AI tarafi sadece tag extraction yapar
- backend bu tag'lere gore urun onerisi yapar

Bu sistemin temel mimari kurali sudur:

- veri izolasyonu `restaurantId` ile saglanir
- AI urun secmez
- backend urun secimini yapar

## Repo Yapisi

Repo kokunde su ana alanlar bulunur:

- `.github`
- `api`
- `frontend/customer-web`
- `frontend/admin-web`
- `frontend/cashier-web`
- `docs`
- `infra`
- `README.md`
- `project-overview-readme.md`

Bu yapi bize sunu soyler:

- backend ve tum frontendler ayni mono-repo icinde yonetiliyor
- ekip ayni branch ve CI akisi uzerinden ilerleyebiliyor
- uygulama kodu, dokumantasyon ve altyapi notlari ayni yerde tutuluyor

## Buyuk Resim

Sistemin genel isleyisi su sekildedir:

1. Admin panelde restoranin kategori, urun ve masa verileri yonetilir.
2. Masa icin QR kod olusturulur.
3. Musteri QR okutur.
4. Customer web `restaurantId` ve `tableId` ile menuye girer.
5. Backend sadece ilgili restorana ait aktif menu verisini doner.
6. Musteri urunleri gorur, detaylarini inceler ve siparis verir.
7. Siparis backend tarafinda urun ve masa dogrulamalariyla kaydedilir.
8. Kullanici serbest metin yazarsa AI sadece tag uretir.
9. Backend bu tag'lerle aktif urunleri filtreler ve onerir.

## Backend Ozet

Backend ASP.NET Core ile yazilmistir.
Veri katmaninda EF Core kullanilir.
Connection string verilirse PostgreSQL, verilmezse InMemory database ile calisabilir.

Backendin mevcut ana sorumluluklari:

- restoran bazli menu verisi sunmak
- siparis olusturmak
- admin panel CRUD endpointlerini karsilamak
- AI tag extraction servisini expose etmek
- tag bazli urun onerisi yapmak

### Katmanlar

Backend yapisi temel olarak su katmanlardan olusur:

- `Controllers`
- `Services`
- `Repositories`
- `DTOs`
- `Entities`
- `Data`

Katman mantigi:

- controller HTTP katmanidir
- service business logic katmanidir
- repository veri erisim katmanidir
- DTO API kontratlaridir
- entity veritabani modelleridir
- data EF Core ve migration katmanidir

### Mevcut Ana Entity'ler

Su an sistemdeki ana domain modeller:

- `Restaurant`
- `Category`
- `Product`
- `Tag`
- `ProductTag`
- `Table`
- `Order`
- `OrderItem`
- `ProductVariant`
- `ProductAllergen`

Buradaki ana tasarim kararlari:

- tum kritik kayitlar `RestaurantId` ile iliskilidir
- `Tag` ve `ProductTag` recommendation sistemi icin vardir
- `Table` ile masa bazli siparis akisi kurulur
- `Order` ve `OrderItem` siparis veri modelini olusturur

### Mevcut Backend Endpoint Gruplari

#### Menu endpointleri

- `GET /api/menu/{restaurantId}`
- `GET /api/menu/{restaurantId}/categories`
- `GET /api/menu/{restaurantId}/products`
- `GET /api/menu/{restaurantId}/products/{productId}`

Bu endpointler:

- restorani kontrol eder
- sadece aktif kategori ve aktif urunleri doner
- urun detayinda tag, alerjen ve varyant bilgisi verir

#### Siparis endpointi

- `POST /api/orders`

Bu endpoint:

- masa ilgili restorana ait mi kontrol eder
- siparisteki urunler ilgili restoranda var mi kontrol eder
- tutarlari backend tarafinda hesaplar
- siparisi `Pending` olarak kaydeder

#### AI ve recommendation endpointleri

- `POST /api/recommendation`
- `POST /api/recommendation/products`
- `POST /api/recommendation/prompt`

Buradaki rol dagilimi:

- `POST /api/recommendation`
  kullanici metninden tag cikarir
- `POST /api/recommendation/products`
  gelen tag'lere gore urun filtreler
- `POST /api/recommendation/prompt`
  once AI ile tag uretir, sonra DB tarafinda urun onerir

#### Admin endpointleri

- `GET /api/admin/categories/{restaurantId}`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{id}`
- `DELETE /api/admin/categories/{id}`
- `GET /api/admin/products/{restaurantId}`
- `POST /api/admin/products`
- `PUT /api/admin/products/{id}`
- `DELETE /api/admin/products/{id}`
- `GET /api/admin/tables/{restaurantId}`
- `POST /api/admin/tables`
- `PUT /api/admin/tables/{id}`
- `DELETE /api/admin/tables/{id}`

Bu endpointler:

- restoran bazli kategori yonetimi yapar
- urun CRUD saglar
- urun aktif/pasif durumunu yonetir
- masa CRUD saglar
- masa URL mantigini tasir

## AI ve Recommendation Ozet

Bu proje icinde AI chatbot degildir.
AI'nin gorevi sadece kullanici metninden tag cikarmaktir.

Ornek:

- kullanici: `hafif bir sey istiyorum`
- AI: `["hafif"]`

Sonraki adimda backend:

- `restaurantId` ile filtreleme yapar
- sadece aktif urunleri dikkate alir
- tag eslesmesine gore urunleri siralar
- tag bulunamazsa fallback olarak populer urunleri dondurebilir

Bu yaklasim bilerek secildi:

- AI menu mantigini yonetmez
- AI urun secmez
- AI sadece etiket uretir
- asil karar backend tarafinda kalir

### Ollama Kullanimi

AI entegrasyonu Ollama tabanlidir.
Model backend tarafinda servis katmanina baglanir.
AI cevabi parse edilir.
JSON parse hatalarinda veya servis ulasilamazsa fallback davranisi vardir.

Bu da sistemi daha dayanikli hale getirir.

## Customer Web Ozet

Customer web, QR okutulduktan sonra acilan musteri arayuzudur.

Mevcut customer tarafta:

- restoran menusu listelenir
- kategori sekmeleri vardir
- urun kartlari vardir
- urun detay drawer yapisi vardir
- URL'den `restaurantId` ve `tableId` okunur
- AI destekli oneri alani vardir
- kullanici prompt girip sonuc gorebilir

Customer tarafinda hedeflenen deneyim:

- kolay menu gezme
- urun detayina hizli ulasma
- masaya bagli siparis deneyimi
- AI destekli dogru urun bulma

## Admin Web Ozet

Admin web restoranin yonetim panelidir.

Su an admin tarafta:

- dashboard ekranı var
- kategori listeleme var
- kategori ekleme ve duzenleme var
- urun listeleme var
- urun ekleme ve duzenleme var
- fiyat, kategori, aciklama, icerik ve aktiflik yonetimi var
- masa listeleme var
- masa ekleme, duzenleme ve silme var
- her masa icin QR gosterimi var
- QR indirme butonu var

Admin panelin amaci restoranin kendi verisini kod degistirmeden yonetebilmesidir.

## Cashier Web Ozet

Cashier web repo icinde ayri bir uygulama olarak bulunur.
Bu taraf customer ve admin kadar genis degil ama mimari olarak hazirdir.

Su anda:

- build alabilir
- ayri layout ve router yapisi vardir
- siparis operasyon ekranlari icin ayrilmis bir alan sunar

Bu taraf sonraki iterasyonlarda siparis durum yonetimi icin buyutulebilir.

## Masa ve QR Ozet

Her restoranin birden fazla masasi olabilir.
Her masa bir menu URL'sine baglanir.

Temel format:

```text
/menu?restaurantId=...&tableId=...
```

Masa sistemi su an:

- admin panelde listelenebilir
- yeni masa olusturulabilir
- duzenlenebilir
- silinebilir
- QR kodu gosterilebilir
- QR dosyasi indirilebilir

Customer web:

- bu URL'den `restaurantId` ve `tableId` bilgisi alir
- siparis verirken `tableId` backend'e tasinir

## Frontend Teknolojileri

Tum frontend uygulamalari su ortak yapiyi kullanir:

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios

Admin panelde QR icin:

- `qrcode.react`

kullanilir.

## Infra Ozet

`infra` klasoru lokal altyapi calistirma ve reverse proxy mantigi icin bulunur.

Burada:

- `docker-compose.dev.yml`
- `nginx/default.conf`
- `infra/infra-readme.md`

bulunur.

Bu taraf uygulamanin cekirdek business logic'i degil ama lokal ortam kurulumunu destekleyen kisimdir.

## CI ve Surec Ozet

`.github/workflows/build-check.yml` ile:

- backend build
- frontend build

kontrolleri yapilir.

Bu sayede:

- syntax hatalari
- compile sorunlari
- bozuk frontend build'leri

merge oncesi yakalanabilir.

Branch mantigi genel olarak:

- `main`
- `develop`
- `feature/*`
- `bugfix/*`

seklindedir.

## Calistirma Ozet

### Backend

```bash
cd api
dotnet run
```

### Customer Web

```bash
cd frontend/customer-web
npm run dev
```

### Admin Web

```bash
cd frontend/admin-web
npm run dev
```

### Cashier Web

```bash
cd frontend/cashier-web
npm run dev
```

Connection string verilmezse backend InMemory veritabani ile ayaga kalkabilir.
Bu da lokal deneme ve demo akislarini kolaylastirir.

## Su Anki Proje Durumu

Bugun itibariyla proje su seviyededir:

- mono-repo yapi oturmus durumda
- backend menu ve siparis omurgasi calisiyor
- customer menu akisi calisiyor
- admin panelde kategori, urun ve masa yonetimi var
- AI tag extraction altyapisi var
- backend recommendation mantigi var
- QR ve masa baglanti mantigi mevcut
- frontendler build aliyor
- backend build aliyor

Bu haliyle proje artik yalnizca baslangic iskeleti degil.
Calisabilir, test edilebilir ve yeni feature'larla buyutulebilir bir urun temelidir.

## Bu Dosyadan Sonra Ne Okunur

Bu dosya hizli ozet icindir.
Daha detayli okumak isteyen biri su dosyalara gecebilir:

- [README.md](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/README.md)
- [project-overview-readme.md](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/project-overview-readme.md)
- [api/backend-readme.md](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/api/backend-readme.md)
- [frontend/frontend-readme.md](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/frontend/frontend-readme.md)
- [database-readme.md](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/database-readme.md)
- [ai-readme.md](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/ai-readme.md)
- [infra/infra-readme.md](/Users/emiryilmzl/Desktop/Projeler/AI-Menu/infra/infra-readme.md)
