# AI Menü Backend Developer Kontrol Dosyası

Bu dosya, AI Menü projesinde backend developer olarak backend tarafını tamamlamak, test etmek ve teslim edilebilir seviyeye getirmek için hazırlanmış **1–28 arası tam kontrol planıdır**.

Amaç:

```text
Backend sadece “çalışıyor” olmasın.
Güvenli, test edilebilir, restoran bazlı izole, sipariş/fiyat manipülasyonuna kapalı ve AI garson mimarisine hazır olsun.
```

---

## 0. Backend hedefini netleştir

Backend developer olarak sorumluluğun şu 8 ana parçayı tamamlamaktır:

```text
1. Database modeli ve migration düzeni+
2. Auth / JWT / role / restaurant isolation
3. Admin CRUD endpointleri
4. Public menu endpointleri
5. Order / cashier / status yönetimi
6. AI Waiter entegrasyonu
7. Validation / error handling / logging
8. Swagger + manuel + otomasyon testleri
```

Backend tamamlandı demek için sadece endpointlerin 200 dönmesi yeterli değildir. Hatalı senaryolar, güvenlik senaryoları, restaurantId izolasyonu ve fiyat manipülasyonu testleri de geçmelidir.

---

# 1. İlk kontrol: Proje ayağa kalkıyor mu?

## 1.1. Backend build kontrolü

Terminalde:

```bash
cd api
dotnet build
```

Beklenen sonuç:

```text
Build succeeded.
0 Error
```

Warning varsa not alınmalı. Error varsa diğer işlere geçmeden önce çözülmelidir.

## 1.2. Backend run kontrolü

```bash
dotnet run
```

Backend genelde şu adreste çalışır:

```text
http://localhost:5268
```

Swagger:

```text
http://localhost:5268/swagger
```

## 1.3. İlk kontrol checklist

```text
[ ] dotnet build başarılı
[ ] dotnet run ile backend açılıyor
[ ] Swagger açılıyor
[ ] Terminalde kritik exception yok
[ ] Environment doğru okunuyor
```

---

# 2. Database bağlantısını garantiye al

Backend testlerinin güvenilir olması için backend’in hangi veritabanına bağlandığını bilmen gerekir.

## 2.1. appsettings.Development.json kontrolü

PostgreSQL kullanılacaksa şu tarz bir connection string olmalı:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=ai_menu;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

## 2.2. InMemory fallback mantığını anla

Bu projede çalışma modu şu şekilde:

```text
dotnet run doğrudan çalıştırılırsa:
- Backend InMemory database ile çalışır.

Docker ayağa kaldırılıp backend o ortamda çalıştırılırsa:
- Backend PostgreSQL ile çalışır.
```

Bu ayrım çok önemlidir.

### InMemory nedir?

InMemory, backend çalışırken RAM üzerinde oluşan geçici veritabanıdır.

```text
dotnet run
↓
Backend kendi içinde geçici DB açar
↓
Backend kapanınca veriler silinir
```

Bu modda:

```text
DBeaver’de veri görmezsin.
DBeaver’e eklediğin veriyi backend görmez.
Backend kapanınca veri kaybolur.
Migration ve PostgreSQL davranışları gerçek şekilde test edilmez.
```

### PostgreSQL nedir?

Docker ile çalıştırıldığında kullanılan gerçek ve kalıcı veritabanıdır.

```text
Docker PostgreSQL
↓
DBeaver aynı DB’ye bağlanır
↓
Swagger aynı DB verisini kullanır
↓
Veriler kalıcıdır
```

### Risk

DBeaver’de restoran ekleyip Swagger’da “Restaurant not found” alırsan sebep genelde şudur:

```text
DBeaver PostgreSQL’e bakıyor.
Backend dotnet run ile InMemory’ye bakıyor.
```

Yani aynı veritabanına bakmıyorsundur.

## 2.3. Backend hangi DB ile çalışıyor logla

Program.cs içinde şu tarz log kullanman faydalıdır:

```csharp
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("Database provider: PostgreSQL");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    Console.WriteLine("Database provider: InMemory");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseInMemoryDatabase("AiMenuDb"));
}
```

## 2.4. Migration kontrolü

PostgreSQL modunda:

```bash
dotnet ef migrations list
dotnet ef database update
```

## 2.5. Database checklist

