# Restoran yazıcı altyapısı

Yerel Windows uygulamasının kaynakları, testleri, kurulum rehberi ve paketleme scriptleri masaüstündeki ayrı `aımenu-yazıcı` klasöründedir. Bu klasör ana Git deposunun dışında olduğundan ana projeyi GitHub'a göndermek yazıcı uygulamasını göndermez; ayrıca sürümlenmelidir. Ana projede API, migration, admin ve kasa entegrasyonu bulunur.

## İşleyiş

1. Müşteri sipariş gönderir. Henüz fiş oluşturulmaz.
2. Kasa siparişi `Pending` durumundan `Preparing` durumuna geçirir.
3. Yazdırma açıksa kategori yönlendirmesine göre mutfak ve bar işleri oluşturulur. Sipariş onayı ve işler aynı veritabanı kaydında gerçekleşir. Eksik kategori yönlendirmesi varsa onay reddedilir.
4. Restoran bilgisayarındaki uygulama HTTPS üzerinden kendi restoranının kuyruğunu alır. Modemde port açılmaz; yerel HTTP sunucusu yoktur.
5. Windows'ta seçili iki yazıcı kuyruğuna ayrı hazırlık fişleri gönderilir. Kasa ve admin baskı durumunu görür.

Sipariş başına bölüm başına tek iş vardır. Tekrar onay ikinci iş üretmez. Ürün adı, adet, varyant, masa ve notlar onay anında sabitlenir. Bunlar hazırlık fişleridir; ödeme/mali fiş entegrasyonu değildir.

## Panel kurulumu

- Güncel API ve frontend derlemelerini çalıştırın. Daha önceden açık API süreçleri yeni kodu otomatik yüklemez; yeniden başlatılması gerekir. InMemory kullanılıyorsa yeniden başlatma geçici siparişleri siler.
- Admin panelinde **Yazıcılar** (`/admin/printing`) sayfasını açın.
- Aktif kategorilerin her biri için Mutfak veya Bar seçip ayarları kaydedin. Yeni kategori ekledikten sonra yönlendirmesini de ekleyin.
- **Eşleştirme kodu oluştur** ile 10 dakika geçerli, tek kullanımlık kod alın.
- Yerel uygulamadaki `setup` komutuna sunucu adresini ve bu kodu girin. İlk testte `Simulated` seçin.
- Yazdırmayı açın; yeni sipariş gönderip kasadan hazırlamayı başlatın. Özellik varsayılan olarak kapalıdır ve geçmiş siparişlere geriye dönük iş oluşturmaz.

Her restoran için bir yerel cihaz ve bu cihazda iki bölüm kuyruğu desteklenir. Yeniden eşleştirme eski cihaz anahtarını geçersiz kılar. Cihaz anahtarı panel yönetim yetkisi vermez. Eşleştirme ve ayar yönetimi yalnızca Admin'e; durum görüntüleme ve kontrollü tekrar baskı Admin/Cashier'e açıktır.

## Baskı durumları

| Durum | Anlamı |
| --- | --- |
| Pending | Cihazın alması bekleniyor |
| Claimed | Cihaz işi aldı; teslim süresi 2 dakika |
| Simulated | Test dosyası oluştu; yazıcıya gönderilmedi |
| Submitted | Windows baskı kuyruğu kabul etti; kâğıdın çıktığı garanti değil |
| Failed | Yazıcıya gönderilmeden hata oluştu |
| Uncertain | Sonuç bilinmiyor; yazıcı ve kâğıt kontrol edilmeli |
| Cancelled | Henüz alınmamış iş siparişle birlikte iptal edildi |

Cihaz, donanıma dokunmadan önce yerel diske günlük yazar. Sonuç bildirimi kaybolursa yalnızca bildirimi tekrarlar. Baskı sırasında çökme veya teslim süresinin dolması otomatik ikinci baskı başlatmaz. Operatör kâğıdı kontrol edip açıkça tekrar baskıyı onaylayabilir; yeni fişte tekrar baskı uyarısı bulunur. Fiziksel baskıda uçtan uca “kesinlikle bir kez” garantisi yoktur.

Yazdırma seçeneğini kapatmak yalnızca yeni iş oluşmasını durdurur; mevcut kuyruğu temizlemez. Cihazın aldığı veya yazıcıya gönderdiği fiş sipariş iptaliyle geri çekilemez; mutfağa/bara ayrıca haber verilmelidir. Otomatik iptal fişi bu sürümde yoktur.

## Veritabanı ve canlı kurulum

`20260923194605_AddRestaurantPrinting` migration'ı restoran bayrağını, eşleştirme/cihaz/yönlendirme/iş tablolarını ve eşzamanlılık alanlarını ekler. API ilişkisel veritabanında açılışta migration uygular; canlıya geçmeden yedek alın ve önce staging üzerinde deneyin. Gerçek PostgreSQL'e bu çalışmada migration uygulanmadı.

Canlı kullanımda PostgreSQL ve düzenli yedek gerekir. InMemory yalnızca test içindir: kuyruk ve eşleştirme bilgileri yeniden başlatmada kaybolur. HTTPS, güvenli JWT secret, kişiye özel yönetici/kasa hesapları ve demo hesapların kaldırılması zorunlu kurulum adımlarıdır. Reverse proxy arkasında IP bazlı limitler için yalnızca güvenilen proxy'lerden forwarded header kabulü ayrıca yapılandırılmalıdır.

Windows paketi gerçek ESC/POS yazıcı modeline göre doğrulanmalıdır. Yazıcı erişimi servis hesabıyla da test edilmeli; kullanıcıya özel paylaşılan yazıcı bağlantıları LocalService tarafından görünmeyebilir. Ayrıntılar ayrı klasördeki README'dedir.

## Yapılan doğrulama

- API testleri: 35 başarılı; yazıcıya özel 7 test SQLite ilişkisel kısıtlarıyla çalışır.
- Windows uygulaması testleri: 8 başarılı.
- Admin ve kasa üretim derlemeleri başarılı.
- Gerçek HTTP + gerçek yerel uygulama ile uçtan uca simülasyon: onay öncesi sıfır fiş, onay sonrası mutfak/bar ayrımı, çift onay, açık tekrar baskı, restoran izolasyonu, tek kullanımlık kod, cihaz iptali ve yetki sınırları doğrulandı.
- Fiziksel yazıcı, Windows'a kalıcı servis kurulumu, gerçek PostgreSQL migration'ı ve tarayıcıda görsel kontrol henüz yapılmadı.
