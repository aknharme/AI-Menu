# Yapay zekâ garson

Müşteri ekranının sol altındaki **AI Garson** düğmesi sohbeti açar. Sohbet yalnızca menü hakkında bilgi ve öneri verir; sipariş oluşturmaz, ödeme almaz veya personel çağırmaz. Müşteri siparişi mevcut sepetten onaylar.

## Anahtarı ekleme

Yerel geliştirmede `api/appsettings.Local.json` dosyasındaki `OpenAI.ApiKey` alanına anahtarınızı ekleyin. Dosya yoksa `api/appsettings.Local.json.example` dosyasını bu adla kopyalayın. Anahtarı sohbet mesajı olarak göndermeyin, `appsettings.json` veya `VITE_*` değişkenlerine yazmayın.

```json
{
  "OpenAI": {
    "ApiKey": "BURAYA_YALNIZCA_KENDI_BILGISAYARINIZDA_EKLEYIN",
    "Model": "gpt-4.1-mini"
  }
}
```

Yerel dosya Git, Docker build context ve publish çıktısından hariçtir. Düz metin yerel geliştirme ayarıdır; cihaz erişimi olan kişiler okuyabilir. Dağıtımda secret yönetimi veya `OpenAI__ApiKey` ortam değişkeni kullanın. Docker Compose için kökteki yerel `.env` dosyasının `OPENAI_API_KEY` alanı backend'e aktarılır. Frontend'e anahtar aktarılmaz.

Ayar değişince **backend'i yeniden başlatın**. Dosya otomatik yeniden yüklenmez.

```powershell
# Proje kökünden (5268'de açık eski API varsa önce kendi terminalinde durdurun)
dotnet run --project api/AiMenu.Api.csproj
```

```powershell
cd frontend/customer-web
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Müşteri adresi: `http://127.0.0.1:5173/`. Anahtar olmadan selamlaşmalar ve eşleşen basit ürün/fiyat soruları çalışır. Diğer mesajlarda yapay zekânın henüz etkinleştirilmediği açıklanır. Eski AiWaiterApi/Ollama servisini başlatmak gerekmez.

## Çalışma şekli ve maliyet sınırları

- `POST /api/ai/{restaurantId}/chat`: `{ message, history: [{ role, content }] }` alır.
- Önce aktif restoran doğrulanır. Selamlaşmalar tam mesaj eşleşmesiyle karşılanır. Menü sorguları aktif ürün, kategori ve fiyatları veritabanından her istekte yeniden okur. Hazır yanıtlar OpenAI çağrısı yapmaz.
- `Cola var mı?`, `Kola ne kadar?` gibi kesin ürün eşleşmeleri hazır yanıt alır. Birden fazla niyet, belirsiz eşleşme, öneri veya alerji soruları ChatGPT'ye gider. `Merhaba, ne önerirsin?` sadece selamlaşma olarak değerlendirilmez.
- Model: değiştirilebilir `gpt-4.1-mini`. REST üzerinden OpenAI Responses API kullanılır; otomatik retry yoktur.
- Kullanıcı mesajı en fazla 1000 karakter. Geçmiş en fazla 8 mesaj, mesaj başına 1600 ve toplam 6000 karakter. Ekranda son 40 mesaj tutulur; sayfa yenilendiğinde veya restoran/masa değiştiğinde sohbet sıfırlanır. Uzun konuşmada eski tercihler unutulabilir.
- Model çıktısı varsayılan en fazla 300 token. Menü bağlamı en fazla 24.000 karakter; kimlikler, resimler ve gereksiz tekrarlar gönderilmez. Büyük menü sessizce kesilmez: sınır aşılırsa açıklayıcı yanıt verilir. Büyük kataloglar için ileride ürün arama aracı eklenebilir.
- İstek gövdesi en fazla 32 KiB. IP başına dakikada 12 istek; uygulama örneği başına en fazla 4 eşzamanlı OpenAI çağrısı. Bunlar günlük parasal harcama limiti değildir. Birden fazla instance kullanılırsa paylaşımlı limit gerekir. Nginx arkasında gerçek IP için yalnızca güvenilen proxy'lerle forwarded-header yapılandırması gerekir; mevcut durumda proxy arkasındaki müşteriler aynı IP kotasını paylaşabilir.
- 25 saniye dış servis zaman aşımı. Yetkilendirme/kota/bağlantı hataları ve eksik model yanıtları kullanıcıya sade mesajla gösterilir. Tekrar denemede yazılan mesaj korunur.
- `store: false` kullanılır. Bu ayar tüm sağlayıcı logları için sıfır saklama garantisi değildir. API anahtarı ve sohbet metni uygulama loguna yazılmaz; başarılı model çağrılarında giriş/çıkış token sayıları loglanır.

## Menü doğruluğu

Model yalnızca ilgili restoranın güncel aktif ürünlerini alır. Menü verisi ve sohbet geçmişi talimat olarak kabul edilmemesi gereken veri olarak sunulur. Fiyat/ürün/alerjen uydurmaması ve eksik bilgiyi personele yönlendirmesi talimatlandırılır. Bu, üretken modelin her yanıtının kusursuz olacağı garantisi değildir; gerçek anahtarla örnek diyaloglar ayrıca değerlendirilmelidir.

Projede fiziksel stok miktarı bulunmuyor. Bu nedenle hazır yanıtlar “menümüzde bulunuyor” der ve stok teyidi ister. Boş alerjen alanı güvenli tüketim anlamına gelmez. Kullanıcıya personel teyidi hatırlatılır.

Backend hatasında sahte ürün/fiyat gösteren eski müşteri demo geçişi kaldırıldı. Restoran adı API'den okunuyor; sohbet ve menü aynı restoran bağlamını kullanıyor.

## Doğrulama

```powershell
dotnet test tests/AiMenu.Api.Tests/AiMenu.Api.Tests.csproj -c Release
npm --prefix frontend/customer-web run build
```

Model yanıtları testlerde HTTP taklidiyle doğrulanır; anahtar gerektirmez ve ücretli çağrı yapmaz. Canlı kontrol için önce `Merhaba`, sonra `Cola var mı?`, ardından `Hafif bir yemek önerir misin?` sorun. Üçüncü mesaj anahtar eklendikten sonra `source: openai` dönmelidir.

İlk kurulum sırasında açık eski API'yi kapatmamak için ayrı önizleme açıldı: müşteri `http://127.0.0.1:5176/`, API `http://127.0.0.1:5269/`. Bu API ayrı, geçici InMemory demo verisi kullanır; 5268'deki çalışan API'nin verileriyle senkron değildir. Bu önizlemeyi tekrar açmak için:

```powershell
dotnet run --project api/AiMenu.Api.csproj -c Release --no-launch-profile -- --urls http://127.0.0.1:5269
# Ayrı terminalde:
$env:VITE_API_BASE_URL = 'http://127.0.0.1:5269/api'
npm --prefix frontend/customer-web run dev -- --host 127.0.0.1 --port 5176 --strictPort
```

Resmî kaynaklar: [Responses API ile metin üretimi](https://developers.openai.com/api/docs/guides/text), [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini).