```text
[ ] dotnet run modunun InMemory olduğu biliniyor
[ ] Docker modunun PostgreSQL olduğu biliniyor
[ ] Gerçek backend kabul testleri PostgreSQL modunda yapılıyor
[ ] DBeaver ile Swagger aynı DB’ye bakıyor
[ ] Migrationlar PostgreSQL’e uygulanmış
[ ] Program.cs hangi DB’nin kullanıldığını logluyor
```

---

# 3. Entity modelini tamamla

Backend’in sağlamlığı entity yapısından başlar.

Ana domain modeller:

```text
Restaurant
ApplicationUser / User
Category
Product
Tag
ProductTag
Table
Order
OrderItem
ProductVariant
ProductAllergen
```

## 3.1. Restaurant entity

Kontrol edilmesi gereken alanlar:

```csharp
public class Restaurant
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Table> Tables { get; set; } = new List<Table>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
```

Checklist:

```text
[ ] RestaurantId primary key
[ ] Slug unique
[ ] IsActive var
[ ] CreatedAtUtc var
[ ] Restaurant ilişkileri doğru
```

## 3.2. Category entity

```csharp
public Guid CategoryId { get; set; }
public Guid RestaurantId { get; set; }
public string Name { get; set; } = null!;
public int DisplayOrder { get; set; }
public bool IsActive { get; set; }
```

Checklist:

```text
[ ] Kategori restorana bağlı
[ ] Kategori aktif/pasif yapılabiliyor
[ ] DisplayOrder varsa doğru sıralanıyor
[ ] Category başka restoranın ürünüyle ilişkilendirilemiyor
```

## 3.3. Product entity

```csharp
public Guid ProductId { get; set; }
public Guid RestaurantId { get; set; }
public Guid CategoryId { get; set; }

public string Name { get; set; } = null!;
public string? Description { get; set; }
public decimal Price { get; set; }

public bool IsActive { get; set; }
public bool IsAvailable { get; set; }

public DateTime CreatedAtUtc { get; set; }
public DateTime? UpdatedAtUtc { get; set; }
```

Fiyat için kural:

```text
decimal kullan.
float veya double kullanma.
```

## 3.4. Table entity

```csharp
public Guid TableId { get; set; }
public Guid RestaurantId { get; set; }
public string Name { get; set; } = null!;
public string? Code { get; set; }
public bool IsActive { get; set; }
```

Checklist:

```text
[ ] Masa restorana bağlı
[ ] Masa aktif/pasif
[ ] QR URL üretimi doğru
[ ] Başka restoranın tableId değeri ile sipariş oluşturulamıyor
```

## 3.5. Order entity

```csharp
public Guid OrderId { get; set; }
public Guid RestaurantId { get; set; }
public Guid TableId { get; set; }

public decimal TotalAmount { get; set; }
public OrderStatus Status { get; set; } = OrderStatus.Pending;

public DateTime CreatedAtUtc { get; set; }
public DateTime? UpdatedAtUtc { get; set; }

public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
```

Önerilen status enum:

```csharp
public enum OrderStatus
{
    Pending = 1,
    Preparing = 2,
    Ready = 3,
    Served = 4,
    Cancelled = 5
}
```

## 3.6. OrderItem entity

```csharp
public Guid OrderItemId { get; set; }
public Guid OrderId { get; set; }
public Guid ProductId { get; set; }

public string ProductNameSnapshot { get; set; } = null!;
public decimal UnitPrice { get; set; }
public int Quantity { get; set; }
public decimal LineTotal { get; set; }
```

Önemli:

```text
ProductNameSnapshot ve UnitPrice sipariş anındaki değeri saklamalı.
Ürün fiyatı sonradan değişirse eski siparişin fiyatı bozulmamalı.
```

---

# 4. DTO yapısını sıkılaştır

Controller entity almamalıdır. Her endpoint kendi DTO’sunu kullanmalıdır.

## 4.1. RegisterRequest

```csharp
public class RegisterRequest
{
    public Guid RestaurantId { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Role { get; set; } = null!;
}
```

Validation:

```text
[ ] RestaurantId boş olamaz
[ ] Email formatı geçerli
[ ] Password minimum uzunlukta
[ ] Role izin verilen değerlerden biri
```

## 4.2. CreateProductRequest

```csharp
public class CreateProductRequest
{
    public Guid RestaurantId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}
```

Validation:

```text
[ ] Price > 0
[ ] Name boş değil
[ ] CategoryId ilgili RestaurantId’ye ait
```

## 4.3. CreateOrderRequest

Fiyat alanı almamalıdır.

Doğru:

```csharp
public class CreateOrderRequest
{
    public Guid RestaurantId { get; set; }
    public Guid TableId { get; set; }
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

public class CreateOrderItemRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}
```

