# Masa ve QR Smoke Test

Bu dokuman masa, QR ve siparis akisinin lokal ortamda hizli dogrulanmasi icin hazirlandi.

## Hazirlik

1. API'yi calistir.
2. `customer-web` uygulamasini `http://127.0.0.1:5173` adresinde ac.
3. `admin-web` uygulamasini `http://127.0.0.1:5174` adresinde ac.
4. Admin paneli `?restaurantId=11111111-1111-1111-1111-111111111111` ile baslat.

## Admin masa yonetimi

1. `Masalar` sekmesine git.
2. `Masa Ekle` ile yeni bir masa olustur.
Beklenen sonuc: Listeye yeni satir eklenir ve her masa icin `menu?restaurantId=...&tableId=...` formatinda URL gorunur.

3. `QR Goster` butonuna tikla.
Beklenen sonuc: QR modal'i acilir ve QR degeri masa URL'si ile eslesir.

4. `QR Indir` butonuna tikla.
Beklenen sonuc: Masa adindan turetilmis `.svg` dosyasi iner.

5. Masayi `Duzenle` ile yeniden adlandir.
Beklenen sonuc: Masa adi guncellenir, `tableId` sabit kalir, URL restoran ve masa baglamini korur.

## Customer menu akisi

1. Admin ekrandaki masa URL'sini yeni sekmede ac.
Beklenen sonuc: Musteri menusu dogru restoran ile acilir.

2. Header'da ve urun detayinda masa etiketi gorunur.
Beklenen sonuc: Ham uzun GUID yerine kisaltilmis bir masa etiketi gorunur.

3. Bir urun secip sepete ekle.
Beklenen sonuc: Sepet acilabilir ve siparis butonu aktif olur.

4. Siparisi gonder.
Beklenen sonuc: API request icinde hem `restaurantId` hem `tableId` bulunur.

## Siparis ve veri koruma

1. Ayni restoranda siparisi cashier ekranindan kontrol et.
Beklenen sonuc: Siparis listeye duser ve ilgili masa ile eslesir.

2. Siparis gecmisi olan masayi admin panelden silmeyi dene.
Beklenen sonuc: Silme islemi engellenir ve hata mesaji gorunur.

3. Masa URL'sinden `restaurantId` veya `tableId` parametresini boz.
Beklenen sonuc: Menu veya siparis akisi kontrollu hata verir; baska restorandan veri sizmaz.