Yanlış:

```csharp
public decimal UnitPrice { get; set; }
public decimal TotalAmount { get; set; }
```

Bu alanlar frontend’den alınmamalıdır.

---

# 5. Repository katmanını kontrol et

Repository’nin görevi sadece veri erişimidir.

Örnek:

```csharp
public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid productId);
    Task<List<Product>> GetActiveProductsByRestaurantAsync(Guid restaurantId);
    Task<bool> ExistsInRestaurantAsync(Guid productId, Guid restaurantId);
}
```

Yanlış yaklaşım:

```csharp
var product = await _db.Products.FindAsync(productId);
```

Daha güvenli yaklaşım:

```csharp
var product = await _db.Products
    .FirstOrDefaultAsync(x =>
        x.ProductId == productId &&
        x.RestaurantId == restaurantId &&
        x.IsActive);
```

Checklist:

```text
[ ] Repository business rule yazmıyor
[ ] Repository restaurantId filtrelerini destekliyor
[ ] Read-only sorgularda AsNoTracking kullanılıyor
[ ] Sadece gerekli Include kullanılıyor
```

---

# 6. Service katmanını ana karar merkezi yap

Controller sadece HTTP request almalı, service’e göndermeli ve response dönmelidir.

## 6.1. OrderService kesin kuralları

Sipariş oluştururken sıralama:

```text
1. Restaurant var mı ve aktif mi?
2. Table bu restorana mı ait ve aktif mi?
3. Items boş mu?
4. Quantity değerleri geçerli mi?
5. Her product bu restorana mı ait?
6. Product aktif mi?
7. Fiyat DB’den okunuyor mu?
8. TotalAmount backend’de hesaplanıyor mu?
9. Order Pending olarak kaydediliyor mu?
10. OrderItem snapshot değerleri kaydediliyor mu?
```

Örnek mantık:

```csharp
decimal totalAmount = 0;

foreach (var item in request.Items)
{
    var product = await _db.Products
        .FirstOrDefaultAsync(p =>
            p.ProductId == item.ProductId &&
            p.RestaurantId == request.RestaurantId &&
            p.IsActive);

    if (product is null)
        throw new BadRequestException("Product was not found or inactive.");

    var lineTotal = product.Price * item.Quantity;

    order.Items.Add(new OrderItem
    {
        ProductId = product.ProductId,
        ProductNameSnapshot = product.Name,
        UnitPrice = product.Price,
        Quantity = item.Quantity,
        LineTotal = lineTotal
    });

    totalAmount += lineTotal;
}

order.TotalAmount = totalAmount;
```

Checklist:

```text
[ ] Controller içinde business logic yok
[ ] Service validation yapıyor
[ ] Service restaurant isolation kontrolü yapıyor
[ ] Service fiyatı backend’de hesaplıyor
[ ] Service tutarlı hata dönüyor
```

---

# 7. Auth sistemini tamamla

## 7.1. Register kuralları

Register sırasında:

```text
[ ] Restaurant var mı?
[ ] Restaurant aktif mi?
[ ] Email unique mi?
[ ] Password hashleniyor mu?
[ ] Role izin verilen değer mi?
[ ] User restaurantId ile kaydediliyor mu?
```

Şifre düz metin kaydedilmemelidir.

Doğru:

```text
PasswordHash
```

Yanlış:

```text
Password
```

## 7.2. Login kuralları

Login sırasında:

```text
[ ] Email var mı?
[ ] Şifre hash karşılaştırması doğru mu?
[ ] Kullanıcı aktif mi?
[ ] Restaurant aktif mi?
[ ] Token içine userId claim ekleniyor mu?
[ ] Token içine email claim ekleniyor mu?
[ ] Token içine role claim ekleniyor mu?
[ ] Token içine restaurantId claim ekleniyor mu?
```

## 7.3. Admin endpoint güvenliği

Sadece `[Authorize]` yeterli değildir.

Çünkü `[Authorize]` sadece kullanıcının giriş yapıp yapmadığını kontrol eder.

Multi-restaurant sistemde asıl kontrol:

```text
Token içindeki restaurantId == request içindeki restaurantId
```

Örnek:

```csharp
var userRestaurantId = currentUser.RestaurantId;

if (userRestaurantId != request.RestaurantId)
{
    throw new ForbiddenException("You cannot access another restaurant.");
}
```

---

# 8. CurrentUserService ekle

Her service içinde token claim okumak yerine merkezi servis kullanılmalıdır.

```csharp
public interface ICurrentUserService
{
    Guid UserId { get; }
    Guid RestaurantId { get; }
    string Role { get; }
    bool IsAuthenticated { get; }
}
```

Örnek kullanım:

```csharp
if (_currentUser.RestaurantId != request.RestaurantId)
{
    throw new ForbiddenException("Forbidden restaurant access.");
}
```

Checklist:

```text
[ ] UserId claim okunuyor
[ ] RestaurantId claim okunuyor
[ ] Role claim okunuyor
[ ] Claim yoksa kontrollü hata dönüyor
[ ] Service katmanı CurrentUserService kullanıyor
```

---

# 9. Admin endpointlerini tamamla

Admin tarafında şu gruplar eksiksiz çalışmalıdır:

```text
Categories
Products
Tables
```

## 9.1. Category endpointleri

```http
GET    /api/admin/categories/{restaurantId}
POST   /api/admin/categories
PUT    /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

Testler:

```text
[ ] Token yok → 401
[ ] Başka restaurantId → 403
[ ] Geçerli istek → 200/201/204
[ ] Boş name → 400
[ ] Duplicate category name → 400 veya 409
```

## 9.2. Product endpointleri

```http
GET    /api/admin/products/{restaurantId}
POST   /api/admin/products
PUT    /api/admin/products/{id}
DELETE /api/admin/products/{id}
```

Kontrol:

```text
[ ] Product oluştururken category aynı restorana ait
[ ] Fiyat 0 veya negatif olamaz
[ ] Ürün aktif/pasif yapılabiliyor
[ ] Silme soft delete olarak yapılabiliyor
```

Öneri:

```text
DELETE = soft delete / IsActive false
```

## 9.3. Table endpointleri

```http
GET    /api/admin/tables/{restaurantId}
POST   /api/admin/tables
PUT    /api/admin/tables/{id}
DELETE /api/admin/tables/{id}
```

Kontrol:

```text
[ ] Masa adı boş olamaz
[ ] Aynı restoranda aynı masa adı tekrar etmemeli
[ ] QR URL doğru üretilmeli
[ ] Table soft delete tercih edilmeli
```

QR formatı:

```text
/menu?restaurantId={restaurantId}&tableId={tableId}
```

---

# 10. Public menu endpointlerini tamamla

Müşteri QR ile menüye geldiğinde auth istememelidir.

Olması gereken endpointler:

```http
GET /api/menu/{restaurantId}
GET /api/menu/{restaurantId}/categories
GET /api/menu/{restaurantId}/products
GET /api/menu/{restaurantId}/products/{productId}
```

Kurallar:

```text
[ ] Sadece aktif restoran dönmeli
[ ] Sadece aktif kategori dönmeli
[ ] Sadece aktif ve available ürün dönmeli
[ ] Pasif ürün görünmemeli
[ ] Başka restoranın ürünü product detail endpointinde görünmemeli
```

Ürün detayında dönebilecek bilgiler:

```text
ProductId
Name
Description
Price
Category
Tags
Allergens
Variants
IsAvailable
```

---

# 11. Order endpointini tamamla

Ana endpoint:

```http
POST /api/orders
```

Müşteri QR üzerinden sipariş vereceği için bu endpoint public olabilir. Public olacaksa validation daha sıkı olmalıdır.

## 11.1. Sipariş oluşturma kuralları

```text
[ ] Restaurant aktif mi?
[ ] Table aktif mi ve bu restorana mı ait?
[ ] Items boş değil mi?
[ ] Quantity 1-99 arasında mı?
[ ] Product aktif mi?
[ ] Product bu restorana mı ait?
[ ] Fiyat DB’den mi alınıyor?
[ ] Total backend’de mi hesaplanıyor?
[ ] Order Pending mi başlıyor?
```

## 11.2. Fiyat manipülasyonu testi

Örnek beklenen sonuç:

```text
DB Product.Price = 150
Request quantity = 2
Order.TotalAmount = 300
OrderItem.UnitPrice = 150
```

Eğer request body içinde `unitPrice`, `price`, `totalAmount` gibi alanlar varsa bile backend bunları kullanmamalıdır.

---

# 12. Cashier / order management tarafını tamamla

Cashier web için backend endpointleri:

```http
GET /api/cashier/orders/{restaurantId}
GET /api/cashier/orders/{restaurantId}/active
PUT /api/cashier/orders/{orderId}/status
GET /api/cashier/orders/detail/{orderId}
```

Status akışı:

```text
Pending → Preparing → Ready → Served
Pending → Cancelled
Preparing → Cancelled
```

Kısıtlama:

```text
[ ] Served sipariş tekrar Pending yapılmamalı
[ ] Cancelled sipariş tekrar aktif hale getirilmemeli
[ ] Başka restoranın sipariş statusu değiştirilememeli
[ ] Token restaurantId kontrolü yapılmalı
```

---

# 13. AI Waiter entegrasyonunu backend’e bağla

Yeni mimariye göre AI Menü Backend doğrudan Ollama’ya gitmemelidir.

Doğru akış:

```text
AI Menü Backend → AiWaiterApi → Ollama
```

## 13.1. AI Menü backend’de chat endpoint oluştur

Önerilen endpoint:

```http
POST /api/customer/chat
```

veya:

```http
POST /api/waiter/chat
```

Request:

```json
{
  "restaurantId": "22222222-2222-2222-2222-222222222222",
  "tableId": "33333333-3333-3333-3333-333333333333",
  "message": "Tavuk şişin yanında ne içebilirim?"
}
```

## 13.2. Menü backend DB’den çekilmeli

Doğru:

```text
Customer message frontend’den gelir.
Restaurant menu backend DB’den gelir.
Backend AiWaiterApi’ye güvenilir menü gönderir.
```

Frontend’den gelen menüye güvenilmemelidir.

## 13.3. AiWaiterApi request DTO

```json
{
  "restaurantName": "Gezgen Bistro & Bar",
  "menu": [
    {
      "id": "product-id",
      "name": "Tavuk Şiş",
      "price": 280,
      "category": "Ana Yemek"
    }
  ],
  "rules": [
    "Menüde olmayan ürünler servis edilmez.",
    "Fiyat bilgisi yalnızca verilen menüye göre söylenir."
  ],
  "customerMessage": "Tavuk şişin yanında ne gider?"
}
```

## 13.4. HttpClient kullan

Program.cs:

```csharp
builder.Services.AddHttpClient<IAiWaiterClient, AiWaiterClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AiWaiterApi:BaseUrl"]!);
    client.Timeout = TimeSpan.FromSeconds(10);
});
```

appsettings:

```json
{
  "AiWaiterApi": {
    "BaseUrl": "http://localhost:7001"
  }
}
```

## 13.5. AiWaiterApi hata yönetimi

AiWaiterApi cevap vermezse fallback:

```text
Şu anda yapay zeka garson yanıt veremiyor. Menüyü inceleyerek sipariş verebilirsiniz.
```

Response:

```json
{
  "reply": "Şu anda yapay zeka garson yanıt veremiyor. Menüyü inceleyerek sipariş verebilirsiniz.",
  "source": "fallback",
  "usedModel": false
}
```

---

# 14. Validation sistemini standartlaştır

Manuel kontroller dağılabilir. Tercihen FluentValidation kullanılabilir.

Örnek:

```csharp
public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.RestaurantId).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Price).GreaterThan(0);
    }
}
```

İlk aşamada FluentValidation yoksa service içinde net kontrollerle ilerle.

Checklist:

```text
[ ] Boş GUID kontrolü
[ ] Boş string kontrolü
[ ] Price > 0
[ ] Quantity > 0
[ ] Email formatı
[ ] Password minimum uzunluk
[ ] Role whitelist
```

---

# 15. Global error handling ekle

Response formatı standart olmalı:

```json
{
  "message": "Bu islem icin giris yapmalisiniz.",
  "code": "unauthorized",
  "details": null
}
```

## 15.1. Standart hata cevapları

```text
400 bad_request
401 unauthorized
403 forbidden
404 not_found
409 conflict
500 internal_error
```

Örnek:

```json
{
  "message": "Product was not found.",
  "code": "not_found",
  "details": null
}
```

## 15.2. Exception middleware

Amaç:

```text
Controller içinde try-catch kalabalığı olmasın.
Exception middleware tüm hataları tek formatta dönsün.
```

Checklist:

```text
[ ] Unauthorized standart dönüyor
[ ] Forbidden standart dönüyor
[ ] Validation hataları standart dönüyor
[ ] NotFound standart dönüyor
[ ] Beklenmeyen hata 500 dönüyor
[ ] Production’da stack trace dönmüyor
```

---

# 16. Logging ekle

Loglanması gereken olaylar:

```text
User registered
User login success/fail
Order created
Order status changed
Admin product created/updated/deleted
AiWaiterApi request failed
Forbidden restaurant access attempt
```

Örnek:

```csharp
_logger.LogWarning(
    "Forbidden restaurant access. UserRestaurantId={UserRestaurantId}, RequestedRestaurantId={RequestedRestaurantId}",
    userRestaurantId,
    requestedRestaurantId);
```

Checklist:

```text
[ ] Kritik auth olayları loglanıyor
[ ] Order create loglanıyor
[ ] Status update loglanıyor
[ ] Forbidden access loglanıyor
[ ] AiWaiterApi hata loglanıyor
[ ] Şifre/token loglanmıyor
```

---

# 17. Swagger’ı backend test merkezi yap

Swagger’da endpoint grupları anlaşılır olmalı:

```text
Auth
Admin Categories
Admin Products
Admin Tables
Menu
Orders
Cashier
AI Waiter
Recommendation
```

JWT Authorize çalışmalı. Protected endpointlerde kilit görünmelidir.

Checklist:

```text
[ ] Swagger açılıyor
[ ] Authorize butonu var
[ ] Sadece token girince çalışıyor
[ ] Protected endpointler kilitli
[ ] DTO örnekleri anlaşılır
[ ] Error response schema görülebiliyor
```

---

# 18. Manuel Swagger test planı

## 18.1. Auth testleri

| Test | Beklenen |
|---|---:|
| Aktif restaurant ile register | 201 |
| Pasif restaurant ile register | 400 |
| Olmayan restaurant ile register | 400 |
| Aynı email ile register | 409 veya 400 |
| Doğru login | 200 |
| Yanlış şifre | 401 |
| Token yokken admin endpoint | 401 |
| Token ile admin endpoint | 200 |

## 18.2. Admin category testleri

| Test | Beklenen |
|---|---:|
| Category create | 201 |
| Category list | 200 |
| Category update | 200 |
| Category delete | 204 |
| Boş name | 400 |
| Başka restaurantId | 403 |

## 18.3. Admin product testleri

| Test | Beklenen |
|---|---:|
| Product create | 201 |
| Product list | 200 |
| Product detail | 200 |
| Price 0 | 400 |
| Category başka restorana ait | 400/403 |
| Product update | 200 |
| Product passive | 200 |
| Product delete | 204 |

## 18.4. Table testleri

| Test | Beklenen |
|---|---:|
| Table create | 201 |
| Table list | 200 |
| QR URL var mı | 200 |
| Table update | 200 |
| Table delete | 204 |
| Başka restoran table erişimi | 403 |

## 18.5. Public menu testleri

| Test | Beklenen |
|---|---:|
| Aktif restoran menüsü | 200 |
| Pasif restoran | 404 veya 400 |
| Aktif ürünler geliyor | 200 |
| Pasif ürün görünmüyor | 200 |
| Başka restoran ürünü product detail | 404 |

## 18.6. Order testleri

| Test | Beklenen |
|---|---:|
| Geçerli order | 201 |
| Boş items | 400 |
| Quantity 0 | 400 |
| Product başka restorandan | 400/403 |
| Table başka restorandan | 400/403 |
| Pasif product | 400 |
| Backend fiyat hesaplıyor | DB’de doğru total |
| Order status Pending | DB’de Pending |

## 18.7. Cashier testleri

| Test | Beklenen |
|---|---:|
| Orders list | 200 |
| Active orders | 200 |
| Status Pending → Preparing | 200 |
| Preparing → Ready | 200 |
| Ready → Served | 200 |
| Cancelled → Preparing | 400 |
| Başka restoran order status update | 403 |

## 18.8. AI Waiter testleri

| Test | Beklenen |
|---|---:|
| “Çorba var mı?” menüde yoksa | rule, usedModel false |
| “Limonata kaç TL?” | rule, usedModel false |
| “Ne önerirsiniz?” | model, usedModel true |
| Menü dışı ürün önerilirse | fallback |
| AiWaiterApi kapalıysa | fallback response |
| Büyük menüde timeout yok | 200 veya controlled fallback |

---

# 19. DBeaver ile DB doğrulama sorguları

## 19.1. Restoran kontrol

```sql
SELECT 
    "RestaurantId",
    "Name",
    "Slug",
    "IsActive"
FROM public."Restaurants";
```

## 19.2. Ürün kontrol

```sql
SELECT 
    "ProductId",
    "RestaurantId",
    "CategoryId",
    "Name",
    "Price",
    "IsActive"
FROM public."Products";
```

## 19.3. Sipariş toplam kontrol

```sql
SELECT 
    "OrderId",
    "RestaurantId",
    "TableId",
    "TotalAmount",
    "Status",
    "CreatedAtUtc"
FROM public."Orders"
ORDER BY "CreatedAtUtc" DESC;
```

## 19.4. Sipariş kalemi kontrol

```sql
SELECT 
    "OrderItemId",
    "OrderId",
    "ProductId",
    "Quantity",
    "UnitPrice",
    "LineTotal"
FROM public."OrderItems"
ORDER BY "OrderItemId" DESC;
```

## 19.5. Kullanıcı kontrol

```sql
SELECT 
    "UserId",
    "RestaurantId",
    "FullName",
    "Email",
    "Role"
FROM public."Users";
```

---

# 20. Otomasyon testleri yaz

Swagger manuel test içindir. Profesyonel backend’de otomasyon testi de gerekir.

## 20.1. Unit test yazılacak servisler

```text
AuthService
OrderService
ProductService
CategoryService
TableService
CashierOrderService
AiWaiterIntegrationService
```

## 20.2. OrderService testleri

```text
Should_Create_Order_With_Backend_Calculated_Total
Should_Reject_Product_From_Another_Restaurant
Should_Reject_Table_From_Another_Restaurant
Should_Reject_Inactive_Product
Should_Reject_Empty_Items
Should_Reject_Invalid_Quantity
```

## 20.3. AuthService testleri

```text
Should_Register_User_For_Active_Restaurant
Should_Reject_Register_For_Inactive_Restaurant
Should_Reject_Duplicate_Email
Should_Login_With_Valid_Credentials
Should_Reject_Invalid_Password
```

Checklist:

```text
[ ] Unit test projesi var
[ ] Kritik servisler test ediliyor
[ ] Test data izole
[ ] CI içinde test çalışıyor
```

---

# 21. Integration test mantığı

En azından şu akış integration test olarak düşünülmelidir:

```text
1. Demo restaurant oluştur
2. Admin register
3. Login
4. Category oluştur
5. Product oluştur
6. Table oluştur
7. Public menu çağır
8. Order oluştur
9. Cashier order list çağır
10. Order status update et
```

Bu test geçiyorsa backend MVP omurgası sağlamdır.

Checklist:

```text
[ ] API uçtan uca çalışıyor
[ ] Auth token alınıyor
[ ] Protected endpointlere token ile erişiliyor
[ ] Order DB’ye yazılıyor
[ ] Cashier order görüyor
[ ] Status güncelleniyor
```

---

# 22. Seed data ekle

Development ortamı için demo veri işini kolaylaştırır.

Seed içinde:

```text
Demo Restaurant
Demo Admin
3 Category
8 Product
3 Table
Tag örnekleri
```

Dikkat:

```text
Production’da otomatik demo admin oluşturma.
Seed işlemini development environment ile sınırla.
```

Checklist:

```text
[ ] Development seed var
[ ] Demo restaurant var
[ ] Demo admin var
[ ] Demo category/product/table var
[ ] Production’da seed kapalı
```

---

# 23. Security checklist

Backend tamamlanmadan şu liste bitmelidir:

```text
[ ] Password hash var
[ ] JWT secret appsettings veya env üzerinden geliyor
[ ] Admin endpointlerinde [Authorize] var
[ ] Role kontrolü gereken yerde var
[ ] Token içindeki restaurantId kontrol ediliyor
[ ] Frontend’den fiyat alınmıyor
[ ] Başka restoran verisine erişim engelleniyor
[ ] Public endpointler sadece aktif verileri dönüyor
[ ] Delete işlemleri geçmiş siparişi bozmuyor
[ ] Error response standart
[ ] Swagger production’da gerekirse kapatılıyor
[ ] Şifre/token loglanmıyor
[ ] CORS ayarı kontrol edilmiş
```

---

# 24. Performans ve sorgu kalitesi

Dikkat edilmesi gerekenler:

```text
AsNoTracking() read-only sorgularda kullan.
Include zincirlerini abartma.
N+1 query oluşmasın.
RestaurantId indexlenmiş olsun.
Product.RestaurantId indexli olsun.
Order.RestaurantId indexli olsun.
Order.CreatedAtUtc indexli olsun.
```

Örnek:

```csharp
var products = await _db.Products
    .AsNoTracking()
    .Where(x => x.RestaurantId == restaurantId && x.IsActive)
    .ToListAsync();
```

Checklist:

```text
[ ] Liste sorgularında AsNoTracking var
[ ] Gereksiz Include yok
[ ] RestaurantId indexli
[ ] Order CreatedAtUtc indexli
[ ] Büyük listelerde pagination düşünülmüş
```

---

# 25. API response standartlaştır

Liste endpointleri:

```json
[
  {
    "productId": "...",
    "name": "Tavuk Şiş",
    "price": 280
  }
]
```

Create endpointleri:

```http
201 Created
```

Response:

```json
{
  "productId": "...",
  "name": "Tavuk Şiş"
}
```

Delete:

```http
204 No Content
```

Validation error:

```json
{
  "message": "Price must be greater than zero.",
  "code": "bad_request",
  "details": null
}
```

Checklist:

```text
[ ] 200 liste ve detay için kullanılıyor
[ ] 201 create için kullanılıyor
[ ] 204 delete için kullanılıyor
[ ] 400 validation için kullanılıyor
[ ] 401 auth yok için kullanılıyor
[ ] 403 yetki yok için kullanılıyor
[ ] 404 bulunamadı için kullanılıyor
[ ] 409 duplicate/conflict için kullanılıyor
```

---

# 26. Git branch ve commit düzeni

Bu kadar backend işini tek commit’e yığma.

Önerilen branchler:

```bash
git checkout -b feature/backend-auth-hardening
git checkout -b feature/order-service-validation
git checkout -b feature/cashier-orders
git checkout -b feature/ai-waiter-integration
git checkout -b feature/backend-tests
```

Commit örnekleri:

```bash
git commit -m "Add restaurant-based authorization checks"
git commit -m "Calculate order totals on backend"
git commit -m "Add cashier order status endpoints"
git commit -m "Integrate AiWaiterApi client"
git commit -m "Add backend service tests"
```

Checklist:

```text
[ ] Her büyük iş ayrı branch
[ ] Her mantıklı adım ayrı commit
[ ] Commit mesajı açık
[ ] Build geçmeden push yok
[ ] Test geçmeden merge yok
```

---

# 27. Backend tamamlandı demek için final kabul kriterleri

| Alan | Kabul kriteri |
|---|---|
| Auth | Register/login/JWT çalışıyor |
| Authorization | Admin endpointleri token istiyor |
| Restaurant isolation | Başka restoran verisine erişilemiyor |
| Admin CRUD | Category/Product/Table tam çalışıyor |
| Menu API | Public menü aktif verileri dönüyor |
| Orders | Backend fiyat hesaplıyor |
| Cashier | Sipariş listeleme ve status update çalışıyor |
| AI Waiter | AiWaiterApi entegrasyonu fallback ile çalışıyor |
| Error handling | Standart hata response var |
| Swagger | Tüm endpointler test edilebilir |
| DB | Migration ve seed düzgün |
| Tests | Kritik servis testleri var |
| Build | dotnet build hatasız |
| Run | PostgreSQL ile sorunsuz çalışıyor |

Final checklist:

```text
[ ] Docker/PostgreSQL modunda test edildi
[ ] Swagger testleri tamamlandı
[ ] DBeaver DB doğrulaması yapıldı
[ ] Negative testler geçildi
[ ] RestaurantId izolasyonu test edildi
[ ] Fiyat manipülasyonu test edildi
[ ] Build başarılı
[ ] Git commit hazır
```

---

# 28. En doğru çalışma sırası

Bunu birebir sırayla uygula:

```text
1. Build ve DB bağlantısını garantiye al
2. Entity ve migration yapısını kontrol et
3. Auth/JWT/Authorize sistemini sağlamlaştır
4. CurrentUserService ekle
5. RestaurantId yetki kontrolü ekle
6. Admin Category CRUD testlerini bitir
7. Admin Product CRUD testlerini bitir
8. Admin Table/QR testlerini bitir
9. Public Menu endpointlerini test et
10. OrderService fiyat ve doğrulama testlerini bitir
11. Cashier order status endpointlerini ekle
12. AiWaiterApi client entegrasyonunu ekle
13. Error handling ve logging’i standartlaştır
14. Swagger test senaryolarını tamamla
15. Unit/integration testleri yaz
16. Git commit/push yap
```

## Son backend prensibi

Bu projede backend’in ana kuralı:

```text
Frontend veri gönderir.
Backend doğrular.
Backend karar verir.
Backend hesaplar.
Backend kaydeder.
```

Frontend’e bırakılmaması gereken üç kritik alan:

```text
Fiyat
Restaurant yetkisi
Ürün/masa doğrulaması
```

Bu çizgi korunursa AI Menü backend’i gerçek restoran kullanımına daha yakın, güvenli ve sürdürülebilir bir yapıya ulaşır.
